"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, Star, MapPin, Calendar, Package, Shield, RefreshCw } from "lucide-react"
import { getItemById, getItems } from "@/lib/database"
import { useUser } from "@clerk/nextjs"
import SwapRequestModal from "@/components/SwapRequestModal"
import { toast } from "sonner"
import type { Item } from "@/lib/supabase"

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { isSignedIn, user } = useUser()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [item, setItem] = useState<Item | null>(null)
  const [relatedItems, setRelatedItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapLoading, setSwapLoading] = useState(false)

  useEffect(() => {
    const loadItemData = async () => {
      try {
        setLoading(true)
        
        // Fetch the specific item
        const itemData = await getItemById(params.id)
        setItem(itemData)

        // Fetch related items (same category)
        if (itemData) {
          const allItems = await getItems()
          if (allItems) {
            const related = allItems
              .filter(i => i.id !== params.id && i.category === itemData.category)
              .slice(0, 3)
            setRelatedItems(related)
          }
        }
      } catch (error) {
        console.error("Error loading item data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadItemData()
  }, [params.id])

  const handleSwapRequest = async (offeredItemId: string, message: string) => {
    try {
      setSwapLoading(true)
      
      const response = await fetch("/api/swaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: params.id,
          offeredItemId,
          message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create swap request")
      }

      toast.success("Swap request sent successfully!")
      setShowSwapModal(false)
    } catch (error) {
      console.error("Error creating swap request:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send swap request")
    } finally {
      setSwapLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <Link href="/browse" className="btn-primary">
            Browse Items
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link href="/browse" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-md">
              <Image
                src={item.images?.[selectedImage] || "/placeholder.svg"}
                alt={item.title}
                width={600}
                height={600}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2 rounded-full ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600"} shadow-md hover:shadow-lg transition-all`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:shadow-lg transition-all">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative bg-white rounded-lg overflow-hidden ${selectedImage === index ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${item.title} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === "available"
                    ? "bg-green-100 text-green-700"
                    : item.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {item.status}
              </span>
              <span className="text-sm text-gray-500">
                • Posted {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-blue-600">{item.points} points</span>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{item.user?.location || "Location not specified"}</span>
                </div>
              </div>
            </div>

            {/* Item Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <Package className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Size</span>
                </div>
                <span className="text-lg font-semibold">{item.size}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Condition</span>
                </div>
                <span className="text-lg font-semibold">{item.condition}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Owner Info */}
            {item.user && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Listed by</h3>
                <div className="flex items-center gap-4">
                  <Image
                    src={item.user.image_url || "/placeholder.svg"}
                    alt={`${item.user.first_name} ${item.user.last_name}`}
                    width={60}
                    height={60}
                    className="w-15 h-15 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.user.first_name} {item.user.last_name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span>{item.user.rating || 5.0}</span>
                      </div>
                      <span>•</span>
                      <span>{item.user.total_swaps || 0} swaps</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Joined {new Date(item.user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isSignedIn && item.user?.id !== user?.id && item.status === "available" ? (
                <button 
                  onClick={() => setShowSwapModal(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Request Swap
                </button>
              ) : (
                <button className="w-full btn-primary" disabled>
                  {item.status === "available" ? "Sign in to Swap" : "Item Not Available"}
                </button>
              )}
              <button className="w-full btn-secondary">Message Owner</button>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <Link key={relatedItem.id} href={`/item/${relatedItem.id}`} className="group">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    <Image
                      src={relatedItem.images?.[0] || "/placeholder.svg"}
                      alt={relatedItem.title}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {relatedItem.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">{relatedItem.points} points</span>
                        <span className="text-sm text-gray-600">{relatedItem.condition}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        targetItem={item}
        onSubmit={handleSwapRequest}
        loading={swapLoading}
      />
    </div>
  )
}
