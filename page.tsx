"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { productAPI } from "@/lib/api"
import type { Product } from "@/types"
import { Trash2, Eye, Edit2, Flame, TrendingUp, ShoppingCart } from "@/lib/icons"
import Navigation from "@/components/navigation"
import { authService, cartService, type User as AuthUser } from "@/lib/auth"

const formatPrice = (price: number) => {
  return `₹${(price * 83).toFixed(2)}` // Approximate conversion: $1 = ₹83
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(authService.getCurrentUser())
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getAll()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      alert("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      alert("Please sign in to add items to cart")
      return
    }
    if (user.role !== "buyer") {
      alert("Only buyers can add items to cart")
      return
    }

    cartService.addToCart(user.id, {
      productId: product.id || 0,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || "/placeholder.svg",
      sellerId: product.sellerId || "",
      sellerName: product.sellerName || "Unknown Seller",
    })

    alert("Added to cart!")
    window.dispatchEvent(new Event("storage"))
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    if (!window.confirm("Are you sure you want to delete this product?")) return

    try {
      await productAPI.delete(id)
      setProducts(products.filter((p) => p.id !== id))
      alert("Product deleted successfully")
    } catch (error) {
      alert("Failed to delete product")
    }
  }

  const categories = ["All", ...new Set(products.map((p) => p.category))]
  const filteredProducts = products.filter(
    (p) =>
      (selectedCategory === "All" || p.category === selectedCategory) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const topProducts = products.slice(0, 3)

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-cyan-400 text-xl font-bold animate-pulse">INITIALIZING LEVELUPGEAR...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black">
        <div className="relative overflow-hidden py-16 border-b border-purple-500/30">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 opacity-20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-500/50 rounded-full px-4 py-2 mb-4">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  FEATURED PRODUCTS
                </span>
              </div>
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                LEVELUPGEAR GAMING
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover the ultimate gaming peripherals and components for competitive advantage
              </p>
            </div>

            {/* Featured Products Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {topProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative bg-gradient-to-br from-purple-900/50 to-black border border-purple-500/50 rounded-xl overflow-hidden p-6 hover:border-cyan-500/50 transition">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white flex-1">{product.name}</h3>
                      <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    </div>
                    <p className="text-cyan-400 text-sm mb-2">{product.category}</p>
                    <p className="text-gray-300 text-xs mb-2">{product.sellerName}</p>
                    <p className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                      {formatPrice(product.price)}
                    </p>
                    {user?.role === "buyer" ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <Link
                        href={`/view/${product.id}`}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition block text-center"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <input
              type="text"
              placeholder="Search gaming gear..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-purple-900/30 border border-purple-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                      : "bg-purple-900/50 text-gray-300 border border-purple-500/30 hover:border-purple-500/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-gradient-to-br from-purple-900/30 to-black border border-purple-500/30 rounded-xl p-16 text-center">
              <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-300 text-lg mb-6">
                {searchTerm ? "No products match your search." : "No products yet. Create your first one!"}
              </p>
              {user?.role === "seller" && (
                <Link
                  href="/seller/create-product"
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  Create Product
                </Link>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded"></div>
                  <h2 className="text-2xl font-black text-white">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 rounded-xl overflow-hidden h-full flex flex-col hover:border-cyan-500/50 transition">
                      {/* Product Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 to-black">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                            product.stock > 0 ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
                          }`}
                        >
                          {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-2">
                          <p className="text-cyan-400 text-xs font-bold uppercase mb-1">{product.category}</p>
                          <h3 className="text-sm font-bold text-white line-clamp-2 mb-2">{product.name}</h3>
                          <p className="text-gray-400 text-xs">{product.sellerName}</p>
                        </div>

                        <p className="text-gray-300 text-xs line-clamp-2 mb-4 flex-1">{product.description}</p>

                        <div className="mb-4">
                          <p className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {user?.role === "buyer" ? (
                            <>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg hover:from-purple-500 hover:to-purple-600 transition text-xs font-bold"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add
                              </button>
                              <Link
                                href={`/view/${product.id}`}
                                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-3 py-2 rounded-lg hover:from-cyan-500 hover:to-cyan-600 transition text-xs font-bold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </Link>
                            </>
                          ) : user?.role === "seller" && user.id === product.sellerId ? (
                            <>
                              <Link
                                href={`/seller/edit/${product.id}`}
                                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-3 py-2 rounded-lg hover:from-cyan-500 hover:to-cyan-600 transition text-xs font-bold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-lg hover:from-red-500 hover:to-red-600 transition text-xs font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </>
                          ) : (
                            <Link
                              href={`/view/${product.id}`}
                              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg hover:from-purple-500 hover:to-purple-600 transition text-xs font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
