import { useState } from 'react'
import LabelDesigner from './components/LabelDesigner'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import PrinterPanel from './components/PrinterPanel'

function App() {
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [printerConnected, setPrinterConnected] = useState(false)

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
          <LabelDesigner selectedTool={selectedTool} />
        </div>
      </div>

      {/* Right Panel - Printer Controls */}
      <PrinterPanel
        connected={printerConnected}
        onConnectionChange={setPrinterConnected}
      />
    </div>
  )
}

export default App
