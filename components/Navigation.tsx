"use client"

import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { useState } from "react"
import { Menu, X, Shirt } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

export default function Navigation() {
  const { isSignedIn, user } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-black shadow-sm border-b border-gray-100 dark:border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-500 dark:bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <Shirt className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">ReWear</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
            >
              Home
            </Link>
            <Link
              href="/browse"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
            >
              Browse
            </Link>
            <Link
              href="/search"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
            >
              Search
            </Link>
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
                >
                  Dashboard
                </Link>
                <Link
                  href="/add-item"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
                >
                  Add Item
                </Link>
                <Link
                  href="/avatar"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
                >
                  Avatar
                </Link>
                {user?.publicMetadata?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Admin
                  </Link>
                )}
                <ThemeToggle />
                <div className="scale-75 sm:scale-100">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <ThemeToggle />
                <Link
                  href="/sign-in"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
                >
                  Login
                </Link>
                <Link href="/sign-up" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-900">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Items
              </Link>
              <Link
                href="/search"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/add-item"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Add Item
                  </Link>
                  <Link
                    href="/avatar"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Avatar
                  </Link>
                  {user?.publicMetadata?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="pt-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/sign-in"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link href="/sign-up" className="btn-primary text-center py-2" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
