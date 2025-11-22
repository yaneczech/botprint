import { useState, useEffect } from 'react'
import opentype from 'opentype.js'

interface Font {
  id: string
  name: string
  file: File
  loaded: boolean
}

interface FontManagerProps {
  onClose: () => void
}

export default function FontManager({ onClose }: FontManagerProps) {
  const [fonts, setFonts] = useState<Font[]>([])
  const [systemFonts] = useState([
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
  ])

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFonts: Font[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // Load font using opentype.js
        const arrayBuffer = await file.arrayBuffer()
        const font = opentype.parse(arrayBuffer)

        // Register font in browser
        const fontFace = new FontFace(font.names.fullName.en, arrayBuffer)
        await fontFace.load()
        document.fonts.add(fontFace)

        newFonts.push({
          id: `custom-${Date.now()}-${i}`,
          name: font.names.fullName.en || file.name,
          file,
          loaded: true,
        })
      } catch (error) {
        console.error('Error loading font:', error)
        alert(`Chyba při načítání fontu ${file.name}`)
      }
    }

    setFonts([...fonts, ...newFonts])
  }

  const handleApplyFont = (fontName: string) => {
    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontFamily', fontName)
      canvas.renderAll()
    } else {
      alert('Nejdřív vyberte textový objekt')
    }
  }

  const handleRemoveFont = (fontId: string) => {
    setFonts(fonts.filter(f => f.id !== fontId))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Správa fontů</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload custom fonts */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nahrát vlastní fonty (.ttf, .otf):
            </label>
            <input
              type="file"
              accept=".ttf,.otf"
              multiple
              onChange={handleFontUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Podporované formáty: TrueType (.ttf) a OpenType (.otf)
            </p>
          </div>

          {/* System fonts */}
          <div>
            <h3 className="text-sm font-medium mb-2">Systémové fonty:</h3>
            <div className="grid grid-cols-2 gap-2">
              {systemFonts.map((fontName) => (
                <button
                  key={fontName}
                  onClick={() => handleApplyFont(fontName)}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-left"
                  style={{ fontFamily: fontName }}
                >
                  {fontName}
                </button>
              ))}
            </div>
          </div>

          {/* Custom fonts */}
          {fonts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Vlastní fonty:</h3>
              <div className="space-y-2">
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded"
                  >
                    <button
                      onClick={() => handleApplyFont(font.name)}
                      className="flex-1 text-left hover:bg-gray-50"
                      style={{ fontFamily: font.name }}
                    >
                      {font.name}
                    </button>
                    <button
                      onClick={() => handleRemoveFont(font.id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-medium mb-2">Tip:</h4>
            <p className="text-sm text-gray-700">
              Pro aplikování fontu vyberte nejdřív textový objekt v editoru,
              poté klikněte na požadovaný font.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  )
}
