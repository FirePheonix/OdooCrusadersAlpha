import { SignUp } from "@clerk/nextjs"
import { Shirt } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <Shirt className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join ReWear</h1>
          <p className="text-gray-600 dark:text-gray-300">Start your sustainable fashion journey today</p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                card: "shadow-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
                formFieldInput:
                  "border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                footerActionLink: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
                formFieldLabel: "text-gray-700 dark:text-gray-300",
                dividerLine: "bg-gray-200 dark:bg-gray-700",
                dividerText: "text-gray-500 dark:text-gray-400",
                socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-200",
                formButtonReset: "text-blue-600 hover:text-blue-700 dark:text-blue-400",
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
          />
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
