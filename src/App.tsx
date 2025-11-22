import { useState, useRef } from 'react'
import { fabric } from 'fabric'
import LabelDesigner from './components/LabelDesigner'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import PrinterPanel from './components/PrinterPanel'
import PropertiesPanel from './components/PropertiesPanel'
import LabelSizeSelect, { LABEL_SIZES, type LabelSize } from './components/LabelSizeSelect'

function App() {
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [printerConnected, setPrinterConnected] = useState(false)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [labelSize, setLabelSize] = useState<LabelSize>(LABEL_SIZES[6]) // Default: 40×30mm

  const handleLandscapeToggle = () => {
    setLabelSize({
      ...labelSize,
      width: labelSize.height,
      height: labelSize.width,
      widthPx: labelSize.heightPx,
      heightPx: labelSize.widthPx,
      landscape: !labelSize.landscape,
    })
  }

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
        <div className="flex items-center gap-2 bg-white border-b border-gray-200 px-4 py-2">
          <Toolbar />
          <div className="ml-auto">
            <LabelSizeSelect
              currentSize={labelSize}
              onSizeChange={setLabelSize}
              onLandscapeToggle={handleLandscapeToggle}
            />
          </div>
        </div>

        {/* Label Designer */}
        <div className="flex-1 flex items-center justify-center p-4">
          <LabelDesigner
            selectedTool={selectedTool}
            onCanvasReady={setCanvas}
            labelSize={labelSize}
          />
        </div>
      </div>

      {/* Right Panels */}
      <div className="flex flex-shrink-0">
        {/* Properties Panel */}
        <div className="w-64 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
          <PropertiesPanel canvas={canvas} />
        </div>

        {/* Printer Panel */}
        <div className="flex-shrink-0">
          <PrinterPanel
            connected={printerConnected}
            onConnectionChange={setPrinterConnected}
          />
        </div>
      </div>
    </div>
  )
}

export default App
