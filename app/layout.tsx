import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/components/ThemeProvider"
import { SupabaseStatus } from "@/components/SupabaseStatus"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReWear - Sustainable Clothing Swap Platform",
  description: "Join the sustainable fashion movement. Swap, donate, and discover pre-loved clothing.",
  viewport: "width=device-width, initial-scale=1",
  generator: 'v0.dev',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#3b82f6",
        },
      }}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-slate-50 dark:bg-black min-h-screen transition-colors`}>
          <ThemeProvider defaultTheme="system" storageKey="rewear-ui-theme">
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <SupabaseStatus />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
