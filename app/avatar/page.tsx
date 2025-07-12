"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Trophy, Star, Gift } from "lucide-react"
import { getUserByClerkId, getUserTokens } from "@/lib/database"
import type { UserToken } from "@/lib/supabase"

// Add mock data at the top of the file
const mockUserTokens = [
  {
    id: "1",
    item_type: "hats" as const,
    emoji: "🧢",
    item_name: "Baseball Cap",
    earned_date: "2024-01-15",
    user_id: "mock",
  },
  {
    id: "2",
    item_type: "gloves" as const,
    emoji: "🧤",
    item_name: "Winter Gloves",
    earned_date: "2024-01-20",
    user_id: "mock",
  },
  {
    id: "3",
    item_type: "socks" as const,
    emoji: "🧦",
    item_name: "Wool Socks",
    earned_date: "2024-01-25",
    user_id: "mock",
  },
  {
    id: "4",
    item_type: "hats" as const,
    emoji: "🎩",
    item_name: "Top Hat",
    earned_date: "2024-02-01",
    user_id: "mock",
  },
]

export default function AvatarPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userTokens, setUserTokens] = useState<UserToken[]>([])
  const [loading, setLoading] = useState(true)

  // Handle redirect in useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  // Update the loadUserData function:
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true)

      if (user?.id) {
        try {
          const userData = await getUserByClerkId(user.id)
          setCurrentUser(userData)

          if (userData) {
            const tokens = await getUserTokens(userData.id)
            setUserTokens(tokens || [])
          }
        } catch (error) {
          console.warn("Supabase not configured, using mock data")
          setCurrentUser({
            id: "mock-user",
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.primaryEmailAddress?.emailAddress,
            points: 125,
            total_swaps: 12,
            created_at: new Date().toISOString(),
          })
          setUserTokens(mockUserTokens)
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      // Fallback to mock data
      setCurrentUser({
        id: "mock-user",
        points: 125,
        total_swaps: 12,
        created_at: new Date().toISOString(),
      })
      setUserTokens(mockUserTokens)
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

  // Group tokens by body part
  const tokensByPart = {
    head: userTokens.filter((token) => token.item_type === "hats"),
    hands: userTokens.filter((token) => token.item_type === "gloves"),
    feet: userTokens.filter((token) => token.item_type === "socks"),
    body: userTokens.filter((token) => ["tshirts", "trousers"].includes(token.item_type)),
  }

  const userStats = {
    pointsEarned: currentUser?.points || 0,
    totalSwaps: currentUser?.total_swaps || 0,
    tokensEarned: userTokens.length,
    memberSince: currentUser?.created_at
      ? new Date(currentUser.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Recently",
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Avatar</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Your sustainable fashion journey visualized
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Avatar Display */}
          <div className="bg-white dark:bg-black rounded-xl shadow-md p-6 sm:p-8 border border-gray-100 dark:border-gray-900">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
              {user?.firstName}&apos;s Avatar
            </h2>

            {/* Stick Figure Avatar */}
            <div className="flex flex-col items-center justify-center min-h-80 sm:min-h-96 relative">
              {/* Head Area */}
              <div className="relative mb-4">
                {/* Head emojis */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {tokensByPart.head.map((token, index) => (
                    <span key={token.id} className="text-xl sm:text-2xl" style={{ zIndex: index + 1 }}>
                      {token.emoji}
                    </span>
                  ))}
                </div>
                {/* Head */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-200 dark:bg-yellow-300 rounded-full border-4 border-gray-800 dark:border-gray-200 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">😊</span>
                </div>
              </div>

              {/* Body */}
              <div className="w-2 h-16 sm:h-20 bg-gray-800 dark:bg-gray-200 mb-4 relative">
                {/* Body emojis */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-1">
                  {tokensByPart.body.map((token) => (
                    <span key={token.id} className="text-lg sm:text-xl">
                      {token.emoji}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arms */}
              <div className="absolute top-20 sm:top-24 left-1/2 transform -translate-x-1/2 flex items-center">
                <div className="relative">
                  {/* Left arm emoji */}
                  <div className="absolute -left-6 sm:-left-8 -top-2">
                    {tokensByPart.hands.slice(0, 1).map((token) => (
                      <span key={token.id} className="text-lg sm:text-xl">
                        {token.emoji}
                      </span>
                    ))}
                  </div>
                  {/* Left arm */}
                  <div className="w-10 h-2 sm:w-12 sm:h-2 bg-gray-800 dark:bg-gray-200 transform -rotate-45 -translate-x-5 sm:-translate-x-6"></div>
                </div>

                <div className="w-6 sm:w-8"></div>

                <div className="relative">
                  {/* Right arm emoji */}
                  <div className="absolute -right-6 sm:-right-8 -top-2">
                    {tokensByPart.hands.slice(1, 2).map((token) => (
                      <span key={token.id} className="text-lg sm:text-xl">
                        {token.emoji}
                      </span>
                    ))}
                  </div>
                  {/* Right arm */}
                  <div className="w-10 h-2 sm:w-12 sm:h-2 bg-gray-800 dark:bg-gray-200 transform rotate-45 translate-x-5 sm:translate-x-6"></div>
                </div>
              </div>

              {/* Legs */}
              <div className="flex gap-3 sm:gap-4">
                {/* Left leg */}
                <div className="w-2 h-12 sm:h-16 bg-gray-800 dark:bg-gray-200 transform -rotate-12"></div>
                {/* Right leg */}
                <div className="w-2 h-12 sm:h-16 bg-gray-800 dark:bg-gray-200 transform rotate-12"></div>
              </div>

              {/* Feet Area */}
              <div className="flex gap-6 sm:gap-8 mt-2">
                {tokensByPart.feet.slice(0, 2).map((token, index) => (
                  <span key={token.id} className="text-lg sm:text-xl">
                    {token.emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats and Tokens */}
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-black rounded-xl shadow-md p-3 sm:p-4 text-center border border-gray-100 dark:border-gray-900">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.pointsEarned}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Points Earned</div>
              </div>

              <div className="bg-white dark:bg-black rounded-xl shadow-md p-3 sm:p-4 text-center border border-gray-100 dark:border-gray-900">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.totalSwaps}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Swaps</div>
              </div>

              <div className="bg-white dark:bg-black rounded-xl shadow-md p-3 sm:p-4 text-center border border-gray-100 dark:border-gray-900">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.tokensEarned}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tokens Earned</div>
              </div>

              <div className="bg-white dark:bg-black rounded-xl shadow-md p-3 sm:p-4 text-center border border-gray-100 dark:border-gray-900">
                <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Member</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Since {userStats.memberSince}</div>
              </div>
            </div>

            {/* Earned Tokens */}
            <div className="bg-white dark:bg-black rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 dark:border-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Earned Tokens</h3>
              <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                {userTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl">{token.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {token.item_name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {token.item_type}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(token.earned_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {userTokens.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl text-gray-400 dark:text-gray-500 mb-2">🎁</div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">No tokens earned yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    Complete swaps to earn tokens and customize your avatar!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
