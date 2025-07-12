import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { createUser, updateUser, getUserByClerkId } from "@/lib/database"

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local")
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      // Create user in our database
      await createUser({
        clerk_id: id,
        email: email_addresses[0]?.email_address || "",
        first_name: first_name || "",
        last_name: last_name || "",
        image_url: image_url || "",
        points: 0,
        total_swaps: 0,
        rating: 5.0,
        status: "active",
        role: "user",
      })

      console.log("User created:", id)
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      // Check if user exists in our database
      const existingUser = await getUserByClerkId(id)

      if (existingUser) {
        // Update existing user
        await updateUser(existingUser.id, {
          email: email_addresses[0]?.email_address || existingUser.email,
          first_name: first_name || existingUser.first_name,
          last_name: last_name || existingUser.last_name,
          image_url: image_url || existingUser.image_url,
        })
      } else {
        // Create user if they don't exist
        await createUser({
          clerk_id: id,
          email: email_addresses[0]?.email_address || "",
          first_name: first_name || "",
          last_name: last_name || "",
          image_url: image_url || "",
          points: 0,
          total_swaps: 0,
          rating: 5.0,
          status: "active",
          role: "user",
        })
      }

      console.log("User updated:", id)
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data

      if (!id) {
        console.error("No user ID provided in deletion webhook")
        return new Response("Missing user ID", { status: 400 })
      }

      // Get user from database
      const existingUser = await getUserByClerkId(id)
      
      if (existingUser) {
        // Soft delete user (set status to banned and clear sensitive data)
        await updateUser(existingUser.id, {
          status: "banned",
          email: `deleted_${Date.now()}@deleted.com`,
          first_name: "Deleted",
          last_name: "User",
          image_url: undefined,
          bio: undefined,
          location: undefined,
        })
      }

      console.log("User deleted:", id)
    }

    return new Response("Webhook processed successfully", { status: 200 })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return new Response("Error processing webhook", { status: 500 })
  }
}
