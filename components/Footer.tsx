import Link from "next/link"
import { Shirt, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-500 dark:bg-blue-600 p-2 rounded-lg">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ReWear</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              Join the sustainable fashion movement. Swap, donate, and discover pre-loved clothing while reducing
              textile waste and building a more sustainable future.
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500" />
              <span>for sustainability</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Browse Items
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  href="/add-item"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Add Item
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 ReWear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
