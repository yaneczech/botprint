export {}

declare global {
  interface Window {
    electronAPI: {
      printer: {
        discover: () => Promise<any[]>
        connect: (deviceId: string) => Promise<boolean>
        disconnect: () => Promise<void>
        getInfo: () => Promise<any>
        print: (imageData: Buffer, options: any) => Promise<boolean>
        setDensity: (density: number) => Promise<boolean>
        setLabelType: (labelType: number) => Promise<boolean>
      }
      system: {
        getFonts: () => Promise<string[]>
      }
    }
    labelDesigner?: {
      addText: () => void
      addRectangle: () => void
      addCircle: () => void
      importImage: () => void
      getCanvas: () => any
    }
  }
}
