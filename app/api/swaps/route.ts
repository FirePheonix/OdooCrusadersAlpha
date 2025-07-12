import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createSwap, getSwaps, getUserByClerkId, getItemById } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { itemId, offeredItemId, message } = body

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // Get the item to find the owner
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("user_id, status")
      .eq("id", itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.user_id === user.id) {
      return NextResponse.json({ error: "Cannot swap with your own item" }, { status: 400 })
    }

    if (item.status !== "available") {
      return NextResponse.json({ error: "Item is not available for swapping" }, { status: 400 })
    }

    // Create the swap request
    const swapData = {
      requester_id: user.id,
      owner_id: item.user_id,
      item_id: itemId,
      offered_item_id: offeredItemId || null,
      status: "pending" as const,
      message: message || null,
    }

    const swap = await createSwap(swapData)

    return NextResponse.json(swap, { status: 201 })
  } catch (error) {
    console.error("Error creating swap request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "received" or "made"

    const swaps = await getSwaps(user.id)

    if (type === "received") {
      // Filter swaps where user is the owner (received requests)
      const receivedSwaps = swaps?.filter(swap => swap.owner_id === user.id) || []
      return NextResponse.json(receivedSwaps)
    } else if (type === "made") {
      // Filter swaps where user is the requester (made requests)
      const madeSwaps = swaps?.filter(swap => swap.requester_id === user.id) || []
      return NextResponse.json(madeSwaps)
    } else {
      // Return all swaps
      return NextResponse.json(swaps || [])
    }
  } catch (error) {
    console.error("Error getting swaps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 