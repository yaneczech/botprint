import { Settings } from 'lucide-react'
import { useState } from 'react'

interface LabelSize {
  name: string
  width: number  // in mm
  height: number // in mm
  widthPx: number  // in pixels at 203 DPI (Niimbot standard)
  heightPx: number
}

interface LabelSizeSelectProps {
  onSizeChange: (size: LabelSize) => void
  currentSize: LabelSize
}

// Common Niimbot label sizes (in mm) at 203 DPI
const LABEL_SIZES: LabelSize[] = [
  { name: '12×40mm (Cenové)', width: 12, height: 40, widthPx: 96, heightPx: 320 },
  { name: '15×30mm (Malé)', width: 15, height: 30, widthPx: 120, heightPx: 240 },
  { name: '20×30mm', width: 20, height: 30, widthPx: 160, heightPx: 240 },
  { name: '25×25mm (Čtverec)', width: 25, height: 25, widthPx: 200, heightPx: 200 },
  { name: '30×15mm', width: 30, height: 15, widthPx: 240, heightPx: 120 },
  { name: '30×20mm', width: 30, height: 20, widthPx: 240, heightPx: 160 },
  { name: '40×30mm (Standardní)', width: 40, height: 30, widthPx: 320, heightPx: 240 },
  { name: '40×50mm', width: 40, height: 50, widthPx: 320, heightPx: 400 },
  { name: '50×30mm', width: 50, height: 30, widthPx: 400, heightPx: 240 },
  { name: '50×40mm', width: 50, height: 40, widthPx: 400, heightPx: 320 },
  { name: '60×40mm (Velké)', width: 60, height: 40, widthPx: 480, heightPx: 320 },
  { name: '50×80mm (Extra velké)', width: 50, height: 80, widthPx: 400, heightPx: 640 },
]

export default function LabelSizeSelect({ onSizeChange, currentSize }: LabelSizeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSizeSelect = (size: LabelSize) => {
    onSizeChange(size)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5 border border-gray-300"
        title="Nastavení velikosti štítku"
      >
        <Settings size={16} />
        {currentSize.name}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                Velikosti štítků Niimbot
              </div>
              {LABEL_SIZES.map((size) => (
                <button
                  key={size.name}
                  onClick={() => handleSizeSelect(size)}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 flex justify-between items-center ${
                    currentSize.name === size.name ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <span>{size.name}</span>
                  <span className="text-xs text-gray-500">
                    {size.widthPx}×{size.heightPx}px
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-3 bg-gray-50 text-xs text-gray-600">
              <p className="mb-1">
                <strong>Poznámka:</strong> Niimbot tiskárny podporují pouze{' '}
                <strong>černobílý</strong> tisk.
              </p>
              <p>
                Některé modely (např. D110) podporují až 2 barvy (černá + červená).
                Většina modelů ale tiskne pouze v černé.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { LABEL_SIZES }
export type { LabelSize }
