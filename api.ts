import type { Product } from "@/types"

const API_BASE = "/api"

export const productAPI = {
  async getAll(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`)
    if (!res.ok) throw new Error("Failed to fetch products")
    return res.json()
  },

  async getById(id: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`)
    if (!res.ok) throw new Error("Failed to fetch product")
    return res.json()
  },

  async create(product: Omit<Product, "id">): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
    if (!res.ok) throw new Error("Failed to create product")
    return res.json()
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
    if (!res.ok) throw new Error("Failed to update product")
    return res.json()
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete product")
  },
}
