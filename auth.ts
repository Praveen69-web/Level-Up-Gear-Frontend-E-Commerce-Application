export interface User {
  id: string
  email: string
  name: string
  role: "buyer" | "seller"
  createdAt: string
}

const USERS_KEY = "levelupgear_users"
const CURRENT_USER_KEY = "levelupgear_current_user"
const CARTS_KEY = "levelupgear_carts"
const ORDERS_KEY = "levelupgear_orders"

// Initialize mock users
const initializeUsers = () => {
  if (typeof window === "undefined") return
  if (!localStorage.getItem(USERS_KEY)) {
    const mockUsers: User[] = [
      {
        id: "1",
        email: "buyer@levelupgear.com",
        name: "Gaming Buyer",
        role: "buyer",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "seller@levelupgear.com",
        name: "Gaming Seller",
        role: "seller",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers))
  }
}

export const authService = {
  signup: (email: string, password: string, name: string, role: "buyer" | "seller"): User => {
    if (typeof window === "undefined") throw new Error("Auth only works on client")
    initializeUsers()

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[]
    if (users.some((u) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    return newUser
  },

  signin: (email: string, password: string): User => {
    if (typeof window === "undefined") throw new Error("Auth only works on client")
    initializeUsers()

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[]
    const user = users.find((u) => u.email === email)

    if (!user) {
      throw new Error("User not found")
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    return user
  },

  logout: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(CURRENT_USER_KEY)
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  },

  getAllUsers: (): User[] => {
    if (typeof window === "undefined") return []
    initializeUsers()
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
  },
}

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string
  sellerId: string
  sellerName: string
}

export interface Order {
  id: string
  buyerId: string
  items: CartItem[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

export const cartService = {
  getCart: (userId: string): CartItem[] => {
    if (typeof window === "undefined") return []
    const carts = JSON.parse(localStorage.getItem(CARTS_KEY) || "{}")
    return carts[userId] || []
  },

  addToCart: (userId: string, item: CartItem) => {
    if (typeof window === "undefined") return
    const carts = JSON.parse(localStorage.getItem(CARTS_KEY) || "{}")
    if (!carts[userId]) carts[userId] = []

    const existing = carts[userId].find((i: CartItem) => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      carts[userId].push(item)
    }

    localStorage.setItem(CARTS_KEY, JSON.stringify(carts))
  },

  removeFromCart: (userId: string, productId: number) => {
    if (typeof window === "undefined") return
    const carts = JSON.parse(localStorage.getItem(CARTS_KEY) || "{}")
    if (carts[userId]) {
      carts[userId] = carts[userId].filter((i: CartItem) => i.productId !== productId)
    }
    localStorage.setItem(CARTS_KEY, JSON.stringify(carts))
  },

  clearCart: (userId: string) => {
    if (typeof window === "undefined") return
    const carts = JSON.parse(localStorage.getItem(CARTS_KEY) || "{}")
    carts[userId] = []
    localStorage.setItem(CARTS_KEY, JSON.stringify(carts))
  },

  getCartTotal: (userId: string): number => {
    const cart = cartService.getCart(userId)
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
}

export const orderService = {
  createOrder: (userId: string, items: CartItem[]): Order => {
    if (typeof window === "undefined") throw new Error("Orders only work on client")

    const order: Order = {
      id: Date.now().toString(),
      buyerId: userId,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "completed",
      createdAt: new Date().toISOString(),
    }

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
    orders.push(order)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

    return order
  },

  getOrders: (userId: string): Order[] => {
    if (typeof window === "undefined") return []
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
    return orders.filter((o: Order) => o.buyerId === userId)
  },

  getAllOrders: (): Order[] => {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
  },
}
