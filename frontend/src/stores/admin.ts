import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { 
  DashboardMetrics, 
  Order, 
  User, 
  Product, 
  StockMovement,
  PromoCode,
  RelayPoint,
  PaginatedResponse 
} from '@/types'

export const useAdminStore = defineStore('admin', () => {
  // State
  const dashboardMetrics = ref<DashboardMetrics | null>(null)
  const orders = ref<Order[]>([])
  const users = ref<User[]>([])
  const stockMovements = ref<StockMovement[]>([])
  const promoCodes = ref<PromoCode[]>([])
  const relayPoints = ref<RelayPoint[]>([])
  const isLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalItems = ref(0)

  // Getters
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

  // Actions
  const fetchDashboardMetrics = async () => {
    try {
      isLoading.value = true
      const metrics = await apiService.getAdminDashboard()
      dashboardMetrics.value = metrics
      return metrics
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrders = async (page: number = 1, filters: any = {}) => {
    try {
      isLoading.value = true
      currentPage.value = page
      
      const response: PaginatedResponse<Order> = await apiService.getAdminOrders({
        page,
        limit: pageSize.value,
        ...filters
      })
      
      orders.value = response.data
      totalItems.value = response.total
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updatedOrder = await apiService.updateOrderStatus(orderId, status)
      
      // Update the order in the local state
      const index = orders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      
      return updatedOrder
    } catch (error) {
      throw error
    }
  }

  const fetchUsers = async (page: number = 1, filters: any = {}) => {
    try {
      isLoading.value = true
      currentPage.value = page
      
      const response: PaginatedResponse<User> = await apiService.getAdminUsers({
        page,
        limit: pageSize.value,
        ...filters
      })
      
      users.value = response.data
      totalItems.value = response.total
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loginAsUser = async (userId: string) => {
    try {
      const response = await apiService.loginAsUser(userId)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchStockMovements = async (page: number = 1, filters: any = {}) => {
    try {
      isLoading.value = true
      currentPage.value = page
      
      const response: PaginatedResponse<StockMovement> = await apiService.getStockMovements({
        page,
        limit: pageSize.value,
        ...filters
      })
      
      stockMovements.value = response.data
      totalItems.value = response.total
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createStockMovement = async (movementData: Partial<StockMovement>) => {
    try {
      const newMovement = await apiService.createStockMovement(movementData)
      stockMovements.value.unshift(newMovement)
      return newMovement
    } catch (error) {
      throw error
    }
  }

  const createProduct = async (productData: Partial<Product>) => {
    try {
      const newProduct = await apiService.createProduct(productData)
      return newProduct
    } catch (error) {
      throw error
    }
  }

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await apiService.updateProduct(productId, productData)
      return updatedProduct
    } catch (error) {
      throw error
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      await apiService.deleteProduct(productId)
      return true
    } catch (error) {
      throw error
    }
  }

  const fetchPromoCodes = async (page: number = 1) => {
    try {
      isLoading.value = true
      currentPage.value = page
      
      const response: PaginatedResponse<PromoCode> = await apiService.getPromoCodes({
        page,
        limit: pageSize.value
      })
      
      promoCodes.value = response.data
      totalItems.value = response.total
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createPromoCode = async (promoData: Partial<PromoCode>) => {
    try {
      const newPromo = await apiService.createPromoCode(promoData)
      promoCodes.value.unshift(newPromo)
      return newPromo
    } catch (error) {
      throw error
    }
  }

  const updatePromoCode = async (promoId: string, promoData: Partial<PromoCode>) => {
    try {
      const updatedPromo = await apiService.updatePromoCode(promoId, promoData)
      
      const index = promoCodes.value.findIndex(promo => promo.id === promoId)
      if (index !== -1) {
        promoCodes.value[index] = updatedPromo
      }
      
      return updatedPromo
    } catch (error) {
      throw error
    }
  }

  const deletePromoCode = async (promoId: string) => {
    try {
      await apiService.deletePromoCode(promoId)
      promoCodes.value = promoCodes.value.filter(promo => promo.id !== promoId)
      return true
    } catch (error) {
      throw error
    }
  }

  const fetchRelayPoints = async (page: number = 1) => {
    try {
      isLoading.value = true
      currentPage.value = page
      
      const response: PaginatedResponse<RelayPoint> = await apiService.getAdminRelayPoints({
        page,
        limit: pageSize.value
      })
      
      relayPoints.value = response.data
      totalItems.value = response.total
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createRelayPoint = async (relayPointData: Partial<RelayPoint>) => {
    try {
      const newRelayPoint = await apiService.createRelayPoint(relayPointData)
      relayPoints.value.unshift(newRelayPoint)
      return newRelayPoint
    } catch (error) {
      throw error
    }
  }

  const updateRelayPoint = async (relayPointId: string, relayPointData: Partial<RelayPoint>) => {
    try {
      const updatedRelayPoint = await apiService.updateRelayPoint(relayPointId, relayPointData)
      
      const index = relayPoints.value.findIndex(rp => rp.id === relayPointId)
      if (index !== -1) {
        relayPoints.value[index] = updatedRelayPoint
      }
      
      return updatedRelayPoint
    } catch (error) {
      throw error
    }
  }

  const deleteRelayPoint = async (relayPointId: string) => {
    try {
      await apiService.deleteRelayPoint(relayPointId)
      relayPoints.value = relayPoints.value.filter(rp => rp.id !== relayPointId)
      return true
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    dashboardMetrics,
    orders,
    users,
    stockMovements,
    promoCodes,
    relayPoints,
    isLoading,
    currentPage,
    pageSize,
    totalItems,
    
    // Getters
    totalPages,
    
    // Actions
    fetchDashboardMetrics,
    fetchOrders,
    updateOrderStatus,
    fetchUsers,
    loginAsUser,
    fetchStockMovements,
    createStockMovement,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    fetchRelayPoints,
    createRelayPoint,
    updateRelayPoint,
    deleteRelayPoint
  }
})