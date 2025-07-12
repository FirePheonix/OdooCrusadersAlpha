"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Package, MessageSquare } from "lucide-react"
import { getItems, getUserByClerkId } from "@/lib/database"
import { useUser } from "@clerk/nextjs"
import type { Item } from "@/lib/supabase"

interface SwapRequestModalProps {
  isOpen: boolean
  onClose: () => void
  targetItem: Item | null
  onSubmit: (offeredItemId: string, message: string) => void
  loading?: boolean
}

export default function SwapRequestModal({
  isOpen,
  onClose,
  targetItem,
  onSubmit,
  loading = false,
}: SwapRequestModalProps) {
  const { user } = useUser()
  const [myItems, setMyItems] = useState<Item[]>([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [message, setMessage] = useState("")
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadMyItems()
    }
  }, [isOpen])

  const loadMyItems = async () => {
    try {
      setLoadingItems(true)
      if (!user?.id) {
        setMyItems([])
        return
      }
      
      const userData = await getUserByClerkId(user.id)
      if (!userData) {
        setMyItems([])
        return
      }
      
      const items = await getItems({ userId: userData.id, status: "available" })
      setMyItems(items || [])
    } catch (error) {
      console.error("Error loading items:", error)
      setMyItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId) {
      alert("Please select an item to offer")
      return
    }
    onSubmit(selectedItemId, message)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Swap</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Target Item */}
          {targetItem && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Item you want to swap for:
              </h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Image
                  src={targetItem.images?.[0] || "/placeholder.svg"}
                  alt={targetItem.title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{targetItem.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {targetItem.category} • {targetItem.size} • {targetItem.condition}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {targetItem.points} points
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Select Your Item */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Select an item to offer:
            </h3>
            {loadingItems ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : myItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No available items
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You need to have available items to make a swap request.
                </p>
                <button
                  onClick={() => window.open("/add-item", "_blank")}
                  className="btn-primary"
                >
                  Add New Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedItemId === item.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.title}
                        width={60}
                        height={60}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {item.category} • {item.size}
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {item.points} points
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the item owner..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedItemId || loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Sending Request...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Send Swap Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 