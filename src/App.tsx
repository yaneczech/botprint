import { useState, useRef } from 'react'
import { fabric } from 'fabric'
import LabelDesigner from './components/LabelDesigner'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import PrinterPanel from './components/PrinterPanel'
import PropertiesPanel from './components/PropertiesPanel'

function App() {
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [printerConnected, setPrinterConnected] = useState(false)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Tools */}
      <Sidebar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <Toolbar />

        {/* Label Designer */}
        <div className="flex-1 flex items-center justify-center p-4">
          <LabelDesigner selectedTool={selectedTool} onCanvasReady={setCanvas} />
        </div>
      </div>

      {/* Right Panels */}
      <div className="flex">
        {/* Properties Panel */}
        <div className="w-64 bg-white border-l border-gray-200">
          <PropertiesPanel canvas={canvas} />
        </div>

        {/* Printer Panel */}
        <PrinterPanel
          connected={printerConnected}
          onConnectionChange={setPrinterConnected}
        />
      </div>
    </div>
  )
}

export default App
