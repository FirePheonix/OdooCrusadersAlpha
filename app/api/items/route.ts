import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createItem, getItems } from "@/lib/database"
import { getUserByClerkId } from "@/lib/database"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth()
    const clerkUserId = authResult?.userId
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Look up the user's UUID from the users table
    const userRecord = await getUserByClerkId(clerkUserId)
    if (!userRecord || !userRecord.id) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }
    const userId = userRecord.id
    const body = await request.json()
    const { title, description, category, size, condition, tags, images, listing_type, points } = body
    
    // Debug logging
    console.log("Received data:", { title, description, category, size, condition, listing_type, points })
    
    if (!title || !description || !category || !size || !condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Validate category against allowed values
    const allowedCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories']
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ error: `Invalid category: ${category}. Must be one of: ${allowedCategories.join(', ')}` }, { status: 400 })
    }
    const uploadedImages: string[] = []
    if (images && images.length > 0) {
      for (const imageData of images) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(imageData, {
            folder: "rewear-items",
            transformation: [
              { width: 800, height: 800, crop: "fill", quality: "auto" },
            ],
          })
          uploadedImages.push(uploadResponse.secure_url)
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError)
          // Continue with other images even if one fails
        }
      }
    }
    let itemPoints = 0
    if (listing_type === "points") {
      itemPoints = points || 50
    } else if (listing_type === "swap") {
      const categoryPoints = {
        tops: 30,
        bottoms: 35,
        dresses: 40,
        outerwear: 50,
        shoes: 35,
        accessories: 25,
      }
      const conditionMultiplier = {
        "like-new": 1.2,
        excellent: 1.1,
        "very-good": 1.0,
        good: 0.9,
        fair: 0.8,
      }
      itemPoints = Math.round(
        (categoryPoints[category as keyof typeof categoryPoints] || 30) *
        (conditionMultiplier[condition as keyof typeof conditionMultiplier] || 1.0)
      )
    }
    const parsedTags = typeof tags === "string" ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : []
    const itemData = {
      user_id: userId,
      title,
      description,
      category,
      size,
      condition,
      tags: parsedTags,
      images: uploadedImages,
      listing_type: listing_type || "swap",
      points: itemPoints,
      price: 0,
      status: "available" as const,
    }
    try {
      const newItem = await createItem(itemData)
      return NextResponse.json({ success: true, item: newItem }, { status: 201 })
    } catch (dbError: any) {
      // Try to extract Supabase error details
      let errorMsg = "Unknown error"
      if (dbError && typeof dbError === "object") {
        if (dbError.message) errorMsg = dbError.message
        else if (dbError.details) errorMsg = dbError.details
        else errorMsg = JSON.stringify(dbError)
      } else if (typeof dbError === "string") {
        errorMsg = dbError
      }
      console.error("Supabase createItem error:", dbError)
      return NextResponse.json({ error: `Supabase error: ${errorMsg}` }, { status: 500 })
    }
  } catch (error) {
    console.error("API handler error:", error)
    return NextResponse.json({ error: `API handler error: ${error instanceof Error ? error.message : error}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    const filters = {
      category: category || undefined,
      search: search || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      status: status || undefined,
      userId: userId || undefined,
    }

    const items = await getItems(filters)
    
    return NextResponse.json({ items }, { status: 200 })
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
