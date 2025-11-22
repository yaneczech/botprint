interface SidebarProps {
  selectedTool: string
  onToolSelect: (tool: string) => void
}

export default function Sidebar({ selectedTool, onToolSelect }: SidebarProps) {
  const tools = [
    { id: 'select', label: 'Vybrat', icon: '↖️' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'draw', label: 'Kreslit', icon: '✏️' },
    { id: 'rectangle', label: 'Obdélník', icon: '⬜' },
    { id: 'circle', label: 'Kruh', icon: '⭕' },
  ]

  return (
    <div className="w-20 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4">
      <div className="text-2xl mb-4">🖨️</div>

      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700 transition-colors ${
            selectedTool === tool.id ? 'bg-blue-600' : ''
          }`}
          title={tool.label}
        >
          <span className="text-2xl">{tool.icon}</span>
          <span className="text-xs mt-1">{tool.label}</span>
        </button>
      ))}
    </div>
  )
}
