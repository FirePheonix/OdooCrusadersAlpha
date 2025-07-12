import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { avatarData, clothingItems, emojiItems, drawingStrokes } = await request.json()

    if (!avatarData) {
      return NextResponse.json({ error: "Avatar data is required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Upsert avatar data
    const { data: avatar, error: avatarError } = await supabase
      .from("user_avatars")
      .upsert({
        user_id: user.id,
        avatar_data: avatarData,
        clothing_items: clothingItems || [],
        emoji_items: emojiItems || [],
        drawing_strokes: drawingStrokes || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (avatarError) {
      console.error("Error saving avatar:", avatarError)
      return NextResponse.json({ error: "Failed to save avatar" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      avatar: avatar 
    })

  } catch (error) {
    console.error("Error in avatar API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's avatar
    const { data: avatar, error: avatarError } = await supabase
      .from("user_avatars")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (avatarError && avatarError.code !== "PGRST116") {
      console.error("Error fetching avatar:", avatarError)
      return NextResponse.json({ error: "Failed to fetch avatar" }, { status: 500 })
    }

    return NextResponse.json({ 
      avatar: avatar || null 
    })

  } catch (error) {
    console.error("Error in avatar API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 