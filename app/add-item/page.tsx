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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List a New Item</h1>
          <p className="text-gray-600">Share your pre-loved fashion with the ReWear community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            <p className="text-gray-600 mb-4">
              Add up to 5 photos of your item. The first photo will be the main image.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Upload Button */}
              {images.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Photos</p>
                </label>
              )}

              {/* Image Previews */}
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    width={400}
                    height={128}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Item Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Vintage Leather Jacket"
                  className="input-field"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="swap">Swap</option>
                  <option value="donate">Donate</option>
                  <option value="points">Points</option>
                </select>
              </div>

              {/* Points (only for points listing type) */}
              {formData.type === "points" && (
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                    Points *
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
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">Set the number of points required to claim this item.</p>
                </div>
              )}

              {/* Size */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  Size *
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  {sizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., vintage, designer, casual (comma separated)"
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your item's condition, fit, style, and any other relevant details..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={
                !formData.title ||
                !formData.category ||
                !formData.size ||
                !formData.condition ||
                !formData.description ||
                images.length === 0
              }
            >
              List Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
