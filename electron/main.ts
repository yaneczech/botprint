import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { NiimbotPrinter } from './niimbot/printer'

const execAsync = promisify(exec)

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

// Get system fonts
ipcMain.handle('system:getFonts', async () => {
  try {
    const platform = process.platform
    let fonts: string[] = []

    if (platform === 'darwin') {
      // macOS
      const { stdout } = await execAsync('system_profiler SPFontsDataType -json')
      const data = JSON.parse(stdout)
      const fontData = data.SPFontsDataType || []
      fonts = fontData
        .map((font: any) => font._name || font.name)
        .filter((name: string) => name && !name.startsWith('.'))
        .sort()
    } else if (platform === 'win32') {
      // Windows
      const { stdout } = await execAsync('powershell "Get-ItemProperty -Path \\"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts\\" | Select-Object -ExpandProperty PSChildName"')
      fonts = stdout
        .split('\n')
        .map(line => line.trim().replace(/(Regular|Bold|Italic).*$/, '').trim())
        .filter(name => name.length > 0)
        .filter((name, index, self) => self.indexOf(name) === index)
        .sort()
    } else {
      // Linux
      const { stdout } = await execAsync('fc-list : family | sort -u')
      fonts = stdout
        .split('\n')
        .map(line => line.trim())
        .filter(name => name.length > 0)
        .sort()
    }

    return fonts
  } catch (error) {
    console.error('Error getting system fonts:', error)
    // Return fallback fonts
    return [
      'Arial',
      'Helvetica',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Verdana',
    ]
  }
})
