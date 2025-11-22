import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { NiimbotPrinter } from './niimbot/printer'

let mainWindow: BrowserWindow | null = null
let printer: NiimbotPrinter | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  printer = new NiimbotPrinter()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  if (printer) {
    printer.disconnect()
  }
})

// IPC Handlers
ipcMain.handle('printer:discover', async () => {
  if (!printer) return []
  return await printer.discover()
})

ipcMain.handle('printer:connect', async (_, deviceId: string) => {
  if (!printer) return false
  return await printer.connect(deviceId)
})

ipcMain.handle('printer:disconnect', async () => {
  if (!printer) return
  await printer.disconnect()
})

ipcMain.handle('printer:getInfo', async () => {
  if (!printer) return null
  return await printer.getInfo()
})

ipcMain.handle('printer:print', async (_, imageData: Buffer, options: any) => {
  if (!printer) throw new Error('Printer not initialized')
  return await printer.print(imageData, options)
})

ipcMain.handle('printer:setDensity', async (_, density: number) => {
  if (!printer) return false
  return await printer.setDensity(density)
})

ipcMain.handle('printer:setLabelType', async (_, labelType: number) => {
  if (!printer) return false
  return await printer.setLabelType(labelType)
})
