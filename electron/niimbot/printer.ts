import { BluetoothAdapter } from './bluetooth-adapter'
import { NiimbotProtocol } from './protocol'

export interface PrinterDevice {
  id: string
  name: string
  type: 'bluetooth' | 'usb'
}

export interface PrinterInfo {
  model: string
  serialNumber: string
  firmwareVersion: string
  batteryLevel: number
  paperType: number
}

export interface PrintOptions {
  density?: number
  labelType?: number
  copies?: number
}

export class NiimbotPrinter {
  private adapter: BluetoothAdapter
  private protocol: NiimbotProtocol
  private connected: boolean = false
  private deviceId: string | null = null

  constructor() {
    this.adapter = new BluetoothAdapter()
    this.protocol = new NiimbotProtocol()
  }

  async discover(): Promise<PrinterDevice[]> {
    return await this.adapter.discover()
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      // Adapter will get peripheral from its internal map
      const success = await this.adapter.connect(deviceId)
      if (success) {
        this.connected = true
        this.deviceId = deviceId
        console.log('Bluetooth connection established successfully')
        // Don't send connect command - B18/N1 may not need it or may not respond
        // Will send commands when actually needed (getInfo, print, etc.)
      }
      return success
    } catch (error) {
      console.error('Connection error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.adapter.disconnect()
      this.connected = false
      this.deviceId = null
    }
  }

  async getInfo(): Promise<PrinterInfo | null> {
    if (!this.connected) return null

    try {
      // First try heartbeat to check if printer responds
      console.log('Testing with HEARTBEAT command (0xDC)...')
      const heartbeatData = await this.sendCommand(this.protocol.buildHeartbeatCommand())
      console.log('Heartbeat response:', heartbeatData.toString('hex'))

      // Get printer info using Niimbot protocol
      const infoData = await this.sendCommand(this.protocol.buildGetInfoCommand())
      const serialData = await this.sendCommand(this.protocol.buildGetSerialCommand())
      const batteryData = await this.sendCommand(this.protocol.buildGetBatteryCommand())
      const firmwareData = await this.sendCommand(this.protocol.buildGetFirmwareCommand())

      return {
        model: this.protocol.parseModelResponse(infoData),
        serialNumber: this.protocol.parseSerialResponse(serialData),
        firmwareVersion: this.protocol.parseFirmwareResponse(firmwareData),
        batteryLevel: this.protocol.parseBatteryResponse(batteryData),
        paperType: 0,
      }
    } catch (error) {
      console.error('Error getting printer info:', error)
      return null
    }
  }

  async setDensity(density: number): Promise<boolean> {
    if (!this.connected) return false

    try {
      const command = this.protocol.buildSetDensityCommand(density)
      await this.sendCommand(command)
      return true
    } catch (error) {
      console.error('Error setting density:', error)
      return false
    }
  }

  async setLabelType(labelType: number): Promise<boolean> {
    if (!this.connected) return false

    try {
      const command = this.protocol.buildSetLabelTypeCommand(labelType)
      await this.sendCommand(command)
      return true
    } catch (error) {
      console.error('Error setting label type:', error)
      return false
    }
  }

  async print(imageData: Buffer, options: PrintOptions = {}): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Printer not connected')
    }

    try {
      // Set density if provided
      if (options.density !== undefined) {
        await this.setDensity(options.density)
      }

      // Set label type if provided
      if (options.labelType !== undefined) {
        await this.setLabelType(options.labelType)
      }

      // Start print job
      const startCommand = this.protocol.buildStartPrintCommand()
      await this.sendCommand(startCommand)

      // Send image data in chunks
      const chunks = this.protocol.buildImageDataCommands(imageData)
      for (const chunk of chunks) {
        await this.sendCommand(chunk)
      }

      // End print job
      const endCommand = this.protocol.buildEndPrintCommand()
      await this.sendCommand(endCommand)

      // Handle multiple copies
      const copies = options.copies || 1
      if (copies > 1) {
        for (let i = 1; i < copies; i++) {
          await this.sendCommand(startCommand)
          for (const chunk of chunks) {
            await this.sendCommand(chunk)
          }
          await this.sendCommand(endCommand)
        }
      }

      return true
    } catch (error) {
      console.error('Print error:', error)
      throw error
    }
  }

  private async sendCommand(command: Buffer): Promise<Buffer> {
    if (!this.connected) {
      throw new Error('Printer not connected')
    }
    return await this.adapter.sendData(command)
  }
}
