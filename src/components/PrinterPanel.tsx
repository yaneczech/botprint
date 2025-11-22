import { useState, useEffect } from 'react'

interface PrinterPanelProps {
  connected: boolean
  onConnectionChange: (connected: boolean) => void
}

interface PrinterInfo {
  model: string
  serialNumber: string
  firmwareVersion: string
  batteryLevel: number
}

export default function PrinterPanel({ connected, onConnectionChange }: PrinterPanelProps) {
  const [devices, setDevices] = useState<any[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [printerInfo, setPrinterInfo] = useState<PrinterInfo | null>(null)
  const [density, setDensity] = useState(3)
  const [copies, setCopies] = useState(1)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const handleDiscover = async () => {
    setIsDiscovering(true)
    try {
      const foundDevices = await (window as any).electronAPI.printer.discover()
      setDevices(foundDevices)
    } catch (error) {
      console.error('Discovery error:', error)
      alert('Chyba při hledání tiskáren')
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedDevice) return

    try {
      const success = await (window as any).electronAPI.printer.connect(selectedDevice)
      if (success) {
        onConnectionChange(true)
        const info = await (window as any).electronAPI.printer.getInfo()
        setPrinterInfo(info)
      } else {
        alert('Nelze se připojit k tiskárně')
      }
    } catch (error) {
      console.error('Connection error:', error)
      alert('Chyba připojení')
    }
  }

  const handleDisconnect = async () => {
    try {
      await (window as any).electronAPI.printer.disconnect()
      onConnectionChange(false)
      setPrinterInfo(null)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const handlePrint = async () => {
    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) {
      alert('Žádný design k tisku')
      return
    }

    setIsPrinting(true)
    try {
      // Convert canvas to image data
      const dataURL = canvas.toDataURL('image/png')
      const base64 = dataURL.split(',')[1]
      const imageData = Buffer.from(base64, 'base64')

      await (window as any).electronAPI.printer.print(imageData, {
        density,
        copies,
      })

      alert('Tisk dokončen!')
    } catch (error) {
      console.error('Print error:', error)
      alert('Chyba při tisku')
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold mb-3">Tiskárna</h3>

      {!connected ? (
        <div className="space-y-4">
          <button
            onClick={handleDiscover}
            disabled={isDiscovering}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isDiscovering ? 'Hledám...' : '🔍 Najít tiskárny'}
          </button>

          {devices.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Dostupné tiskárny:
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
              >
                <option value="">Vyberte tiskárnu...</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleConnect}
                disabled={!selectedDevice}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                🔗 Připojit
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                ✓ Připojeno
              </span>
              <button
                onClick={handleDisconnect}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Odpojit
              </button>
            </div>

            {printerInfo && (
              <div className="text-xs text-gray-600 space-y-1">
                <div>Model: {printerInfo.model}</div>
                <div>SN: {printerInfo.serialNumber}</div>
                <div>FW: {printerInfo.firmwareVersion}</div>
                <div>Baterie: {printerInfo.batteryLevel}%</div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Hustota tisku (1-5):
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={density}
              onChange={(e) => setDensity(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm">{density}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Počet kopií:
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {isPrinting ? '⌛ Tisknu...' : '🖨️ Tisknout'}
          </button>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium mb-2">Podporované formáty:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ SVG vektorové soubory</li>
          <li>✓ Bitmapové obrázky (PNG, JPG)</li>
          <li>✓ Vlastní fonty</li>
          <li>✓ Excel tabulky (.xlsx)</li>
        </ul>
      </div>
    </div>
  )
}
