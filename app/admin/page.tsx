"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Users, Package, ShoppingCart, Ban, Check, X, Eye, Flag, AlertTriangle } from "lucide-react"
import { getAllUsers, getItems, getFlaggedItems, getAdminStats } from "@/lib/database"
import type { User, Item } from "@/lib/supabase"

export default function AdminPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalSwaps: 0,
    pendingReports: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [listings, setListings] = useState<Item[]>([])
  const [flaggedItems, setFlaggedItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // Handle redirect in useEffect
  useEffect(() => {
    if (isLoaded && (!isSignedIn || user?.publicMetadata?.role !== "admin")) {
      router.push("/dashboard")
    }
  }, [isLoaded, isSignedIn, user?.publicMetadata?.role, router])

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true)
        
        // Load admin stats
        const stats = await getAdminStats()
        setAdminStats(stats)

        // Load users
        const allUsers = await getAllUsers()
        setUsers(allUsers || [])

        // Load all items
        const allItems = await getItems()
        setListings(allItems || [])

        // Load flagged items
        const flagged = await getFlaggedItems()
        setFlaggedItems(flagged || [])
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isSignedIn && user?.publicMetadata?.role === "admin") {
      loadAdminData()
    }
  }, [isSignedIn, user])

  // Show loading while checking auth
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isSignedIn || user?.publicMetadata?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const handleApprove = (listingId: string) => {
    console.log("Approving listing:", listingId)
    // In real app, update Supabase
  }

  const handleReject = (listingId: string) => {
    console.log("Rejecting listing:", listingId)
    // In real app, update Supabase
  }

  const handleDelete = (listingId: string) => {
    console.log("Deleting listing:", listingId)
    // In real app, delete from Supabase
  }

  const handleFlag = (listingId: string) => {
    console.log("Flagging listing:", listingId)
    // In real app, update Supabase
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage users, listings, and platform operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalUsers}</h3>
                <p className="text-gray-600 dark:text-gray-300">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalItems}</h3>
                <p className="text-gray-600 dark:text-gray-300">Total Listings</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalSwaps}</h3>
                <p className="text-gray-600 dark:text-gray-300">Total Swaps</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.pendingReports}</h3>
                <p className="text-gray-600 dark:text-gray-300">Pending Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("listings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "listings"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Listings
              </button>
              <button
                onClick={() => setActiveTab("flagged")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "flagged"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Flagged Items
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">All Users</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Listings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Swaps
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Image
                                src={user.image_url || "/placeholder.svg"}
                                alt={`${user.first_name} ${user.last_name}`}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.total_swaps || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.total_swaps || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.rating || 5.0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                              <Ban className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">All Listings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reports
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {listings.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Image
                                src={item.images?.[0] || "/placeholder.svg"}
                                alt={item.title}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.user?.first_name} {item.user?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.status === "available"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : item.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.report_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleFlag(item.id)}
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                            >
                              <Flag className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Flagged Items Tab */}
            {activeTab === "flagged" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Flagged Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reports
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {flaggedItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Image
                                src={item.images?.[0] || "/placeholder.svg"}
                                alt={item.title}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.user?.first_name} {item.user?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.report_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
