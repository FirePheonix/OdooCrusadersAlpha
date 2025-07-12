import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getItemById, updateItem, deleteItem } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getItemById(params.id)
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    
    return NextResponse.json({ item }, { status: 200 })
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await auth()
    const userId = authResult?.userId
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Check if user owns the item
    const item = await getItemById(params.id)
    if (!item || item.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized to update this item" }, { status: 403 })
    }

    const updatedItem = await updateItem(params.id, body)
    
    return NextResponse.json({ item: updatedItem }, { status: 200 })
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await auth()
    const userId = authResult?.userId
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the item
    const item = await getItemById(params.id)
    if (!item || item.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this item" }, { status: 403 })
    }

    await deleteItem(params.id)
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
