"use client"

import Link from "next/link"
import Navigation from "@/components/navigation"

export default function NotFound() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl text-gray-300 mb-8">Page not found</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  )
}
