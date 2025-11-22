import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'

interface LabelDesignerProps {
  selectedTool: string
}

export default function LabelDesigner({ selectedTool }: LabelDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const [labelSize, setLabelSize] = useState({ width: 384, height: 240 }) // Default: 40mm x 30mm at 96 DPI

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: labelSize.width,
        height: labelSize.height,
        backgroundColor: '#ffffff',
      })

      // Add grid
      addGrid(fabricRef.current, labelSize.width, labelSize.height)
    }

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!fabricRef.current) return

    const canvas = fabricRef.current

    // Handle tool selection
    switch (selectedTool) {
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        break
      case 'text':
        canvas.isDrawingMode = false
        break
      case 'draw':
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush.width = 2
        canvas.freeDrawingBrush.color = '#000000'
        break
      case 'rectangle':
      case 'circle':
        canvas.isDrawingMode = false
        break
    }
  }, [selectedTool])

  const addGrid = (canvas: fabric.Canvas, width: number, height: number) => {
    const gridSize = 20
    const options = {
      stroke: '#ddd',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    }

    for (let i = 0; i < width / gridSize; i++) {
      canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, height], options))
    }

    for (let i = 0; i < height / gridSize; i++) {
      canvas.add(new fabric.Line([0, i * gridSize, width, i * gridSize], options))
    }
  }

  const handleAddText = () => {
    if (!fabricRef.current) return

    const text = new fabric.IText('Text', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
    })

    fabricRef.current.add(text)
    fabricRef.current.setActiveObject(text)
  }

  const handleAddRectangle = () => {
    if (!fabricRef.current) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 60,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
    })

    fabricRef.current.add(rect)
    fabricRef.current.setActiveObject(rect)
  }

  const handleAddCircle = () => {
    if (!fabricRef.current) return

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
    })

    fabricRef.current.add(circle)
    fabricRef.current.setActiveObject(circle)
  }

  const handleImportImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.svg'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !fabricRef.current) return

      const reader = new FileReader()

      reader.onload = (event) => {
        const imgUrl = event.target?.result as string

        if (file.name.endsWith('.svg')) {
          fabric.loadSVGFromURL(imgUrl, (objects, options) => {
            const svg = fabric.util.groupSVGElements(objects, options)
            svg.scaleToWidth(200)
            fabricRef.current?.add(svg)
            fabricRef.current?.renderAll()
          })
        } else {
          fabric.Image.fromURL(imgUrl, (img) => {
            img.scaleToWidth(200)
            fabricRef.current?.add(img)
            fabricRef.current?.renderAll()
          })
        }
      }

      reader.readAsDataURL(file)
    }

    input.click()
  }

  // Expose methods for toolbar
  useEffect(() => {
    ;(window as any).labelDesigner = {
      addText: handleAddText,
      addRectangle: handleAddRectangle,
      addCircle: handleAddCircle,
      importImage: handleImportImage,
      getCanvas: () => fabricRef.current,
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <canvas ref={canvasRef} className="border-2 border-gray-300" />
    </div>
  )
}
