import { MousePointer2, Type, Pencil, Square, Circle, Trash2 } from 'lucide-react'

interface SidebarProps {
  selectedTool: string
  onToolSelect: (tool: string) => void
}

export default function Sidebar({ selectedTool, onToolSelect }: SidebarProps) {
  const tools = [
    { id: 'select', label: 'Vybrat', Icon: MousePointer2 },
    { id: 'text', label: 'Text', Icon: Type },
    { id: 'draw', label: 'Kreslit', Icon: Pencil },
    { id: 'rectangle', label: 'Obdélník', Icon: Square },
    { id: 'circle', label: 'Kruh', Icon: Circle },
  ]

  const handleToolClick = (toolId: string) => {
    onToolSelect(toolId)

    // Trigger the appropriate action
    const designer = (window as any).labelDesigner
    if (!designer) return

    switch (toolId) {
      case 'text':
        designer.addText()
        break
      case 'rectangle':
        designer.addRectangle()
        break
      case 'circle':
        designer.addCircle()
        break
    }
  }

  const handleDelete = () => {
    const canvas = (window as any).labelDesigner?.getCanvas()
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }

  return (
    <div className="w-20 bg-gray-800 text-white flex flex-col items-center py-4 space-y-2">
      <div className="text-2xl mb-4">🖨️</div>

      {tools.map((tool) => {
        const { Icon } = tool
        return (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700 transition-colors ${
              selectedTool === tool.id ? 'bg-blue-600' : ''
            }`}
            title={tool.label}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{tool.label}</span>
          </button>
        )
      })}

      <div className="flex-1" />

      {/* Delete button at bottom */}
      <button
        onClick={handleDelete}
        className="w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-red-600 transition-colors bg-gray-700"
        title="Smazat vybraný objekt (Delete)"
      >
        <Trash2 size={24} />
        <span className="text-xs mt-1">Smazat</span>
      </button>
    </div>
  )
}
