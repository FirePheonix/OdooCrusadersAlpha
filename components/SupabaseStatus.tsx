"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, Database } from "lucide-react"

export function SupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")

  useEffect(() => {
    const checkSupabase = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const hasValidConfig = !!(
        supabaseUrl &&
        supabaseKey &&
        supabaseUrl !== "https://your-project-id.supabase.co" &&
        supabaseUrl.includes("supabase.co")
      )

      setIsConfigured(hasValidConfig)

      if (hasValidConfig) {
        try {
          // Test the connection
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          })

          if (response.ok) {
            setConnectionStatus("connected")
          } else {
            setConnectionStatus("error")
          }
        } catch (error) {
          console.error("Supabase connection test failed:", error)
          setConnectionStatus("error")
        }
      }

      setIsChecking(false)
    }

    checkSupabase()
  }, [])

  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="text-blue-800 dark:text-blue-200 text-xs font-medium">Checking Database...</span>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 max-w-sm shadow-lg z-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Demo Mode</h4>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
              Supabase not configured. Using mock data for demonstration.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (connectionStatus === "error") {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 max-w-sm shadow-lg z-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200 text-sm">Database Error</h4>
            <p className="text-red-700 dark:text-red-300 text-xs mt-1">
              Cannot connect to Supabase. Check your configuration.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-green-800 dark:text-green-200 text-xs font-medium">Database Connected</span>
      </div>
    </div>
  )
}
