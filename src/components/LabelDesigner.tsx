import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import type { LabelSize } from './LabelSizeSelect'

interface LabelDesignerProps {
  selectedTool: string
  onCanvasReady?: (canvas: fabric.Canvas) => void
  labelSize: LabelSize
}

export default function LabelDesigner({ selectedTool, onCanvasReady, labelSize }: LabelDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: labelSize.widthPx,
        height: labelSize.heightPx,
        backgroundColor: '#ffffff',
      })

      // Add grid
      addGrid(fabricRef.current, labelSize.widthPx, labelSize.heightPx)

      // Notify parent component
      if (onCanvasReady) {
        onCanvasReady(fabricRef.current)
      }

      // Handle stroke scaling during transformation
      fabricRef.current.on('object:scaling', (e) => {
        const obj = e.target
        if (obj && (obj as any).strokeUniform) {
          // Force redraw to show uniform stroke during scaling
          fabricRef.current?.renderAll()
        }
      })

      // Add keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!fabricRef.current) return

        // Delete or Backspace key
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const activeObject = fabricRef.current.getActiveObject()
          // Only delete if not editing text
          if (activeObject && document.activeElement?.tagName !== 'INPUT' &&
              document.activeElement?.tagName !== 'TEXTAREA' &&
              !document.activeElement?.classList.contains('upper-canvas')) {
            fabricRef.current.remove(activeObject)
            fabricRef.current.renderAll()
            e.preventDefault()
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        fabricRef.current?.off('object:scaling')
      }
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

  // Handle label size changes
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.setDimensions({
        width: labelSize.widthPx,
        height: labelSize.heightPx,
      })

      // Clear and re-add grid
      const objects = fabricRef.current.getObjects()
      const gridObjects = objects.filter(obj => !obj.selectable && !obj.evented)
      gridObjects.forEach(obj => fabricRef.current?.remove(obj))
      addGrid(fabricRef.current, labelSize.widthPx, labelSize.heightPx)

      fabricRef.current.renderAll()
    }
  }, [labelSize])

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
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      strokeUniform: true, // Prevents stroke from scaling with object
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
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      strokeUniform: true, // Prevents stroke from scaling with object
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
      <div className="mb-2 text-center text-sm text-gray-600">
        {labelSize.name} ({labelSize.width}×{labelSize.height}mm)
      </div>
      <canvas ref={canvasRef} className="border-2 border-gray-300" />
      <div className="mt-2 text-center text-xs text-gray-500">
        Rozlišení: {labelSize.widthPx}×{labelSize.heightPx}px (203 DPI)
      </div>
    </div>
  )
}
