import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  printer: {
    discover: () => ipcRenderer.invoke('printer:discover'),
    connect: (deviceId: string) => ipcRenderer.invoke('printer:connect', deviceId),
    disconnect: () => ipcRenderer.invoke('printer:disconnect'),
    getInfo: () => ipcRenderer.invoke('printer:getInfo'),
    print: (imageData: Buffer, options: any) => ipcRenderer.invoke('printer:print', imageData, options),
    setDensity: (density: number) => ipcRenderer.invoke('printer:setDensity', density),
    setLabelType: (labelType: number) => ipcRenderer.invoke('printer:setLabelType', labelType),
  },
  system: {
    getFonts: () => ipcRenderer.invoke('system:getFonts'),
  },
})
