"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Eye, Star, Package, Heart, TrendingUp } from "lucide-react"
import { getUserByClerkId, getItems, getSwaps } from "@/lib/database"
import type { Item, Swap } from "@/lib/supabase"

// Add mock data at the top of the file
const mockListings = [
  {
    id: "1",
    title: "Vintage Denim Jacket",
    images: ["/placeholder.svg?height=200&width=200"],
    points: 30,
    status: "available" as const,
    views: 24,
    likes: 5,
    created_at: new Date().toISOString(),
    user_id: "mock",
    description: "Classic vintage denim jacket",
    category: "outerwear" as const,
    size: "M",
    condition: "excellent" as const,
    price: 35,
    tags: ["vintage", "denim"],
    listing_type: "swap" as const,
    report_count: 0,
    flagged: false,
    updated_at: new Date().toISOString(),
  },
]

const mockSwaps = [
  {
    id: "1",
    requester_id: "user1",
    owner_id: "mock",
    item_id: "item1",
    status: "completed" as const,
    message: "Great transaction!",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    requester: {
      id: "user1",
      first_name: "Emma",
      last_name: "Wilson",
      email: "emma@example.com",
      clerk_id: "user_1",
      image_url: "/placeholder.svg",
      points: 156,
      total_swaps: 15,
      rating: 4.8,
      status: "active" as const,
      role: "user" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    item: {
      id: "item1",
      title: "Wool Winter Coat",
      description: "Warm winter coat",
      category: "outerwear" as const,
      size: "L",
      condition: "excellent" as const,
      price: 45,
      points: 35,
      tags: ["wool", "winter"],
      images: ["/placeholder.svg"],
      status: "swapped" as const,
      listing_type: "swap" as const,
      views: 32,
      likes: 12,
      report_count: 0,
      flagged: false,
      user_id: "mock",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("listings")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [myListings, setMyListings] = useState<Item[]>([])
  const [mySwaps, setMySwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)

  // Update the loadUserData function:
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true)

      if (user?.id) {
        const userData = await getUserByClerkId(user.id)
        setCurrentUser(userData)

        if (userData) {
          const listings = await getItems({ userId: userData.id })
          setMyListings(listings || [])

          const swaps = await getSwaps(userData.id)
          setMySwaps(swaps || [])
        } else {
          console.warn("User not found in database")
          setMyListings([])
          setMySwaps([])
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setMyListings([])
      setMySwaps([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load user data
  useEffect(() => {
    if (isSignedIn && user) {
      loadUserData()
    }
  }, [isSignedIn, user, loadUserData])

  const userStats = {
    points: currentUser?.points || 0,
    totalListings: myListings.length,
    completedSwaps: mySwaps.filter((swap) => swap.status === "completed").length,
    wishlistItems: 0, // TODO: Implement wishlist
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Manage your listings, swaps, and profile
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-black rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-900">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              <Image
                src={user?.imageUrl || "/placeholder.svg?height=80&width=80"}
                alt={user?.fullName || "User"}
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
              />
              <div className="flex-1 md:flex-none">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-all">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {currentUser?.rating || 5.0} rating • {userStats.completedSwaps} swaps completed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.points}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {userStats.totalListings}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Listings</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {userStats.completedSwaps}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Swaps</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  {userStats.wishlistItems}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Wishlist</div>
              </div>
            </div>

            <Link href="/add-item" className="btn-primary w-full md:w-auto text-center text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Item
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-black rounded-xl shadow-md mb-6 sm:mb-8 border border-gray-100 dark:border-gray-900">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("listings")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "listings"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                My Listings
              </button>
              <button
                onClick={() => setActiveTab("swaps")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "swaps"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                My Swaps
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Edit className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                Edit Profile
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* My Listings Tab */}
            {activeTab === "listings" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Listings</h3>
                  <Link href="/add-item" className="btn-secondary w-full sm:w-auto text-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {myListings.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                    >
                      <div className="relative">
                        <Image
                          src={item.images?.[0] || "/placeholder.svg"}
                          alt={item.title}
                          width={200}
                          height={200}
                          className="w-full h-40 sm:h-48 object-cover"
                        />
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "available"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : item.status === "pending"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.status}
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                            {item.points} points
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{item.views} views</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{item.likes} likes</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/item/${item.id}`}
                            className="flex-1 btn-secondary text-center text-xs sm:text-sm py-2"
                          >
                            View
                          </Link>
                          <button className="flex-1 btn-primary text-xs sm:text-sm py-2">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {myListings.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start by adding your first item to the platform.
                    </p>
                    <Link href="/add-item" className="btn-primary">
                      Add Your First Item
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* My Swaps Tab */}
            {activeTab === "swaps" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">My Swaps</h3>
                <div className="space-y-4">
                  {mySwaps.map((swap) => (
                    <div key={swap.id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="text-lg sm:text-xl">↔</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                              Swap with {swap.requester?.first_name} {swap.requester?.last_name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Item: {swap.item?.title}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                  swap.status === "completed"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : swap.status === "pending"
                                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                }`}
                              >
                                {swap.status}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {new Date(swap.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="btn-secondary w-full sm:w-auto text-xs sm:text-sm">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>

                {mySwaps.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No swaps yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start browsing items to make your first swap.
                    </p>
                    <Link href="/search" className="btn-primary">
                      Browse Items
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
                <div className="max-w-2xl">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <Image
                          src={user?.imageUrl || "/placeholder.svg?height=80&width=80"}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                        />
                        <button type="button" className="btn-secondary text-sm sm:text-base">
                          Change Photo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input type="text" defaultValue={user?.firstName || ""} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input type="text" defaultValue={user?.lastName || ""} className="input-field" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about yourself and your style..."
                        defaultValue={currentUser?.bio || ""}
                        className="input-field resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="City, State"
                        defaultValue={currentUser?.location || ""}
                        className="input-field"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
