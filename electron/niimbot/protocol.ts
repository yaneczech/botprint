/**
 * Niimbot Printer Protocol Implementation
 * Based on reverse-engineered Niimbot protocol
 */

export class NiimbotProtocol {
  private readonly PACKET_START = 0x55
  private readonly PACKET_END = 0xAA

  // Command types
  private readonly CMD_CONNECT = 0x01
  private readonly CMD_GET_INFO = 0x40
  private readonly CMD_GET_RFID = 0x1A
  private readonly CMD_SET_DENSITY = 0x21
  private readonly CMD_SET_LABEL_TYPE = 0x23
  private readonly CMD_START_PRINT = 0x01
  private readonly CMD_END_PRINT = 0xF3
  private readonly CMD_START_PAGE = 0x03
  private readonly CMD_END_PAGE = 0xE3
  private readonly CMD_IMAGE_DATA = 0x85
  private readonly CMD_GET_BATTERY = 0x50
  private readonly CMD_GET_MODEL = 0x40
  private readonly CMD_GET_SERIAL = 0x44
  private readonly CMD_GET_FIRMWARE = 0x3E

  buildPacket(command: number, data: Buffer = Buffer.alloc(0)): Buffer {
    const length = data.length + 3
    const packet = Buffer.alloc(length + 3)

    packet[0] = this.PACKET_START
    packet[1] = command
    packet[2] = data.length

    if (data.length > 0) {
      data.copy(packet, 3)
    }

    // Calculate checksum
    let checksum = 0
    for (let i = 1; i < packet.length - 2; i++) {
      checksum ^= packet[i]
    }

    packet[packet.length - 2] = checksum
    packet[packet.length - 1] = this.PACKET_END

    return packet
  }

  buildConnectCommand(): Buffer {
    return this.buildPacket(this.CMD_CONNECT)
  }

  buildGetModelCommand(): Buffer {
    return this.buildPacket(this.CMD_GET_MODEL)
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
