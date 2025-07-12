import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  clerk_id: string
  email: string
  first_name: string
  last_name: string
  image_url?: string
  points: number
  total_swaps: number
  rating: number
  status: "active" | "suspended" | "banned"
  role: "user" | "admin"
  bio?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  user_id: string
  title: string
  description: string
  category: "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories"
  size: string
  condition: "like-new" | "excellent" | "very-good" | "good" | "fair"
  price: number
  points: number
  tags: string[]
  images: string[]
  status: "available" | "pending" | "swapped" | "flagged" | "deleted"
  listing_type: "swap" | "donate" | "points"
  views: number
  likes: number
  report_count: number
  flagged: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface UserToken {
  id: string
  user_id: string
  item_type: "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories"
  emoji: string
  item_name: string
  earned_date: string
  swap_id?: string
}

export interface Swap {
  id: string
  requester_id: string
  owner_id: string
  item_id: string
  offered_item_id?: string
  points_offered?: number
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  message?: string
  created_at: string
  updated_at: string
  requester?: User
  owner?: User
  item?: Item
  offered_item?: Item
}

export interface Report {
  id: string
  reporter_id: string
  item_id: string
  reason: string
  description?: string
  status: "pending" | "reviewed" | "resolved"
  created_at: string
  reporter?: User
  item?: Item
}
