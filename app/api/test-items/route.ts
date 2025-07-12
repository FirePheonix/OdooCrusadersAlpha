import { NextRequest, NextResponse } from "next/server"
import { getItems } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeSwapped = searchParams.get("includeSwapped") === "true"
    
    // Get items with different filters
    const allItems = await getItems()
    const availableItems = await getItems({ status: "available" })
    const swappedItems = await getItems({ status: "swapped" })
    const itemsWithSwapped = await getItems({ includeSwapped: true })
    
    return NextResponse.json({
      allItems: allItems?.length || 0,
      availableItems: availableItems?.length || 0,
      swappedItems: swappedItems?.length || 0,
      itemsWithSwapped: itemsWithSwapped?.length || 0,
      sampleItems: allItems?.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        status: item.status,
        created_at: item.created_at
      })) || []
    })
  } catch (error) {
    console.error("Error testing items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 