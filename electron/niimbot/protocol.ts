/**
 * Niimbot Printer Protocol Implementation
 * Based on reverse-engineered Niimbot protocol
 */

export class NiimbotProtocol {
  private readonly PACKET_START = 0x55
  private readonly PACKET_END = 0xAA

  // Command types - Source: https://github.com/AndBondStyle/niimprint
  private readonly CMD_HEARTBEAT = 0xDC  // Status check (paper, power, etc.)
  private readonly CMD_GET_INFO = 0x40  // Get device info (density, speed, type)
  private readonly CMD_GET_RFID = 0x1A  // Read RFID tag
  private readonly CMD_GET_BATTERY = 0x50  // Get battery level
  private readonly CMD_GET_SERIAL = 0x44  // Get serial number
  private readonly CMD_GET_FIRMWARE = 0x3E  // Get firmware version
  private readonly CMD_SET_DENSITY = 0x21  // Set print density (1-5)
  private readonly CMD_SET_LABEL_TYPE = 0x23  // Set label type (1-3)
  private readonly CMD_START_PRINT = 0x01  // Start printing session
  private readonly CMD_END_PRINT = 0xF3  // End printing session
  private readonly CMD_START_PAGE = 0x03  // Start page print
  private readonly CMD_END_PAGE = 0xE3  // End page print
  private readonly CMD_IMAGE_DATA = 0x85  // Send image line data
  private readonly CMD_SET_DIMENSION = 0x13  // Set label width/height
  private readonly CMD_SET_QUANTITY = 0x15  // Set print quantity
  private readonly CMD_GET_PRINT_STATUS = 0xA3  // Get print progress

  buildPacket(command: number, data: Buffer = Buffer.alloc(0)): Buffer {
    // Format: [0x55, 0x55, command, size, data, checksum, 0xAA, 0xAA]
    // Total: 2 + 1 + 1 + N + 1 + 2 = 7 + N bytes
    const packet = Buffer.alloc(7 + data.length)

    packet[0] = this.PACKET_START
    packet[1] = this.PACKET_START  // Double start byte
    packet[2] = command
    packet[3] = data.length

    if (data.length > 0) {
      data.copy(packet, 4)
    }

    // Calculate checksum (XOR of command, size, and data)
    let checksum = command ^ data.length
    for (let i = 0; i < data.length; i++) {
      checksum ^= data[i]
    }

    packet[4 + data.length] = checksum
    packet[5 + data.length] = this.PACKET_END
    packet[6 + data.length] = this.PACKET_END  // Double end byte

    return packet
  }

  buildHeartbeatCommand(): Buffer {
    return this.buildPacket(this.CMD_HEARTBEAT)
  }

  buildGetInfoCommand(): Buffer {
    return this.buildPacket(this.CMD_GET_INFO)
  }

  buildGetSerialCommand(): Buffer {
    return this.buildPacket(this.CMD_GET_SERIAL)
  }

  buildGetBatteryCommand(): Buffer {
    return this.buildPacket(this.CMD_GET_BATTERY)
  }

  buildGetFirmwareCommand(): Buffer {
    return this.buildPacket(this.CMD_GET_FIRMWARE)
  }

  buildSetDensityCommand(density: number): Buffer {
    const data = Buffer.from([Math.max(1, Math.min(5, density))])
    return this.buildPacket(this.CMD_SET_DENSITY, data)
  }

  buildSetLabelTypeCommand(labelType: number): Buffer {
    const data = Buffer.from([labelType])
    return this.buildPacket(this.CMD_SET_LABEL_TYPE, data)
  }

  buildStartPrintCommand(): Buffer {
    return this.buildPacket(this.CMD_START_PAGE)
  }

  buildEndPrintCommand(): Buffer {
    return this.buildPacket(this.CMD_END_PAGE)
  }

  buildImageDataCommands(imageData: Buffer): Buffer[] {
    const commands: Buffer[] = []
    const maxChunkSize = 128 // Maximum data size per packet

    // Convert image to Niimbot format (1-bit bitmap)
    const processedData = this.convertToBitmap(imageData)

    // Split into chunks
    for (let i = 0; i < processedData.length; i += maxChunkSize) {
      const chunk = processedData.slice(i, Math.min(i + maxChunkSize, processedData.length))
      commands.push(this.buildPacket(this.CMD_IMAGE_DATA, chunk))
    }

    return commands
  }

  private convertToBitmap(imageData: Buffer): Buffer {
    // This is a simplified conversion
    // In practice, you'd use the Canvas API to convert the image to 1-bit bitmap
    // For now, we assume imageData is already in the correct format
    return imageData
  }

  parseModelResponse(data: Buffer): string {
    if (data.length < 4) return 'Unknown'
    try {
      return data.slice(3, data.length - 2).toString('utf-8').trim()
    } catch {
      return 'Unknown'
    }
  }

  parseSerialResponse(data: Buffer): string {
    if (data.length < 4) return 'Unknown'
    try {
      return data.slice(3, data.length - 2).toString('hex').toUpperCase()
    } catch {
      return 'Unknown'
    }
  }

  parseFirmwareResponse(data: Buffer): string {
    if (data.length < 5) return 'Unknown'
    try {
      const major = data[3]
      const minor = data[4]
      return `${major}.${minor}`
    } catch {
      return 'Unknown'
    }
  }

  parseBatteryResponse(data: Buffer): number {
    if (data.length < 4) return 0
    try {
      return data[3]
    } catch {
      return 0
    }
  }

  verifyResponse(data: Buffer): boolean {
    if (data.length < 4) return false
    if (data[0] !== this.PACKET_START) return false
    if (data[data.length - 1] !== this.PACKET_END) return false

    // Verify checksum
    let checksum = 0
    for (let i = 1; i < data.length - 2; i++) {
      checksum ^= data[i]
    }

    return checksum === data[data.length - 2]
  }
}
