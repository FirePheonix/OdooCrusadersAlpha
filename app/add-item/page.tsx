"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Upload, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

export default function AddItemPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "swap",
    size: "",
    condition: "",
    tags: "",
    points: 50,
  })

  // Handle redirect in useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const categories = [
    { value: "", label: "Select Category" },
    { value: "tops", label: "Tops" },
    { value: "bottoms", label: "Bottoms" },
    { value: "dresses", label: "Dresses" },
    { value: "outerwear", label: "Outerwear" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
  ]

  const sizes = [
    { value: "", label: "Select Size" },
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "xxl", label: "XXL" },
    { value: "one-size", label: "One Size" },
  ]

  const conditions = [
    { value: "", label: "Select Condition" },
    { value: "like-new", label: "Like New" },
    { value: "excellent", label: "Excellent" },
    { value: "very-good", label: "Very Good" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category) {
      toast.error("Please select a category")
      return
    }
    if (images.length === 0) {
      toast.error("Please add at least one image")
      return
    }
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images,
          listing_type: formData.type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create item")
      }

      const result = await response.json()

      toast.success("Item listed successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        type: "swap",
        size: "",
        condition: "",
        tags: "",
        points: 50,
      })
      setImages([])

      // Redirect to the item page or dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              List a New Item
            </h1>
            <p className="text-gray-300 text-lg">
              Share your pre-loved fashion with the community
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Indicator */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-white font-medium">Add Photos</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-700 text-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-gray-400 font-medium">Item Details</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-700 text-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-gray-400 font-medium">Review & Publish</span>
              </div>
            </div>            {/* Photo Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Photos</h2>
                <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                  {images.length}/5 photos
                </span>
              </div>

              <p className="text-gray-300">
                Upload high-quality photos of your item. The first photo will be the main image displayed to shoppers.
              </p>

              {/* Empty State - No Photos */}
              {images.length === 0 && (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center bg-gray-800/50">
                  <div className="max-w-sm mx-auto">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload your first photo</h3>
                    <p className="text-gray-300 mb-6 text-sm">
                      Drag and drop your images here, or click to browse. JPG, PNG files up to 5MB each.
                    </p>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg inline-flex items-center cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </label>
                  </div>
                </div>
              )}

              {/* Photo Grid - With Photos */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Existing Images */}
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover rounded-xl border border-gray-700 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add More Button */}
                    {images.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition-all duration-200 group">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors mb-2" />
                        <span className="text-xs text-gray-400 group-hover:text-blue-400 font-medium text-center px-2">
                          Add Photo
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Photo Tips */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Photo Tips:</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Use natural lighting for best results</li>
                      <li>• Show the item from multiple angles</li>
                      <li>• Include close-ups of any details or flaws</li>
                      <li>• First photo should be the main view</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item Details Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Item Details</h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Vintage Leather Jacket - Size M"
                  className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Be specific and descriptive to attract more interest
                </p>
              </div>

              {/* Category and Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                    Listing Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="swap">Swap</option>
                    <option value="donate">Donate</option>
                    <option value="points">Points</option>
                  </select>
                </div>
              </div>

              {/* Size and Condition Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-white mb-2">
                    Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {sizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-white mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Points (only for points listing type) */}
              {formData.type === "points" && (
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-white mb-2">
                    Points Required *
                  </label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    value={formData.points}
                    min={1}
                    max={999}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Set the number of points required to claim this item (1-999)
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your item's condition, fit, style, brand, and any other relevant details..."
                  className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Include details about fit, materials, brand, and any flaws
                </p>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-white mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., vintage, designer, casual, summer"
                  className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate tags with commas to help others find your item
                </p>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-white mb-1">Ready to list your item?</h3>
                <p className="text-gray-300 text-sm">
                  Your item will be visible to the community once published
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl border border-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={
                    isSubmitting ||
                    !formData.title ||
                    !formData.category ||
                    !formData.size ||
                    !formData.condition ||
                    !formData.description ||
                    images.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Item"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
