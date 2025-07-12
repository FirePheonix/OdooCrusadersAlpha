"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Recycle, Heart, Star } from "lucide-react"
import { getItems } from "@/lib/database"
import { useEffect, useState } from "react"
import type { Item } from "@/lib/supabase"
import GridDistortion from "@/components/GridDistortion"

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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen bg-black">
        {/* Background Distortion Effect */}
        <div className="absolute inset-0 z-0">
          <GridDistortion
            imageSrc="/background.jpg"
            grid={10}
            mouse={0.1}
            strength={0.15}
            relaxation={0.9}
            className="w-full h-full"
          />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4">
          <div className="max-w-7xl mx-auto text-center">
            
            
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-mono tracking-wider">
            SUSTAINABLE FASHION
            <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-mono tracking-wider">
              BEGINS WITH YOU
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto font-light">
            Embrace the future of fashion — conscious, chic, and circular. Discover timeless style through curated pre-loved pieces, 
            and join a global movement redefining luxury through sustainability.
          </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="bg-white text-black hover:bg-gray-200 font-bold py-4 px-8 rounded-xl transition-colors duration-200 inline-flex items-center font-mono">
                START SWAPPING
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/browse" className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-xl transition-colors duration-200 font-mono">
                BROWSE ITEMS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 font-mono">10,000+</h3>
              <p className="text-gray-300 font-mono">ACTIVE MEMBERS</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-full mb-4">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 font-mono">50,000+</h3>
              <p className="text-gray-300 font-mono">ITEMS SWAPPED</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-full mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 font-mono">2 TONS</h3>
              <p className="text-gray-300 font-mono">WASTE PREVENTED</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-16 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12 font-mono tracking-wide">🎯 FEATURED ITEMS</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <Link key={item.id} href={`/item/${item.id}`} className="bg-gray-900 border border-gray-700 rounded-xl p-6 group cursor-pointer hover:border-white transition-colors duration-200">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg"}
                      alt={item.title}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-mono">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-800 text-white text-sm rounded-full font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white font-mono">{item.points} points</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300 ml-1 font-mono">
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
      <section className="py-16 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12 font-mono tracking-wide">🛍️ SHOP BY CATEGORY</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/browse?category=${category.name.toLowerCase()}`} className="group">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center group-hover:border-white transition-colors duration-200">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 font-mono">{category.name}</h3>
                  <p className="text-sm text-gray-300 font-mono">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white font-mono tracking-wide">🆕 RECENT LISTINGS</h2>
            <Link
              href="/browse"
              className="text-white hover:text-gray-300 font-medium font-mono border-b border-white hover:border-gray-300 transition-colors"
            >
              VIEW ALL →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((item) => (
                <Link key={item.id} href={`/item/${item.id}`} className="group">
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 group-hover:border-white transition-colors duration-200">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <Image
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.title}
                        width={250}
                        height={250}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2 bg-black border border-gray-600 px-2 py-1 rounded-full text-xs font-medium text-white font-mono">
                        {item.condition}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 font-mono">{item.title}</h3>
                    <p className="text-sm text-gray-300 mb-2 font-mono">Size: {item.size}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white font-mono">{item.points} points</span>
                      <span className="text-sm text-green-400 font-medium font-mono">AVAILABLE</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-mono tracking-wide">
            🚀 READY TO START YOUR SUSTAINABLE FASHION JOURNEY?
          </h2>
          <p className="text-xl text-gray-300 mb-8 font-light">
            Join our community today and make a positive impact on the environment while refreshing your wardrobe.
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-black hover:bg-gray-200 font-bold py-4 px-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center font-mono"
          >
            🎯 GET STARTED NOW
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
