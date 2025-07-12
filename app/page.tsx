"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Recycle, Heart, Star } from "lucide-react"
import { getItems } from "@/lib/database"
import { useEffect, useState } from "react"
import type { Item } from "@/lib/supabase"

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([])
  const [recentListings, setRecentListings] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch featured items (items with high likes/views) - only available items
        const allItems = await getItems({ status: "available" })
        if (allItems) {
          // Sort by likes and views to get featured items
          const featured = allItems
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 3)
          setFeaturedItems(featured)

          // Get recent listings
          const recent = allItems
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4)
          setRecentListings(recent)
        }
      } catch (error) {
        console.error("Error loading homepage data:", error)
        // Fallback to empty arrays
        setFeaturedItems([])
        setRecentListings([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const categories = [
    { name: "Tops", image: "/placeholder.svg?height=200&width=200", count: "1,234 items" },
    { name: "Bottoms", image: "/placeholder.svg?height=200&width=200", count: "856 items" },
    { name: "Dresses", image: "/placeholder.svg?height=200&width=200", count: "432 items" },
    { name: "Accessories", image: "/placeholder.svg?height=200&width=200", count: "678 items" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Sustainable Fashion
            <span className="block text-blue-600 dark:text-blue-400">Starts Here</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of fashion lovers swapping, donating, and discovering pre-loved clothing. Reduce waste, save
            money, and refresh your wardrobe sustainably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-primary inline-flex items-center">
              Start Swapping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/browse" className="btn-secondary">
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Active Members</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                <Recycle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Items Swapped</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">2 Tons</h3>
              <p className="text-gray-600 dark:text-gray-300">Waste Prevented</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Featured Items</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <Link key={item.id} href={`/item/${item.id}`} className="card group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg"}
                      alt={item.title}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.points} points</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {item.user?.rating || 5.0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/browse?category=${category.name.toLowerCase()}`} className="group">
                <div className="card text-center group-hover:shadow-xl transition-shadow duration-200">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Listings</h2>
            <Link
              href="/browse"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((item) => (
                <Link key={item.id} href={`/item/${item.id}`} className="group">
                  <div className="card group-hover:shadow-xl transition-shadow duration-200">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <Image
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.title}
                        width={250}
                        height={250}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.condition}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Size: {item.size}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.points} points</span>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Available</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Sustainable Fashion Journey?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
            Join our community today and make a positive impact on the environment while refreshing your wardrobe.
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200 font-medium py-4 px-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
