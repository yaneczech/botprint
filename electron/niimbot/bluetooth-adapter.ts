import { PrinterDevice } from './printer'

/**
 * Bluetooth adapter for Niimbot printers
 * Uses @abandonware/noble for BLE communication
 */
export class BluetoothAdapter {
  private noble: any = null
  private peripheral: any = null
  private writeCharacteristic: any = null
  private notifyCharacteristic: any = null
  private responseBuffer: Buffer = Buffer.alloc(0)
  private responseResolve: ((value: Buffer) => void) | null = null

  // Niimbot Bluetooth service and characteristic UUIDs
  private readonly SERVICE_UUID = 'ff000000100080008000805f9b34fb'
  private readonly CHAR_WRITE_UUID = 'ff020000100080008000805f9b34fb'
  private readonly CHAR_NOTIFY_UUID = 'ff010000100080008000805f9b34fb'

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
          devices.push({
            id: peripheral.id,
            name: name || 'Unknown Niimbot',
            type: 'bluetooth',
            peripheral // Store for later connection
          })
        }
      })
    })
  }

  async connect(deviceId: string): Promise<boolean> {
    if (!this.noble || !this.peripheral) {
      console.error('Device not found for connection')
      return false
    }

    try {
      console.log(`Connecting to ${deviceId}...`)

      // Connect to peripheral
      await this.peripheral.connectAsync()
      console.log('Connected to peripheral')

      // Discover services and characteristics
      const { characteristics } = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync(
        [this.SERVICE_UUID],
        [this.CHAR_WRITE_UUID, this.CHAR_NOTIFY_UUID]
      )

      // Find write and notify characteristics
      this.writeCharacteristic = characteristics.find((c: any) =>
        c.uuid === this.CHAR_WRITE_UUID.replace(/-/g, '')
      )
      this.notifyCharacteristic = characteristics.find((c: any) =>
        c.uuid === this.CHAR_NOTIFY_UUID.replace(/-/g, '')
      )

      if (!this.writeCharacteristic || !this.notifyCharacteristic) {
        console.error('Required characteristics not found')
        return false
      }

      // Subscribe to notifications
      await this.notifyCharacteristic.subscribeAsync()
      this.notifyCharacteristic.on('data', (data: Buffer) => {
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
        this.writeCharacteristic = null
        this.notifyCharacteristic = null
        console.log('Disconnected from printer')
      } catch (error) {
        console.error('Disconnect error:', error)
      }
    }
  }

  async sendData(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.writeCharacteristic) {
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

        this.writeCharacteristic.write(data, false, (error: any) => {
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

  setPeripheral(peripheral: any): void {
    this.peripheral = peripheral
  }
}
