import { useState } from 'react'
import * as XLSX from 'xlsx'

interface ExcelImporterProps {
  onClose: () => void
}

interface ExcelData {
  headers: string[]
  rows: any[][]
}

export default function ExcelImporter({ onClose }: ExcelImporterProps) {
  const [excelData, setExcelData] = useState<ExcelData | null>(null)
  const [startRow, setStartRow] = useState(1)
  const [endRow, setEndRow] = useState(1)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printProgress, setPrintProgress] = useState(0)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result
      if (!data) return

      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

      if (jsonData.length > 0) {
        const rows = jsonData.slice(1)
        setExcelData({
          headers: jsonData[0],
          rows,
        })
        setEndRow(rows.length)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleBatchPrint = async () => {
    if (!excelData) return

    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) {
      alert('Žádný design k tisku')
      return
    }

    // Get all text objects in the canvas
    const textObjects = canvas.getObjects('i-text')

    // Store original text values to restore later
    const originalTexts = textObjects.map((obj: any) => ({
      obj,
      text: obj.text
    }))

    setIsPrinting(true)
    setPrintProgress(0)

    try {
      const rowsToProcess = excelData.rows.slice(startRow - 1, endRow)

      for (let i = 0; i < rowsToProcess.length; i++) {
        const row = rowsToProcess[i]

        // Update text objects with row data
        textObjects.forEach((obj: any) => {
          const fieldName = originalTexts.find(o => o.obj === obj)?.text
          const columnIndex = excelData.headers.indexOf(fieldName || '')
          if (columnIndex !== -1) {
            obj.set('text', row[columnIndex]?.toString() || '')
          }
        })

        canvas.renderAll()

        // Wait for fonts to load
        await document.fonts.ready

        // Convert to image
        const dataURL = canvas.toDataURL('image/png')
        const base64 = dataURL.split(',')[1]
        const imageData = Buffer.from(base64, 'base64')

        // Print (assuming printer is connected)
        await (window as any).electronAPI.printer.print(imageData, {
          density: 3,
          copies: 1,
        })

        setPrintProgress(((i + 1) / rowsToProcess.length) * 100)

        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Restore original texts
      originalTexts.forEach(({ obj, text }) => {
        obj.set('text', text)
      })
      canvas.renderAll()

      alert(`Vytisknuto ${rowsToProcess.length} štítků!`)
      onClose()
    } catch (error) {
      console.error('Batch print error:', error)
      alert('Chyba při dávkovém tisku')

      // Restore original texts on error
      originalTexts.forEach(({ obj, text }) => {
        obj.set('text', text)
      })
      canvas.renderAll()
    } finally {
      setIsPrinting(false)
      setPrintProgress(0)
    }
  }

  const handlePreview = () => {
    if (!excelData || startRow < 1) return

    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) return

    const textObjects = canvas.getObjects('i-text')
    const row = excelData.rows[startRow - 1]

    if (!row) return

    // Update text objects with selected row data
    textObjects.forEach((obj: any) => {
      const fieldName = obj.text
      const columnIndex = excelData.headers.indexOf(fieldName)
      if (columnIndex !== -1) {
        obj.set('text', row[columnIndex]?.toString() || '')
      }
    })

    canvas.renderAll()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import z Excel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Vyberte Excel soubor (.xlsx):
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          {excelData && (
            <>
              <div className="border border-gray-300 rounded p-4">
                <h3 className="font-medium mb-2">Náhled dat:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {excelData.headers.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left border">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.rows.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 border">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelData.rows.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... a dalších {excelData.rows.length - 5} řádků
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="text-sm font-medium mb-2">Návod k použití:</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>V editoru vytvořte textová pole s názvy sloupců z Excelu</li>
                  <li>Například text "Jméno" bude nahrazen hodnotami ze sloupce "Jméno"</li>
                  <li>Vyberte rozsah řádků pro tisk</li>
                  <li>Použijte Preview pro náhled prvního štítku</li>
                  <li>Klikněte na "Spustit dávkový tisk" pro tisk všech štítků</li>
                </ol>
              </div>

              {/* Range selection */}
              <div className="border border-gray-300 rounded p-4">
                <h4 className="text-sm font-medium mb-3">Výběr rozsahu řádků:</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Od řádku:</label>
                    <input
                      type="number"
                      min="1"
                      max={excelData.rows.length}
                      value={startRow}
                      onChange={(e) => setStartRow(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Do řádku:</label>
                    <input
                      type="number"
                      min="1"
                      max={excelData.rows.length}
                      value={endRow}
                      onChange={(e) => setEndRow(Math.min(excelData.rows.length, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Celkem:</label>
                    <div className="px-3 py-2 bg-gray-100 rounded text-center font-medium">
                      {Math.max(0, endRow - startRow + 1)} štítků
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePreview}
                  className="mt-3 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  👁️ Preview řádku {startRow}
                </button>
              </div>

              {/* Progress bar */}
              {isPrinting && (
                <div className="border border-gray-300 rounded p-4">
                  <h4 className="text-sm font-medium mb-2">Probíhá tisk...</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${printProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {Math.round(printProgress)}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleBatchPrint}
                  disabled={isPrinting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isPrinting ? '⌛ Tisknu...' : '🖨️ Spustit dávkový tisk'}
                </button>
                <button
                  onClick={onClose}
                  disabled={isPrinting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200"
                >
                  {isPrinting ? 'Počkejte...' : 'Zrušit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
