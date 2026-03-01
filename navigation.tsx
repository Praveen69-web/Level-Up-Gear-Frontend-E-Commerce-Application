"use client"

import Link from "next/link"
import { Plus, Zap, LogOut, ShoppingCart, User } from "@/lib/icons"
import { useState, useEffect } from "react"
import { authService, type User as AuthUser, type CartItem } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Update cart count
    if (currentUser && currentUser.role === "buyer") {
      const carts = JSON.parse(localStorage.getItem("levelupgear_carts") || "{}") as Record<string, CartItem[]>
      const cart = carts[currentUser.id] || []
      setCartCount(cart.length)
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedUser = authService.getCurrentUser()
      setUser(updatedUser)
      if (updatedUser && updatedUser.role === "buyer") {
        const carts = JSON.parse(localStorage.getItem("levelupgear_carts") || "{}") as Record<string, CartItem[]>
        const cart = carts[updatedUser.id] || []
        setCartCount(cart.length)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-black to-purple-900 text-white shadow-2xl neon-glow border-b border-purple-500/50">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition">
          <div className="bg-gradient-to-br from-purple-500 to-cyan-500 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            LevelupGear
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex gap-2">
              <Link
                href="/signin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-bold transition"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <>
              {user.role === "buyer" && (
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {user.role === "seller" && (
                <Link
                  href="/seller/dashboard"
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition"
                >
                  <Plus className="w-5 h-5" />
                  Seller Dashboard
                </Link>
              )}

              <div className="flex items-center gap-2 bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-gray-200">{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
