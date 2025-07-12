"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Download, Copy, RotateCcw, Trash2, Share2, Move, Maximize2, Minimize2 } from "lucide-react"
import { toast } from "sonner"
import { getUserByClerkId, getSwaps } from "@/lib/database"

interface ClothingItem {
  emoji: string
  name: string
  swapsRequired: number
  unlocked: boolean
}

interface EmojiItem {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

interface DrawingStroke {
  points: { x: number; y: number }[]
  color: string
  width: number
}

export default function AvatarPage() {
  const { user } = useUser()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [equippedItems, setEquippedItems] = useState<string[]>([])
  const [savedAvatarData, setSavedAvatarData] = useState<string | null>(null)
  const [emojiItems, setEmojiItems] = useState<EmojiItem[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null)
  const [swapCount, setSwapCount] = useState(0)
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([
    { emoji: "🩳", name: "Shorts", swapsRequired: 0, unlocked: true },
    { emoji: "👕", name: "T-Shirt", swapsRequired: 1, unlocked: false },
    { emoji: "👖", name: "Jeans", swapsRequired: 2, unlocked: false },
    { emoji: "🧥", name: "Jacket", swapsRequired: 3, unlocked: false },
    { emoji: "👟", name: "Sneakers", swapsRequired: 4, unlocked: false },
    { emoji: "🧢", name: "Cap", swapsRequired: 5, unlocked: false },
    { emoji: "🕶️", name: "Sunglasses", swapsRequired: 6, unlocked: false },
    { emoji: "🧣", name: "Scarf", swapsRequired: 7, unlocked: false },
    { emoji: "👔", name: "Tie", swapsRequired: 8, unlocked: false },
    { emoji: "🎩", name: "Top Hat", swapsRequired: 9, unlocked: false },
    { emoji: "👓", name: "Glasses", swapsRequired: 10, unlocked: false },
    { emoji: "🧤", name: "Gloves", swapsRequired: 11, unlocked: false },
    { emoji: "👑", name: "Crown", swapsRequired: 12, unlocked: false },
    { emoji: "💍", name: "Ring", swapsRequired: 13, unlocked: false },
    { emoji: "⌚", name: "Watch", swapsRequired: 14, unlocked: false },
    { emoji: "👜", name: "Handbag", swapsRequired: 15, unlocked: false },
    { emoji: "🎒", name: "Backpack", swapsRequired: 16, unlocked: false },
    { emoji: "👠", name: "Heels", swapsRequired: 17, unlocked: false },
    { emoji: "👢", name: "Boots", swapsRequired: 18, unlocked: false },
    { emoji: "👗", name: "Dress", swapsRequired: 19, unlocked: false },
    { emoji: "👘", name: "Kimono", swapsRequired: 20, unlocked: false },
  ])

  // Get canvas coordinates accounting for scaling
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Redraw canvas with all elements
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw saved avatar data if exists
    if (savedAvatarData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawStrokes()
        drawEmojis()
      }
      img.src = savedAvatarData
    } else {
      drawStrokes()
      drawEmojis()
    }
  }

  // Draw all saved strokes
  const drawStrokes = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw all completed strokes
    drawingStrokes.forEach(stroke => {
      if (stroke.points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
        stroke.points.forEach(point => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width
        ctx.lineCap = "round"
        ctx.stroke()
      }
    })

    // Draw current stroke if drawing
    if (currentStroke && currentStroke.points.length > 0) {
      ctx.beginPath()
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y)
      currentStroke.points.forEach(point => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.strokeStyle = currentStroke.color
      ctx.lineWidth = currentStroke.width
      ctx.lineCap = "round"
      ctx.stroke()
    }
  }

  // Draw all emoji items
  const drawEmojis = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    emojiItems.forEach(item => {
      ctx.save()
      ctx.translate(item.x, item.y)
      ctx.rotate(item.rotation)
      ctx.font = `${item.size}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Draw selection border if selected
      if (selectedEmoji === item.id) {
        ctx.strokeStyle = '#3B82F6'
        ctx.lineWidth = 2
        ctx.strokeText(item.emoji, 0, 0)
      }
      
      ctx.fillText(item.emoji, 0, 0)
      ctx.restore()
    })
  }

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const userData = await getUserByClerkId(user.id)
          setCurrentUser(userData)
          
          // Get user's swaps and count completed ones
          if (userData?.id) {
            const swaps = await getSwaps(userData.id)
            const completedSwaps = swaps?.filter(swap => swap.status === "completed") || []
            const actualSwapCount = completedSwaps.length
            setSwapCount(actualSwapCount)
            
            // Update unlocked status based on actual swap count
            setClothingItems(prev => prev.map(item => ({
              ...item,
              unlocked: actualSwapCount >= item.swapsRequired
            })))
          }
          
          // Load saved avatar if exists
          if (userData?.avatar?.[0]) {
            const avatarData = userData.avatar[0]
            setSavedAvatarData(avatarData.avatar_data)
            setEquippedItems(avatarData.clothing_items || [])
            setEmojiItems(avatarData.emoji_items || [])
            setDrawingStrokes(avatarData.drawing_strokes || [])
            loadAvatarToCanvas(avatarData.avatar_data)
          }
        } catch (error) {
          console.error("Error loading user data:", error)
        }
      }
    }

    loadUserData()
  }, [user])

  const loadAvatarToCanvas = (avatarData: string) => {
    setSavedAvatarData(avatarData)
    redrawCanvas()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    
    // Check if clicking on an emoji
    const clickedEmoji = emojiItems.find(item => {
      const distance = Math.sqrt(
        Math.pow(coords.x - item.x, 2) + Math.pow(coords.y - item.y, 2)
      )
      return distance <= item.size / 2
    })

    if (clickedEmoji) {
      setSelectedEmoji(clickedEmoji.id)
      setIsDragging(true)
      setDragOffset({
        x: coords.x - clickedEmoji.x,
        y: coords.y - clickedEmoji.y
      })
      return
    }

    // If not clicking on emoji, start drawing
    setIsDrawing(true)
    setSelectedEmoji(null)
    
    // Start new stroke
    const newStroke: DrawingStroke = {
      points: [coords],
      color: "#000000",
      width: 3
    }
    setCurrentStroke(newStroke)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isDragging) return

    const coords = getCanvasCoordinates(e)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (isDrawing && currentStroke) {
      // Add point to current stroke
      setCurrentStroke(prev => prev ? {
        ...prev,
        points: [...prev.points, coords]
      } : null)
      
      // Draw the line immediately for smooth drawing
      ctx.beginPath()
      ctx.moveTo(currentStroke.points[currentStroke.points.length - 1]?.x || coords.x, 
                 currentStroke.points[currentStroke.points.length - 1]?.y || coords.y)
      ctx.lineTo(coords.x, coords.y)
      ctx.strokeStyle = currentStroke.color
      ctx.lineWidth = currentStroke.width
      ctx.lineCap = "round"
      ctx.stroke()
    } else if (isDragging && selectedEmoji) {
      // Update emoji position
      setEmojiItems(prev => prev.map(item => 
        item.id === selectedEmoji 
          ? { ...item, x: coords.x - dragOffset.x, y: coords.y - dragOffset.y }
          : item
      ))
    }
  }

  const stopDrawing = () => {
    if (isDrawing && currentStroke) {
      // Save the completed stroke
      setDrawingStrokes(prev => [...prev, currentStroke])
      setCurrentStroke(null)
    }
    
    setIsDrawing(false)
    setIsDragging(false)
    redrawCanvas()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSavedAvatarData(null)
    setEmojiItems([])
    setSelectedEmoji(null)
    setDrawingStrokes([])
    setCurrentStroke(null)
  }

  const addClothingItem = (emoji: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const newEmoji: EmojiItem = {
      id: Date.now().toString(),
      emoji,
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: 48,
      rotation: 0
    }

    setEmojiItems(prev => [...prev, newEmoji])
    setSelectedEmoji(newEmoji.id)
    redrawCanvas()
  }

  const deleteSelectedEmoji = () => {
    if (selectedEmoji) {
      setEmojiItems(prev => prev.filter(item => item.id !== selectedEmoji))
      setSelectedEmoji(null)
      redrawCanvas()
    }
  }

  const resizeSelectedEmoji = (increase: boolean) => {
    if (selectedEmoji) {
      setEmojiItems(prev => prev.map(item => 
        item.id === selectedEmoji 
          ? { ...item, size: Math.max(12, Math.min(120, item.size + (increase ? 4 : -4))) }
          : item
      ))
      redrawCanvas()
    }
  }

  const rotateSelectedEmoji = (clockwise: boolean) => {
    if (selectedEmoji) {
      setEmojiItems(prev => prev.map(item => 
        item.id === selectedEmoji 
          ? { ...item, rotation: item.rotation + (clockwise ? Math.PI / 6 : -Math.PI / 6) }
          : item
      ))
      redrawCanvas()
    }
  }

  const saveAvatar = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const avatarData = canvas.toDataURL("image/png")
      
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarData,
          clothingItems: equippedItems,
          emojiItems: emojiItems,
          drawingStrokes: drawingStrokes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save avatar")
      }

      setSavedAvatarData(avatarData)
      toast.success("Avatar saved successfully!")
    } catch (error) {
      console.error("Error saving avatar:", error)
      toast.error("Failed to save avatar")
    }
  }

  const downloadAvatar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "my-avatar.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const copyToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          toast.success("Avatar copied to clipboard!")
        }
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast.error("Failed to copy to clipboard")
    }
  }

  const shareAvatar = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], "avatar.png", { type: "image/png" })
          await navigator.share({
            title: "My ReWear Avatar",
            text: "Check out my sustainable fashion avatar!",
            files: [file],
          })
        } else {
          // Fallback to copying link
          copyToClipboard()
        }
      })
    } catch (error) {
      console.error("Error sharing avatar:", error)
      toast.error("Failed to share avatar")
    }
  }

  // Redraw canvas when emoji items change
  useEffect(() => {
    redrawCanvas()
  }, [emojiItems, selectedEmoji, drawingStrokes])

  const unlockedItems = clothingItems.filter(item => item.unlocked)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Avatar</h1>
          <p className="text-gray-600">
            Draw your avatar and unlock clothing items by completing swaps! You have completed{" "}
            <span className="font-bold text-blue-600">{swapCount} swaps</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Clothing Items Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Clothing Items</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {clothingItems.map((item, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      item.unlocked
                        ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        : "border-gray-100 bg-gray-50 opacity-50"
                    }`}
                    onClick={() => item.unlocked && addClothingItem(item.emoji)}
                    title={
                      item.unlocked
                        ? `Add ${item.name}`
                        : `Complete ${item.swapsRequired} swaps to unlock ${item.name}`
                    }
                  >
                    <div className="text-3xl text-center">{item.emoji}</div>
                    <div className="text-xs text-center mt-1 text-gray-600">
                      {item.name}
                    </div>
                    
                    {/* Tooltip for locked items */}
                    {!item.unlocked && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {item.swapsRequired} swaps to unlock
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Progress</h3>
                <div className="text-sm text-blue-700">
                  <p>Unlocked: {unlockedItems.length}/{clothingItems.length} items</p>
                  <p>Next unlock: {swapCount < 20 ? clothingItems[swapCount + 1]?.name : "All unlocked!"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Draw Your Avatar</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                  <button
                    onClick={saveAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Avatar
                  </button>
                </div>
              </div>

              {/* Emoji Controls */}
              {selectedEmoji && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Item Controls</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={deleteSelectedEmoji}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded text-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                    <button
                      onClick={() => resizeSelectedEmoji(true)}
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded text-sm"
                    >
                      <Maximize2 className="h-3 w-3" />
                      Enlarge
                    </button>
                    <button
                      onClick={() => resizeSelectedEmoji(false)}
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded text-sm"
                    >
                      <Minimize2 className="h-3 w-3" />
                      Shrink
                    </button>
                    <button
                      onClick={() => rotateSelectedEmoji(true)}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded text-sm"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Rotate
                    </button>
                  </div>
                </div>
              )}

              {/* Canvas */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full h-auto cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={downloadAvatar}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={shareAvatar}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Draw your avatar using the black pen</li>
                  <li>• Click on unlocked clothing items to add them to your avatar</li>
                  <li>• Click and drag emojis to move them around</li>
                  <li>• Select an emoji to resize, rotate, or delete it</li>
                  <li>• Complete more swaps to unlock new clothing items</li>
                  <li>• Save your avatar to keep your progress</li>
                  <li>• Download or share your avatar on social media</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
