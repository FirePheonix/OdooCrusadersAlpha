import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updateSwap, getItemById, updateItem, getUserByClerkId } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { action } = body // "approve", "reject", "complete", "cancel"

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // Get the swap to verify ownership and current status
    const { data: swap, error: swapError } = await supabase
      .from("swaps")
      .select("*")
      .eq("id", params.id)
      .single()

    if (swapError || !swap) {
      return NextResponse.json({ error: "Swap not found" }, { status: 404 })
    }

    // Verify user has permission to perform this action
    const isOwner = swap.owner_id === user.id
    const isRequester = swap.requester_id === user.id

    if (!isOwner && !isRequester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let newStatus: "accepted" | "rejected" | "completed" | "cancelled" | "pending"
    let updates: any = {}

    switch (action) {
      case "approve":
        if (!isOwner) {
          return NextResponse.json({ error: "Only the owner can approve swaps" }, { status: 403 })
        }
        if (swap.status !== "pending") {
          return NextResponse.json({ error: "Can only approve pending swaps" }, { status: 400 })
        }
        newStatus = "accepted"
        break

      case "reject":
        if (!isOwner) {
          return NextResponse.json({ error: "Only the owner can reject swaps" }, { status: 403 })
        }
        if (swap.status !== "pending") {
          return NextResponse.json({ error: "Can only reject pending swaps" }, { status: 400 })
        }
        newStatus = "rejected"
        break

      case "complete":
        if (!isOwner && !isRequester) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        if (swap.status !== "accepted") {
          return NextResponse.json({ error: "Can only complete accepted swaps" }, { status: 400 })
        }
        newStatus = "completed"
        
        // Update item statuses to swapped
        await updateItem(swap.item_id, { status: "swapped" })
        if (swap.offered_item_id) {
          await updateItem(swap.offered_item_id, { status: "swapped" })
        }
        break

      case "cancel":
        if (!isRequester) {
          return NextResponse.json({ error: "Only the requester can cancel swaps" }, { status: 403 })
        }
        if (swap.status !== "pending") {
          return NextResponse.json({ error: "Can only cancel pending swaps" }, { status: 400 })
        }
        newStatus = "cancelled"
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    updates.status = newStatus

    const updatedSwap = await updateSwap(params.id, updates)

    return NextResponse.json(updatedSwap)
  } catch (error) {
    console.error("Error updating swap:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the swap with all related data
    const { data: swap, error } = await supabase
      .from("swaps")
      .select(`
        *,
        requester:users!swaps_requester_id_fkey(*),
        owner:users!swaps_owner_id_fkey(*),
        item:items!swaps_item_id_fkey(*),
        offered_item:items!swaps_offered_item_id_fkey(*)
      `)
      .eq("id", params.id)
      .single()

    if (error || !swap) {
      return NextResponse.json({ error: "Swap not found" }, { status: 404 })
    }

    // Verify user has access to this swap
    if (swap.requester_id !== user.id && swap.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(swap)
  } catch (error) {
    console.error("Error getting swap:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 