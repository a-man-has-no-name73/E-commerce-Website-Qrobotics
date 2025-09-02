
export interface User {
  user_id: number
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone_number?: string
  date_registered: string
  is_active: boolean
  last_login?: string
}

export interface Admin {
  admin_id: number
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: "super_admin" | "product_manager" | "order_manager"
  is_active: boolean
  last_login?: string
  created_at: string
}

export interface Category {
  category_id: number
  name: string
  description?: string
  parent_category_id?: number
  created_at: string
  updated_at: string
}

export interface Product {
  product_id: number
  category_id: number
  name: string
  description?: string
  price: number
  product_code?: string
  is_available: boolean
  created_by: number
  created_at: string
  updated_at: string
  category_name?: string
  images?: ProductImage[]
  inventory?: ProductInventory
}

export interface ProductImage {
  image_id: number
  product_id: number
  image_url: string
  is_primary: boolean
  created_at: string
}

export interface ProductInventory {
  inventory_id: number
  product_id: number
  quantity: number
  last_updated: string
  updated_by: number
}

export interface Order {
  order_id: number
  user_id: number
  order_date: string
  total_amount: number
  shipping_address_id: number
  billing_address_id: number
  payment_method: string
  payment_status: "pending" | "completed" | "failed" | "refunded"
  shipping_status: "processing" | "shipped" | "delivered" | "returned"
  user_name?: string
  user_email?: string
  items?: OrderItem[]
}

export interface OrderItem {
  order_item_id: number
  order_id: number
  product_id: number
  quantity: number
  price_at_time: number
  subtotal: number
  product_name?: string
}

export interface UserAddress {
  address_id: number
  user_id: number
  address_type: "billing" | "shipping"
  street_address: string
  city: string
  postal_code: string
  is_default: boolean
  created_at: string
}

// Mock database - In production, replace with actual database queries
class MockDatabase {
  private users: User[] = []
  private admins: Admin[] = [
    {
      admin_id: 1,
      email: "admin@qrobotics.com",
      password_hash: "admin123", // In production, this should be properly hashed
      first_name: "Admin",
      last_name: "User",
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]
  private categories: Category[] = [
    {
      category_id: 1,
      name: "Manufacturing Automation",
      description: "Industrial robots for production lines",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      category_id: 2,
      name: "Warehouse & Logistics",
      description: "Automated material handling solutions",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      category_id: 3,
      name: "Office Automation",
      description: "Service robots for workplace efficiency",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      category_id: 4,
      name: "Healthcare & Lab",
      description: "Medical and laboratory automation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
  private products: Product[] = [
    {
      product_id: 1,
      category_id: 1,
      name: "QR-Assembly Pro X1",
      description: "Advanced manufacturing robot with precision control for assembly line operations.",
      price: 24999,
      is_available: true,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      product_id: 2,
      category_id: 2,
      name: "QR-Warehouse Navigator",
      description: "Autonomous mobile robot for warehouse operations and material transport.",
      price: 8999,
      is_available: true,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
  private orders: Order[] = []
  private productInventory: ProductInventory[] = [
    { inventory_id: 1, product_id: 1, quantity: 10, last_updated: new Date().toISOString(), updated_by: 1 },
    { inventory_id: 2, product_id: 2, quantity: 5, last_updated: new Date().toISOString(), updated_by: 1 },
  ]

  // User methods
  async createUser(userData: Omit<User, "user_id" | "date_registered">): Promise<User> {
    const user: User = {
      user_id: this.users.length + 1,
      date_registered: new Date().toISOString(),
      ...userData,
    }
    this.users.push(user)
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email && !user.deleted_at) || null
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.users.find((user) => user.user_id === userId && !user.deleted_at) || null
  }

  // Admin methods
  async getAdminByEmail(email: string): Promise<Admin | null> {
    return this.admins.find((admin) => admin.email === email && admin.is_active) || null
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return this.categories.filter((cat) => !cat.deleted_at)
  }

  async createCategory(categoryData: Omit<Category, "category_id" | "created_at" | "updated_at">): Promise<Category> {
    const category: Category = {
      category_id: this.categories.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...categoryData,
    }
    this.categories.push(category)
    return category
  }

  async deleteCategory(categoryId: number): Promise<boolean> {
    const index = this.categories.findIndex((cat) => cat.category_id === categoryId)
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], deleted_at: new Date().toISOString() }
      return true
    }
    return false
  }

  // Product methods
  async getProducts(filters?: { category_id?: number; search?: string; is_available?: boolean }): Promise<Product[]> {
    let products = this.products.filter((product) => !product.deleted_at)

    if (filters?.category_id) {
      products = products.filter((product) => product.category_id === filters.category_id)
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) || product.description?.toLowerCase().includes(searchTerm),
      )
    }

    if (filters?.is_available !== undefined) {
      products = products.filter((product) => product.is_available === filters.is_available)
    }

    // Add category names
    return products.map((product) => ({
      ...product,
      category_name: this.categories.find((cat) => cat.category_id === product.category_id)?.name,
      inventory: this.productInventory.find((inv) => inv.product_id === product.product_id),
    }))
  }

  async getProductById(productId: number): Promise<Product | null> {
    const product = this.products.find((product) => product.product_id === productId && !product.deleted_at)
    if (!product) return null

    return {
      ...product,
      category_name: this.categories.find((cat) => cat.category_id === product.category_id)?.name,
      inventory: this.productInventory.find((inv) => inv.product_id === product.product_id),
    }
  }

  async createProduct(productData: Omit<Product, "product_id" | "created_at" | "updated_at">): Promise<Product> {
    const product: Product = {
      product_id: this.products.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...productData,
    }
    this.products.push(product)

    // Create initial inventory
    this.productInventory.push({
      inventory_id: this.productInventory.length + 1,
      product_id: product.product_id,
      quantity: 0,
      last_updated: new Date().toISOString(),
      updated_by: productData.created_by,
    })

    return product
  }

  async updateProduct(productId: number, updates: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex((product) => product.product_id === productId)
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return this.products[index]
    }
    return null
  }

  async deleteProduct(productId: number): Promise<boolean> {
    const index = this.products.findIndex((product) => product.product_id === productId)
    if (index !== -1) {
      this.products[index] = { ...this.products[index], deleted_at: new Date().toISOString() }
      return true
    }
    return false
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return this.orders.map((order) => ({
      ...order,
      user_name:
        this.users.find((user) => user.user_id === order.user_id)?.first_name +
        " " +
        this.users.find((user) => user.user_id === order.user_id)?.last_name,
      user_email: this.users.find((user) => user.user_id === order.user_id)?.email,
    }))
  }

  async createOrder(orderData: Omit<Order, "order_id" | "order_date">): Promise<Order> {
    const order: Order = {
      order_id: this.orders.length + 1,
      order_date: new Date().toISOString(),
      ...orderData,
    }
    this.orders.push(order)
    return order
  }

  async updateOrderStatus(orderId: number, status: Order["shipping_status"]): Promise<Order | null> {
    const index = this.orders.findIndex((order) => order.order_id === orderId)
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], shipping_status: status }
      return this.orders[index]
    }
    return null
  }

  // Inventory methods
  async updateInventory(productId: number, quantity: number, updatedBy: number): Promise<ProductInventory | null> {
    const index = this.productInventory.findIndex((inv) => inv.product_id === productId)
    if (index !== -1) {
      this.productInventory[index] = {
        ...this.productInventory[index],
        quantity,
        last_updated: new Date().toISOString(),
        updated_by: updatedBy,
      }
      return this.productInventory[index]
    }
    return null
  }
}

export const db = new MockDatabase()
