import { supabase, type User, type Item, type UserToken, type Swap, type Report } from "./supabase"

// User operations
export async function createUser(userData: Partial<User>) {
  try {
    const { data, error } = await supabase.from("users").insert(userData).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("clerk_id", clerkId).single()
    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error getting user by clerk ID:", error)
    throw error
  }
}

export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Item operations
export async function getItems(filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  status?: string
  userId?: string
  includeSwapped?: boolean
}) {
  try {
    let query = supabase
      .from("items")
      .select(`
        *,
        user:users!items_user_id_fkey(*)
      `)
      .order("created_at", { ascending: false })

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice)
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice)
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`,
      )
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    } else {
      // By default, exclude deleted and swapped items from browse/search
      // unless explicitly requested (for dashboard)
      if (filters?.includeSwapped) {
        query = query.neq("status", "deleted")
      } else {
        query = query.neq("status", "deleted").neq("status", "swapped")
      }
    }

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting items:", error)
    throw error
  }
}

export async function getItemById(id: string) {
  try {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        user:users!items_user_id_fkey(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting item by ID:", error)
    throw error
  }
}

export async function createItem(itemData: Partial<Item>) {
  try {
    const { data, error } = await supabase.from("items").insert(itemData).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating item:", error)
    throw error
  }
}

export async function updateItem(id: string, updates: Partial<Item>) {
  try {
    const { data, error } = await supabase.from("items").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating item:", error)
    throw error
  }
}

export async function deleteItem(id: string) {
  try {
    const { error } = await supabase.from("items").update({ status: "deleted" }).eq("id", id)
    if (error) throw error
  } catch (error) {
    console.error("Error deleting item:", error)
    throw error
  }
}

export async function incrementItemViews(id: string) {
  try {
    const { error } = await supabase.rpc("increment_item_views", { item_id: id })
    if (error) throw error
  } catch (error) {
    console.error("Error incrementing item views:", error)
    throw error
  }
}

// User token operations
export async function getUserTokens(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_tokens")
      .select("*")
      .eq("user_id", userId)
      .order("earned_date", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting user tokens:", error)
    throw error
  }
}

export async function createUserToken(tokenData: Partial<UserToken>) {
  try {
    const { data, error } = await supabase.from("user_tokens").insert(tokenData).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating user token:", error)
    throw error
  }
}

// Swap operations
export async function getSwaps(userId: string) {
  try {
    const { data, error } = await supabase
      .from("swaps")
      .select(`
        *,
        requester:users!swaps_requester_id_fkey(*),
        owner:users!swaps_owner_id_fkey(*),
        item:items!swaps_item_id_fkey(*),
        offered_item:items!swaps_offered_item_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting swaps:", error)
    throw error
  }
}

export async function createSwap(swapData: Partial<Swap>) {
  try {
    const { data, error } = await supabase.from("swaps").insert(swapData).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating swap:", error)
    throw error
  }
}

export async function updateSwap(id: string, updates: Partial<Swap>) {
  try {
    const { data, error } = await supabase.from("swaps").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating swap:", error)
    throw error
  }
}

// Report operations
export async function createReport(reportData: Partial<Report>) {
  try {
    const { data, error } = await supabase.from("reports").insert(reportData).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating report:", error)
    throw error
  }
}

export async function getReports() {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey(*),
        item:items(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting reports:", error)
    throw error
  }
}

// Like operations
export async function toggleLike(userId: string, itemId: string) {
  try {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .single()

    if (existingLike) {
      // Remove like
      const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("item_id", itemId)
      if (error) throw error
      return false
    } else {
      // Add like
      const { error } = await supabase.from("likes").insert({ user_id: userId, item_id: itemId })
      if (error) throw error
      return true
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    throw error
  }
}

export async function getUserLikes(userId: string) {
  try {
    const { data, error } = await supabase
      .from("likes")
      .select(`
        *,
        item:items!likes_item_id_fkey(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting user likes:", error)
    throw error
  }
}

// Admin operations
export async function getAllUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function getFlaggedItems() {
  try {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        user:users!items_user_id_fkey(*)
      `)
      .eq("flagged", true)
      .order("report_count", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting flagged items:", error)
    throw error
  }
}

export async function getAdminStats() {
  try {
    const [usersResult, itemsResult, swapsResult, reportsResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("items").select("id", { count: "exact", head: true }),
      supabase.from("swaps").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id").eq("status", "pending"),
    ])

    return {
      totalUsers: usersResult.count || 0,
      totalItems: itemsResult.count || 0,
      totalSwaps: swapsResult.count || 0,
      pendingReports: reportsResult.data?.length || 0,
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    throw error
  }
}
