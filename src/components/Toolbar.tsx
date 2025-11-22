import { useState } from 'react'
import { FileText, FolderOpen, Save, Image, FileSpreadsheet, TypeIcon } from 'lucide-react'
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

  const handleImportImage = () => {
    ;(window as any).labelDesigner?.importImage()
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-1">
          {/* File operations */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
            <button
              onClick={handleNew}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              title="Nový"
            >
              <FileText size={18} />
              <span>Nový</span>
            </button>
            <button
              onClick={handleLoad}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              title="Otevřít"
            >
              <FolderOpen size={18} />
              <span>Otevřít</span>
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              title="Uložit"
            >
              <Save size={18} />
              <span>Uložit</span>
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
            <button
              onClick={handleImportImage}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              title="Importovat obrázek/SVG"
            >
              <Image size={20} />
              <span>Importovat obrázek</span>
            </button>
            <button
              onClick={() => setShowExcelImporter(true)}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              title="Importovat z Excelu"
            >
              <FileSpreadsheet size={20} />
              <span>Import z Excelu</span>
            </button>
          </div>

          {/* Fonts */}
          <div className="flex items-center">
            <button
              onClick={() => setShowFontManager(true)}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              title="Správa fontů"
            >
              <TypeIcon size={18} />
              <span>Fonty</span>
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
