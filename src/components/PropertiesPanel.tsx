import { useEffect, useState } from 'react'
import { fabric } from 'fabric'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import PrinterPanel from './PrinterPanel'

interface PropertiesPanelProps {
  canvas: fabric.Canvas | null
  printerConnected: boolean
  onPrinterConnectionChange: (connected: boolean) => void
}

export default function PropertiesPanel({ canvas, printerConnected, onPrinterConnectionChange }: PropertiesPanelProps) {
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const [objectType, setObjectType] = useState<string>('')

  // Text properties
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [lineHeight, setLineHeight] = useState(1.16)
  const [textAlign, setTextAlign] = useState('left')
  const [fontWeight, setFontWeight] = useState('normal')
  const [fontStyle, setFontStyle] = useState('normal')
  const [underline, setUnderline] = useState(false)

  // Shape properties
  const [fillColor, setFillColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)

  // System fonts
  const [systemFonts, setSystemFonts] = useState<string[]>([
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
  ])
  const [loadingFonts, setLoadingFonts] = useState(true)

  // Load system fonts on mount
  useEffect(() => {
    const loadSystemFonts = async () => {
      try {
        setLoadingFonts(true)
        const fontNames = await window.electronAPI.system.getFonts()
        setSystemFonts(fontNames)
      } catch (error) {
        console.error('Error loading system fonts:', error)
        // Keep default fallback fonts
      } finally {
        setLoadingFonts(false)
      }
    }

    loadSystemFonts()
  }, [])

  useEffect(() => {
    if (!canvas) return

    const handleSelection = () => {
      const active = canvas.getActiveObject()
      setSelectedObject(active)

      if (active) {
        setObjectType(active.type || '')

        if (active.type === 'i-text' || active.type === 'text') {
          const textObj = active as fabric.IText
          setFontSize(textObj.fontSize || 24)
          setFontFamily(textObj.fontFamily || 'Arial')
          setLetterSpacing((textObj.charSpacing || 0) / 10) // Fabric uses 10x scale
          setLineHeight(textObj.lineHeight || 1.16)
          setTextAlign(textObj.textAlign || 'left')
          setFontWeight(textObj.fontWeight || 'normal')
          setFontStyle(textObj.fontStyle || 'normal')
          setUnderline(textObj.underline || false)
        }

        setFillColor((active.fill as string) || '#ffffff')
        setStrokeColor((active.stroke as string) || '#000000')
        setStrokeWidth((active as any).strokeWidth || 2)
      }
    }

    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)
    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
      setObjectType('')
    })

    return () => {
      canvas.off('selection:created', handleSelection)
      canvas.off('selection:updated', handleSelection)
      canvas.off('selection:cleared')
    }
  }, [canvas])

  const updateTextProperty = (property: string, value: any) => {
    if (!selectedObject || !canvas) return
    const textObj = selectedObject as any
    textObj.set(property, value)
    canvas.renderAll()
  }

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !canvas) return
    selectedObject.set(property as any, value)
    canvas.renderAll()
  }

  return (
    <div className="h-full flex flex-col">
      {!selectedObject ? (
        <div className="p-4 text-gray-500 text-sm">
          Vyberte objekt pro úpravu vlastností
        </div>
      ) : (
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
      <h3 className="font-bold text-sm mb-4">Vlastnosti</h3>

      {/* Text properties */}
      {(objectType === 'i-text' || objectType === 'text') && (
        <>
          {/* Font family */}
          <div>
            <label className="block text-xs font-medium mb-1">Font:</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value)
                updateTextProperty('fontFamily', e.target.value)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              {systemFonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font size */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Velikost: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="120"
              value={fontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value)
                setFontSize(size)
                updateTextProperty('fontSize', size)
              }}
              className="w-full"
            />
          </div>

          {/* Letter spacing (tracking) */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Tracking: {letterSpacing * 10}
            </label>
            <input
              type="range"
              min="-50"
              max="200"
              value={letterSpacing}
              onChange={(e) => {
                const spacing = parseInt(e.target.value)
                setLetterSpacing(spacing)
                updateTextProperty('charSpacing', spacing * 10) // Fabric uses 10x scale
              }}
              className="w-full"
            />
          </div>

          {/* Line height */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Řádkový proklad: {lineHeight.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) => {
                const height = parseFloat(e.target.value)
                setLineHeight(height)
                updateTextProperty('lineHeight', height)
              }}
              className="w-full"
            />
          </div>

          {/* Text alignment */}
          <div>
            <label className="block text-xs font-medium mb-2">Zarovnání:</label>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setTextAlign('left')
                  updateTextProperty('textAlign', 'left')
                }}
                className={`flex-1 p-2 border rounded ${
                  textAlign === 'left' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <AlignLeft size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => {
                  setTextAlign('center')
                  updateTextProperty('textAlign', 'center')
                }}
                className={`flex-1 p-2 border rounded ${
                  textAlign === 'center' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <AlignCenter size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => {
                  setTextAlign('right')
                  updateTextProperty('textAlign', 'right')
                }}
                className={`flex-1 p-2 border rounded ${
                  textAlign === 'right' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <AlignRight size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => {
                  setTextAlign('justify')
                  updateTextProperty('textAlign', 'justify')
                }}
                className={`flex-1 p-2 border rounded ${
                  textAlign === 'justify' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <AlignJustify size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          {/* Text style */}
          <div>
            <label className="block text-xs font-medium mb-2">Styl:</label>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const newWeight = fontWeight === 'bold' ? 'normal' : 'bold'
                  setFontWeight(newWeight)
                  updateTextProperty('fontWeight', newWeight)
                }}
                className={`flex-1 p-2 border rounded ${
                  fontWeight === 'bold' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <Bold size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => {
                  const newStyle = fontStyle === 'italic' ? 'normal' : 'italic'
                  setFontStyle(newStyle)
                  updateTextProperty('fontStyle', newStyle)
                }}
                className={`flex-1 p-2 border rounded ${
                  fontStyle === 'italic' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <Italic size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => {
                  const newUnderline = !underline
                  setUnderline(newUnderline)
                  updateTextProperty('underline', newUnderline)
                }}
                className={`flex-1 p-2 border rounded ${
                  underline ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                <Underline size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          {/* Text color */}
          <div>
            <label className="block text-xs font-medium mb-1">Barva textu:</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value)
                  updateObjectProperty('fill', e.target.value)
                }}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value)
                  updateObjectProperty('fill', e.target.value)
                }}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
        </>
      )}

      {/* Shape properties */}
      {(objectType === 'rect' || objectType === 'circle' || objectType === 'ellipse') && (
        <>
          {/* Fill color */}
          <div>
            <label className="block text-xs font-medium mb-1">Výplň:</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value)
                  updateObjectProperty('fill', e.target.value)
                }}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value)
                  updateObjectProperty('fill', e.target.value)
                }}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Stroke color */}
          <div>
            <label className="block text-xs font-medium mb-1">Obrys:</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => {
                  setStrokeColor(e.target.value)
                  updateObjectProperty('stroke', e.target.value)
                }}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={strokeColor}
                onChange={(e) => {
                  setStrokeColor(e.target.value)
                  updateObjectProperty('stroke', e.target.value)
                }}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Stroke width */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Šířka obrysu: {strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={strokeWidth}
              onChange={(e) => {
                const width = parseInt(e.target.value)
                setStrokeWidth(width)
                updateObjectProperty('strokeWidth', width)
              }}
              className="w-full"
            />
          </div>
        </>
      )}
        </div>
      )}

      {/* Printer Panel - always visible at bottom */}
      <div className="border-t border-gray-200">
        <PrinterPanel
          connected={printerConnected}
          onConnectionChange={onPrinterConnectionChange}
        />
      </div>
    </div>
  )
}
