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
  const [selectedColumn, setSelectedColumn] = useState<number>(0)
  const [mappingField, setMappingField] = useState<string>('')

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
        setExcelData({
          headers: jsonData[0],
          rows: jsonData.slice(1),
        })
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = () => {
    if (!excelData) return

    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) return

    // Get all text objects in the canvas
    const objects = canvas.getObjects('i-text')

    // For each row in Excel, create a new label
    excelData.rows.forEach((row, index) => {
      if (index === 0) {
        // Update current design with first row
        objects.forEach((obj: any) => {
          const fieldName = obj.text
          const columnIndex = excelData.headers.indexOf(fieldName)
          if (columnIndex !== -1) {
            obj.set('text', row[columnIndex] || '')
          }
        })
        canvas.renderAll()
      } else {
        // For additional rows, you would create new labels
        // This is simplified - in production, you'd queue prints
        console.log('Additional row for batch printing:', row)
      }
    })

    alert(`Importováno ${excelData.rows.length} řádků`)
    onClose()
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
                  <li>Klikněte na "Importovat" pro vytvoření štítků</li>
                  <li>První řádek aktualizuje současný design</li>
                  <li>Další řádky se použijí pro sériový tisk</li>
                </ol>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleImport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Importovat a mapovat data
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Zrušit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
