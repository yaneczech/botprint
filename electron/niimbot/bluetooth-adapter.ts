import { PrinterDevice } from './printer'

/**
 * Bluetooth adapter for Niimbot printers
 * Uses @abandonware/noble for BLE communication
 */
export class BluetoothAdapter {
  private noble: any = null
  private peripheral: any = null
  private characteristic: any = null
  private responseBuffer: Buffer = Buffer.alloc(0)
  private responseResolve: ((value: Buffer) => void) | null = null
  private peripheralMap: Map<string, any> = new Map() // Store peripherals by ID

  // Niimbot Bluetooth service and characteristic UUIDs
  // Source: https://github.com/MultiMote/niimbot-web-ble-terminal
  private readonly SERVICE_UUID = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
  private readonly CHAR_UUID = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'

  constructor() {
    try {
      // Dynamically import noble
      this.noble = require('@abandonware/noble')
    } catch (error) {
      console.error('Noble not installed. Install with: npm install @abandonware/noble')
    }
  }

  async discover(): Promise<PrinterDevice[]> {
    if (!this.noble) {
      console.error('Noble not available')
      return []
    }

    return new Promise((resolve) => {
      const devices: PrinterDevice[] = []
      this.peripheralMap.clear() // Clear old peripherals

      const timeout = setTimeout(() => {
        this.noble.stopScanning()
        resolve(devices)
      }, 10000) // 10 second scan

      this.noble.on('stateChange', async (state: string) => {
        if (state === 'poweredOn') {
          console.log('Starting Bluetooth scan for Niimbot printers...')
          await this.noble.startScanningAsync([], false)
        }
      })

      this.noble.on('discover', (peripheral: any) => {
        const name = peripheral.advertisement.localName

        // Filter for Niimbot devices (N1, B1, B18, B21, D11, D110, etc.)
        if (name && (name.includes('N1') || name.includes('B1') || name.includes('B18') ||
                     name.includes('B21') || name.includes('D11') ||
                     name.includes('D110') || name.toLowerCase().includes('niimbot'))) {
          console.log(`Found Niimbot printer: ${name}`)

          // Store peripheral in map (not sent over IPC)
          this.peripheralMap.set(peripheral.id, peripheral)

          // Only send serializable data
          devices.push({
            id: peripheral.id,
            name: name || 'Unknown Niimbot',
            type: 'bluetooth'
          })
        }
      })
    })
  }

  async connect(deviceId: string): Promise<boolean> {
    // Get peripheral from map
    const peripheral = this.peripheralMap.get(deviceId)
    if (!this.noble || !peripheral) {
      console.error('Device not found for connection')
      return false
    }

    try {
      console.log(`Connecting to ${deviceId}...`)

      // Store current peripheral
      this.peripheral = peripheral

      // Connect to peripheral
      await peripheral.connectAsync()
      console.log('Connected to peripheral')

      // Discover Niimbot service and characteristic
      const { characteristics } = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync(
        [this.SERVICE_UUID],
        [this.CHAR_UUID]
      )

      console.log('Found characteristics:', characteristics.map((c: any) => c.uuid))

      // Find our characteristic
      this.characteristic = characteristics.find((c: any) =>
        c.uuid.toLowerCase().replace(/-/g, '') === this.CHAR_UUID.toLowerCase().replace(/-/g, '')
      )

      if (!this.characteristic) {
        console.error('Niimbot characteristic not found')
        return false
      }

      console.log('Found Niimbot characteristic:', this.characteristic.uuid)

      // Subscribe to notifications
      await this.characteristic.subscribeAsync()
      console.log('Subscribed to notifications')

      this.characteristic.on('data', (data: Buffer) => {
        console.log('*** RAW DATA RECEIVED ***:', data.toString('hex'))
        this.handleNotification(data)
      })

      console.log('Successfully connected to Niimbot printer')
      return true
    } catch (error) {
      console.error('Connection error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.peripheral) {
      try {
        await this.peripheral.disconnectAsync()
        this.peripheral = null
        this.characteristic = null
        console.log('Disconnected from printer')
      } catch (error) {
        console.error('Disconnect error:', error)
      }
    }
  }

  async sendData(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.characteristic) {
        reject(new Error('Not connected'))
        return
      }

      this.responseResolve = resolve
      this.responseBuffer = Buffer.alloc(0)

      // Set timeout for response
      const timeout = setTimeout(() => {
        if (this.responseResolve) {
          this.responseResolve = null
          reject(new Error('Response timeout'))
        }
      }, 5000)

      try {
        console.log('Sending:', data.toString('hex'))

        this.characteristic.write(data, false, (error: any) => {
          if (error) {
            clearTimeout(timeout)
            reject(error)
          }
          // Response will come through notification handler
        })
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  private handleNotification(data: Buffer): void {
    console.log('Received:', data.toString('hex'))
    this.responseBuffer = Buffer.concat([this.responseBuffer, data])

    // Check if we have a complete response (ends with 0xAA)
    if (this.responseBuffer.length > 0 &&
        this.responseBuffer[this.responseBuffer.length - 1] === 0xAA) {
      if (this.responseResolve) {
        this.responseResolve(this.responseBuffer)
        this.responseResolve = null
      }
      this.responseBuffer = Buffer.alloc(0)
    }
  }
}
