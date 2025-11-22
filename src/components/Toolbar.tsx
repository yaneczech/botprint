import { useState } from 'react'
import { FileText, FolderOpen, Save, Type, Square, Circle, Image, FileSpreadsheet, TypeIcon } from 'lucide-react'
import ExcelImporter from './ExcelImporter'
import FontManager from './FontManager'

export default function Toolbar() {
  const [showExcelImporter, setShowExcelImporter] = useState(false)
  const [showFontManager, setShowFontManager] = useState(false)

  const handleNew = () => {
    const canvas = (window as any).labelDesigner?.getCanvas()
    if (canvas) {
      canvas.clear()
      canvas.backgroundColor = '#ffffff'
      canvas.renderAll()
    }
  }

  const handleSave = () => {
    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) return

    const json = JSON.stringify(canvas.toJSON())
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'label-design.json'
    a.click()
  }

  const handleLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const json = event.target?.result as string
        const canvas = (window as any).labelDesigner?.getCanvas()
        if (canvas) {
          canvas.loadFromJSON(json, () => {
            canvas.renderAll()
          })
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  const handleAddText = () => {
    ;(window as any).labelDesigner?.addText()
  }

  const handleAddRectangle = () => {
    ;(window as any).labelDesigner?.addRectangle()
  }

  const handleAddCircle = () => {
    ;(window as any).labelDesigner?.addCircle()
  }

  const handleImportImage = () => {
    ;(window as any).labelDesigner?.importImage()
  }

  return (
    <>
      <div className="flex items-center space-x-2 flex-1">
          {/* File operations */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={handleNew}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Nový"
            >
              <FileText size={16} /> Nový
            </button>
            <button
              onClick={handleLoad}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Otevřít"
            >
              <FolderOpen size={16} /> Otevřít
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Uložit"
            >
              <Save size={16} /> Uložit
            </button>
          </div>

          {/* Add elements */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={handleAddText}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Přidat text"
            >
              <Type size={16} /> Text
            </button>
            <button
              onClick={handleAddRectangle}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Přidat obdélník"
            >
              <Square size={16} /> Obdélník
            </button>
            <button
              onClick={handleAddCircle}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Přidat kruh"
            >
              <Circle size={16} /> Kruh
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={handleImportImage}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Importovat obrázek/SVG"
            >
              <Image size={16} /> Importovat obrázek
            </button>
            <button
              onClick={() => setShowExcelImporter(true)}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Importovat z Excelu"
            >
              <FileSpreadsheet size={16} /> Import z Excelu
            </button>
          </div>

          {/* Fonts */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowFontManager(true)}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-1.5"
              title="Správa fontů"
            >
              <TypeIcon size={16} /> Fonty
            </button>
          </div>
        </div>

      {showExcelImporter && (
        <ExcelImporter onClose={() => setShowExcelImporter(false)} />
      )}

      {showFontManager && (
        <FontManager onClose={() => setShowFontManager(false)} />
      )}
    </>
  )
}
