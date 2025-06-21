import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { Cart } from '@/types'

export const useCartStore = defineStore('cart', () => {
  // State
  const cart = ref<Cart | null>(null)
  const isLoading = ref(false)
  const reservationTimer = ref<number | null>(null)

  // Getters
  const itemCount = computed(() => {
    return cart.value?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  })

  const totalAmount = computed(() => {
    return cart.value?.items?.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0) || 0
  })

  const hasItems = computed(() => itemCount.value > 0)

  const reservationTimeLeft = computed(() => {
    if (!cart.value?.expiresAt) return 0
    const now = new Date().getTime()
    const expiry = new Date(cart.value.expiresAt).getTime()
    return Math.max(0, expiry - now)
  })

  // Actions
  const fetchCart = async () => {
    try {
      isLoading.value = true
      const cartData = await apiService.getCart()
      cart.value = cartData
      
      if (cartData?.expiresAt) {
        startReservationTimer()
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      isLoading.value = true
      const response = await apiService.addToCart(productId, quantity)
      cart.value = (response as any).cart
      
      if ((response as any).cart?.expiresAt) {
        startReservationTimer()
      }
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      isLoading.value = true
      const updatedCart = await apiService.updateCartItem(itemId, quantity)
      cart.value = updatedCart
      return updatedCart
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      isLoading.value = true
      const updatedCart = await apiService.removeFromCart(itemId)
      cart.value = updatedCart
      
      // Clear timer if cart is empty
      if (!updatedCart?.items?.length) {
        clearReservationTimer()
      }
      
      return updatedCart
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearCart = () => {
    cart.value = null
    clearReservationTimer()
  }

  const startReservationTimer = () => {
    clearReservationTimer()
    
    if (!cart.value?.expiresAt) return
    
    const updateTimer = () => {
      const timeLeft = reservationTimeLeft.value
      
      if (timeLeft <= 0) {
        // Cart expired, clear it
        clearCart()
        return
      }
      
      // Update every second
      reservationTimer.value = window.setTimeout(updateTimer, 1000)
    }
    
    updateTimer()
  }

  const clearReservationTimer = () => {
    if (reservationTimer.value) {
      clearTimeout(reservationTimer.value)
      reservationTimer.value = null
    }
  }

  const formatTimeLeft = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return {
    // State
    cart,
    isLoading,
    
    // Getters
    itemCount,
    totalAmount,
    hasItems,
    reservationTimeLeft,
    
    // Actions
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    formatTimeLeft
  }
})