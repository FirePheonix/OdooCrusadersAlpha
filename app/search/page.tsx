"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Star, Sliders, Heart } from "lucide-react"
import { getItems, getUserByClerkId, toggleLike } from "@/lib/database"
import type { Item } from "@/lib/supabase"

export default function SearchPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    itemTypes: {
      tops: false,
      bottoms: false,
      dresses: false,
      outerwear: false,
      shoes: false,
      accessories: false,
    },
    priceRange: {
      min: 0,
      max: 100,
    },
  })

  // Handle redirect in useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  // Load current user and items with useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Get current user
      if (user?.id) {
        try {
          const userData = await getUserByClerkId(user.id)
          setCurrentUser(userData)
        } catch (error) {
          console.error("Error loading user data:", error)
        }
      }

      // Load items from database
      const selectedTypes = Object.entries(filters.itemTypes)
        .filter(([_, selected]) => selected)
        .map(([type, _]) => type)

      const apiFilters: any = {
        search: searchTerm,
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max,
        status: "available",
      }

      const itemsData = await getItems(apiFilters)

      let filteredItems = itemsData || []
      if (selectedTypes.length > 0) {
        filteredItems = filteredItems.filter((item) => selectedTypes.includes(item.category))
      }

      setItems(filteredItems)
    } catch (error) {
      console.error("Error loading data:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user, searchTerm, filters])

  // Load current user and items
  useEffect(() => {
    if (isSignedIn && user) {
      loadData()
    }
  }, [isSignedIn, user, loadData])

  // Handle like functionality
  const handleLike = async (itemId: string) => {
    if (!currentUser) return

    try {
      const isLiked = await toggleLike(currentUser.id, itemId)
      setLikedItems((prev) => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.add(itemId)
        } else {
          newSet.delete(itemId)
        }
        return newSet
      })
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const clearFilters = () => {
    setFilters({
      itemTypes: {
        tops: false,
        bottoms: false,
        dresses: false,
        outerwear: false,
        shoes: false,
        accessories: false,
      },
      priceRange: {
        min: 0,
        max: 100,
      },
    })
  }

  const handleFilterChange = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      itemTypes: {
        ...prev.itemTypes,
        [type]: checked,
      },
    }))
  }

  const handlePriceChange = (field: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value,
      },
    }))
  }

  // Show loading while checking auth
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Search & Browse</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Find the perfect pre-loved items from our community
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-black rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-900">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search items, brands, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-gray-100 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white dark:bg-black rounded-xl shadow-md p-4 sm:p-6 sticky top-20 sm:top-24 border border-gray-100 dark:border-gray-900">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear All
                </button>
              </div>

              {/* Item Type Filters */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Sliders className="h-4 w-4 mr-2" />
                  Item Types
                </h4>
                <div className="space-y-3">
                  {Object.entries(filters.itemTypes).map(([type, checked]) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleFilterChange(type, e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300 capitalize text-sm sm:text-base">
                        {type === "tshirts" ? "T-Shirts" : type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Minimum Price: ${filters.priceRange.min}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange("min", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Maximum Price: ${filters.priceRange.max}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange("max", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange("min", Number.parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-black text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange("max", Number.parseInt(e.target.value) || 100)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-black text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Showing {items.length} items</p>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-black rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100 dark:border-gray-900"
                >
                  <div className="relative">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg"}
                      alt={item.title}
                      width={300}
                      height={300}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white dark:bg-black px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                      {item.condition}
                    </div>
                    <button
                      onClick={() => handleLike(item.id)}
                      className="absolute top-2 left-2 p-1.5 bg-white dark:bg-black rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-800"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          likedItems.has(item.id) ? "text-red-500 fill-current" : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                      {item.category}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {item.points} points
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">${item.price}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {item.user?.rating || 5.0}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                      by {item.user?.first_name} {item.user?.last_name}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/item/${item.id}`}
                        className="flex-1 btn-secondary text-center text-xs sm:text-sm py-2"
                      >
                        View Details
                      </Link>
                      <button className="flex-1 btn-primary text-xs sm:text-sm py-2">Request Swap</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {items.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
