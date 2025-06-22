declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.webp'

// API Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin' | 'b2b'
  isEmailConfirmed: boolean
  isActive: boolean
  failedLoginAttempts: number
  lastFailedLogin?: Date
  passwordExpiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  customerType: 'B2C' | 'B2B'
  companyName?: string
  vatNumber?: string
  marketingConsent?: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  categoryId: string
  brandId: string
  category?: Category
  brand?: Brand
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  children?: Category[]
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  product: Product
  quantity: number
  reservedUntil: Date
  createdAt: Date
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  createdAt: Date
}

export interface Order {
  id: string
  userId: string
  user?: User
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  totalAmount: number
  paymentMethod: string
  deliveryAddress: any
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface EmailAlert {
  id: string
  userId: string
  type: 'stock' | 'price' | 'new_product' | 'low_stock'
  categoryId?: string
  productId?: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StockMovement {
  id: string
  productId: string
  product?: Product
  quantity: number
  type: 'in' | 'out'
  reason: string
  userId?: string
  user?: User
  createdAt: Date
}

export interface PromoCode {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  expiresAt: Date
  categoryId?: string
  productId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RelayPoint {
  id: string
  name: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  openingHours: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryOption {
  id: string
  name: string
  type: 'home' | 'relay_point'
  price: number
  relayPointId?: string
  relayPoint?: RelayPoint
  createdAt: Date
  updatedAt: Date
}

export interface PaymentIntent {
  clientSecret: string
  amount: number
  currency: string
  orderId: string
}

export interface DashboardMetrics {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: Product[]
  lowStockProducts: Product[]
}

// Utility Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductFilters {
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: 'price' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResponse {
  products: Product[]
  total: number
  facets: {
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ id: string; name: string; count: number }>
    priceRanges: Array<{ min: number; max: number; count: number }>
  }
}