import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  Product, 
  Category, 
  Brand, 
  Cart, 
  Order, 
  EmailAlert,
  PaginatedResponse,
  SearchResponse,
  DashboardMetrics,
  StockMovement,
  PromoCode,
  RelayPoint,
  DeliveryOption,
  PaymentIntent
} from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        
        const message = error.response?.data?.message || error.message || 'An error occurred'
        throw new Error(message)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    return this.api.post('/auth/login', credentials)
  }

  async register(userData: RegisterData) {
    return this.api.post('/auth/register', userData)
  }

  async logout() {
    return this.api.post('/auth/logout')
  }

  async confirmEmail(token: string) {
    return this.api.post(`/auth/confirm-email/${token}`)
  }

  async forgotPassword(email: string) {
    return this.api.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string) {
    return this.api.post(`/auth/reset-password/${token}`, { password })
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.api.get('/users/profile')
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.api.put('/users/profile', profileData)
  }

  async deleteAccount() {
    return this.api.delete('/users/account')
  }

  async exportUserData() {
    return this.api.post('/users/export-data')
  }

  // Product endpoints
  async getProducts(params: any = {}): Promise<PaginatedResponse<Product>> {
    return this.api.get('/products', { params })
  }

  async getProduct(id: string): Promise<Product> {
    return this.api.get(`/products/${id}`)
  }

  async searchProducts(query: string, params: any = {}): Promise<SearchResponse> {
    return this.api.get('/products/search', { 
      params: { q: query, ...params } 
    })
  }

  async getCategories(): Promise<Category[]> {
    return this.api.get('/categories')
  }

  async getBrands(): Promise<Brand[]> {
    return this.api.get('/brands')
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    return this.api.get('/cart')
  }

  async addToCart(productId: string, quantity: number) {
    return this.api.post('/cart/add', { productId, quantity })
  }

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    return this.api.put(`/cart/items/${itemId}`, { quantity })
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    return this.api.delete(`/cart/items/${itemId}`)
  }

  // Order endpoints
  async createOrder(orderData: any): Promise<Order> {
    return this.api.post('/orders/create', orderData)
  }

  async getOrders(params: any = {}): Promise<PaginatedResponse<Order>> {
    return this.api.get('/orders', { params })
  }

  async getOrder(id: string): Promise<Order> {
    return this.api.get(`/orders/${id}`)
  }

  async cancelOrder(id: string) {
    return this.api.post(`/orders/${id}/cancel`)
  }

  async returnOrder(id: string, reason: string) {
    return this.api.post(`/orders/${id}/return`, { reason })
  }

  async reorder(id: string) {
    return this.api.post(`/orders/${id}/reorder`)
  }

  async getInvoice(orderId: string) {
    return this.api.get(`/invoices/${orderId}`, {
      responseType: 'blob'
    })
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, orderId: string): Promise<PaymentIntent> {
    return this.api.post('/payments/create-intent', { amount, orderId })
  }

  async getPaymentStatus(orderId: string) {
    return this.api.get(`/payments/${orderId}/status`)
  }

  async refundPayment(orderId: string, amount?: number) {
    return this.api.post('/payments/refund', { orderId, amount })
  }

  // Email Alert endpoints
  async getEmailAlerts(): Promise<EmailAlert[]> {
    return this.api.get('/alerts')
  }

  async createEmailAlert(alertData: Partial<EmailAlert>): Promise<EmailAlert> {
    return this.api.post('/alerts', alertData)
  }

  async updateEmailAlert(id: string, alertData: Partial<EmailAlert>): Promise<EmailAlert> {
    return this.api.put(`/alerts/${id}`, alertData)
  }

  async deleteEmailAlert(id: string) {
    return this.api.delete(`/alerts/${id}`)
  }

  // Delivery endpoints
  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    return this.api.get('/delivery/options')
  }

  async calculateDelivery(address: any, items: any[]) {
    return this.api.post('/delivery/calculate', { address, items })
  }

  async getRelayPoints(lat: number, lng: number, radius: number = 10): Promise<RelayPoint[]> {
    return this.api.get('/delivery/relay-points', {
      params: { lat, lng, radius }
    })
  }

  async getAdminRelayPoints(params: any = {}): Promise<PaginatedResponse<RelayPoint>> {
    return this.api.get('/admin/relay-points', { params })
  }

  async trackDelivery(trackingNumber: string) {
    return this.api.post('/delivery/track', { trackingNumber })
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<DashboardMetrics> {
    return this.api.get('/admin/dashboard')
  }

  async getAdminOrders(params: any = {}): Promise<PaginatedResponse<Order>> {
    return this.api.get('/admin/orders', { params })
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.api.put(`/admin/orders/${orderId}/status`, { status })
  }

  async getAdminUsers(params: any = {}): Promise<PaginatedResponse<User>> {
    return this.api.get('/admin/users', { params })
  }

  async loginAsUser(userId: string) {
    return this.api.post(`/admin/login-as/${userId}`)
  }

  async getStockMovements(params: any = {}): Promise<PaginatedResponse<StockMovement>> {
    return this.api.get('/admin/stock', { params })
  }

  async createStockMovement(movementData: Partial<StockMovement>): Promise<StockMovement> {
    return this.api.post('/admin/stock/movements', movementData)
  }

  async getAnalytics(params: any = {}) {
    return this.api.get('/admin/analytics', { params })
  }

  // Admin Product Management
  async createProduct(productData: Partial<Product>): Promise<Product> {
    return this.api.post('/products', productData)
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    return this.api.put(`/products/${productId}`, productData)
  }

  async deleteProduct(productId: string) {
    return this.api.delete(`/products/${productId}`)
  }

  // Admin Promo Code Management
  async getPromoCodes(params: any = {}): Promise<PaginatedResponse<PromoCode>> {
    return this.api.get('/admin/promo-codes', { params })
  }

  async createPromoCode(promoData: Partial<PromoCode>): Promise<PromoCode> {
    return this.api.post('/admin/promo-codes', promoData)
  }

  async updatePromoCode(promoId: string, promoData: Partial<PromoCode>): Promise<PromoCode> {
    return this.api.put(`/admin/promo-codes/${promoId}`, promoData)
  }

  async deletePromoCode(promoId: string) {
    return this.api.delete(`/admin/promo-codes/${promoId}`)
  }

  // Admin Relay Point Management
  async createRelayPoint(relayPointData: Partial<RelayPoint>): Promise<RelayPoint> {
    return this.api.post('/admin/relay-points', relayPointData)
  }

  async updateRelayPoint(relayPointId: string, relayPointData: Partial<RelayPoint>): Promise<RelayPoint> {
    return this.api.put(`/admin/relay-points/${relayPointId}`, relayPointData)
  }

  async deleteRelayPoint(relayPointId: string) {
    return this.api.delete(`/admin/relay-points/${relayPointId}`)
  }
}

export const apiService = new ApiService()