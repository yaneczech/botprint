import { useState, useEffect } from 'react'
import opentype from 'opentype.js'
import { X, Upload, Check } from 'lucide-react'

interface Font {
  id: string
  name: string
  family: string
  file?: File
  loaded: boolean
  isSystem: boolean
}

interface FontManagerProps {
  onClose: () => void
}

const STORAGE_KEY = 'niimbot_custom_fonts'

export default function FontManager({ onClose }: FontManagerProps) {
  const [fonts, setFonts] = useState<Font[]>([])
  const [loading, setLoading] = useState(false)

  // System fonts - expanded list
  const systemFonts: Font[] = [
    { id: 'arial', name: 'Arial', family: 'Arial', loaded: true, isSystem: true },
    { id: 'helvetica', name: 'Helvetica', family: 'Helvetica', loaded: true, isSystem: true },
    { id: 'times', name: 'Times New Roman', family: 'Times New Roman', loaded: true, isSystem: true },
    { id: 'courier', name: 'Courier New', family: 'Courier New', loaded: true, isSystem: true },
    { id: 'georgia', name: 'Georgia', family: 'Georgia', loaded: true, isSystem: true },
    { id: 'verdana', name: 'Verdana', family: 'Verdana', loaded: true, isSystem: true },
    { id: 'trebuchet', name: 'Trebuchet MS', family: 'Trebuchet MS', loaded: true, isSystem: true },
    { id: 'impact', name: 'Impact', family: 'Impact', loaded: true, isSystem: true },
    { id: 'palatino', name: 'Palatino', family: 'Palatino', loaded: true, isSystem: true },
    { id: 'garamond', name: 'Garamond', family: 'Garamond', loaded: true, isSystem: true },
    { id: 'bookman', name: 'Bookman', family: 'Bookman', loaded: true, isSystem: true },
    { id: 'avantgarde', name: 'Avant Garde', family: 'Avant Garde', loaded: true, isSystem: true },
    { id: 'monaco', name: 'Monaco', family: 'Monaco', loaded: true, isSystem: true },
    { id: 'optima', name: 'Optima', family: 'Optima', loaded: true, isSystem: true },
  ]

  useEffect(() => {
    // Load custom fonts from localStorage on mount
    loadSavedFonts()
  }, [])

  const loadSavedFonts = async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const savedFonts = JSON.parse(saved) as Array<{ name: string; family: string; data: string }>

      const loadedFonts: Font[] = []

      for (const savedFont of savedFonts) {
        try {
          // Convert base64 back to ArrayBuffer
          const binaryString = atob(savedFont.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          // Register font
          const fontFace = new FontFace(savedFont.family, bytes)
          await fontFace.load()
          document.fonts.add(fontFace)

          loadedFonts.push({
            id: `custom-${savedFont.family}`,
            name: savedFont.name,
            family: savedFont.family,
            loaded: true,
            isSystem: false,
          })
        } catch (error) {
          console.error('Error loading saved font:', error)
        }
      }

      setFonts(loadedFonts)
    } catch (error) {
      console.error('Error loading fonts from storage:', error)
    }
  }

  const saveFontsToStorage = async (fontsToSave: Font[]) => {
    try {
      const customFonts = fontsToSave.filter(f => !f.isSystem && f.file)

      const fontsData = await Promise.all(
        customFonts.map(async (font) => {
          if (!font.file) return null

          const arrayBuffer = await font.file.arrayBuffer()
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          )

          return {
            name: font.name,
            family: font.family,
            data: base64,
          }
        })
      )

      const validFonts = fontsData.filter(f => f !== null)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validFonts))
    } catch (error) {
      console.error('Error saving fonts to storage:', error)
    }
  }

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setLoading(true)
    const newFonts: Font[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // Load font using opentype.js
        const arrayBuffer = await file.arrayBuffer()
        const font = opentype.parse(arrayBuffer)

        const fontFamily = font.names.fullName.en || file.name.replace(/\.(ttf|otf)$/, '')
        const fontName = fontFamily

        // Register font in browser
        const fontFace = new FontFace(fontFamily, arrayBuffer)
        await fontFace.load()
        document.fonts.add(fontFace)

        newFonts.push({
          id: `custom-${Date.now()}-${i}`,
          name: fontName,
          family: fontFamily,
          file,
          loaded: true,
          isSystem: false,
        })
      } catch (error) {
        console.error('Error loading font:', error)
        alert(`Chyba při načítání fontu ${file.name}`)
      }
    }

    const updatedFonts = [...fonts, ...newFonts]
    setFonts(updatedFonts)
    await saveFontsToStorage(updatedFonts)
    setLoading(false)

    // Reset input
    e.target.value = ''
  }

  const handleApplyFont = (fontFamily: string) => {
    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontFamily', fontFamily)
      canvas.renderAll()
    } else {
      alert('Nejdřív vyberte textový objekt')
    }
  }

  const handleRemoveFont = async (fontId: string) => {
    const updatedFonts = fonts.filter(f => f.id !== fontId)
    setFonts(updatedFonts)
    await saveFontsToStorage(updatedFonts)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Správa fontů</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload custom fonts */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nahrát vlastní fonty:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".ttf,.otf"
                multiple
                onChange={handleFontUpload}
                className="hidden"
                id="font-upload"
                disabled={loading}
              />
              <label
                htmlFor="font-upload"
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload size={16} />
                {loading ? 'Nahrávám...' : 'Vybrat soubory (.ttf, .otf)'}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Fonty se automaticky ukládají a budou dostupné i po restartu aplikace
            </p>
          </div>

          {/* System fonts */}
          <div>
            <h3 className="text-sm font-medium mb-2">Systémové fonty:</h3>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {systemFonts.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleApplyFont(font.family)}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-left flex items-center justify-between group"
                  style={{ fontFamily: font.family }}
                >
                  <span className="truncate">{font.name}</span>
                  <Check size={14} className="opacity-0 group-hover:opacity-100 text-blue-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom fonts */}
          {fonts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Vlastní fonty:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded group hover:bg-gray-50"
                  >
                    <button
                      onClick={() => handleApplyFont(font.family)}
                      className="flex-1 text-left"
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="opacity-0 group-hover:opacity-100 text-blue-600" />
                      <button
                        onClick={() => handleRemoveFont(font.id)}
                        className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fonts.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
              <p className="font-medium mb-1">💡 Tip:</p>
              <p>Nahrajte vlastní fonty pro větší kreativitu. Fonty se automaticky uloží a budou dostupné i při příštím spuštění aplikace.</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-medium mb-2">Návod k použití:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Vyberte textový objekt v editoru</li>
              <li>Klikněte na požadovaný font v seznamu</li>
              <li>Font se aplikuje na vybraný text</li>
            </ol>
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
