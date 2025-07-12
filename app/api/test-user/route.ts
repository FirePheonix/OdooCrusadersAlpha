import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId, createUser } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists in database
    let user = await getUserByClerkId(userId)
    
    if (!user) {
      // User doesn't exist, create them
      user = await createUser({
        clerk_id: userId,
        email: "test@example.com", // You might want to get this from Clerk
        first_name: "Test",
        last_name: "User",
        image_url: "",
        points: 0,
        total_swaps: 0,
        rating: 5.0,
        status: "active",
        role: "user",
      })
      
      return NextResponse.json({ 
        message: "User created in database", 
        user,
        created: true 
      })
    }

    return NextResponse.json({ 
      message: "User already exists in database", 
      user,
      created: false 
    })
  } catch (error) {
    console.error("Error testing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 