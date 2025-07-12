"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Grid, List, Star } from "lucide-react"
import { getItems } from "@/lib/database"
import type { Item } from "@/lib/supabase"

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // Load items from database
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true)
        // Explicitly filter for available items only
        const fetchedItems = await getItems({ status: "available" })
        setItems(fetchedItems || [])
      } catch (error) {
        console.error("Error loading items:", error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "tops", label: "Tops" },
    { value: "bottoms", label: "Bottoms" },
    { value: "dresses", label: "Dresses" },
    { value: "outerwear", label: "Outerwear" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
  ]

  const conditions = [
    { value: "all", label: "All Conditions" },
    { value: "like-new", label: "Like New" },
    { value: "excellent", label: "Excellent" },
    { value: "very-good", label: "Very Good" },
    { value: "good", label: "Good" },
  ]

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesCondition =
      selectedCondition === "all" || item.condition === selectedCondition

    return matchesSearch && matchesCategory && matchesCondition
  })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Items</h1>
          <p className="text-muted-foreground">Discover amazing pre-loved fashion items from our community</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search items, brands, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="input-field"
            >
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground hover:bg-accent"}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground hover:bg-accent"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/item/${item.id}`} className="group">
                <div className="card">
                  <div className="relative">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg"}
                      alt={item.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2 bg-background border border-border px-2 py-1 rounded-full text-xs font-medium text-foreground">
                      {item.condition}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Size: {item.size}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary">{item.points} points</span>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">Category: {item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/item/${item.id}`} className="group">
                <div className="card">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                      <Image
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.title}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2 bg-background border border-border px-2 py-1 rounded-full text-xs font-medium text-foreground">
                        {item.condition}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Size: {item.size} • Category: {item.category}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{item.points} points</span>
                        <div className="flex items-center">
                          <span className="text-muted-foreground">Views: {item.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        )}
      </div>
    </div>
  )
}
