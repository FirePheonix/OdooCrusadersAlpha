import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect these routes (add or remove as needed)
    "/dashboard(.*)",
    "/add-item(.*)",
    "/admin(.*)",
    "/search(.*)",
    "/avatar(.*)",
    "/api/items(.*)",
    "/api/swaps(.*)",
    "/api/webhooks/(.*)",
  ],
}
