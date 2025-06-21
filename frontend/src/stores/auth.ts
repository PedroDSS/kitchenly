import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isInitialized = ref(false)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isB2B = computed(() => user.value?.role === 'b2b')

  // Actions
  const initializeAuth = async () => {
    if (token.value && !user.value) {
      try {
        isLoading.value = true
        const userData = await apiService.getCurrentUser()
        user.value = userData
      } catch (error) {
        // Token is invalid, clear it
        clearAuth()
      } finally {
        isLoading.value = false
      }
    }
    isInitialized.value = true
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      const response = await apiService.login(credentials)
      
      token.value = (response as any).token
      user.value = (response as any).user
      
      localStorage.setItem('auth_token', (response as any).token)
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      isLoading.value = true
      const response = await apiService.register(userData)
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Optional: call logout endpoint
      await apiService.logout?.()
    } catch (error) {
      // Ignore logout errors, clear local state anyway
    } finally {
      clearAuth()
    }
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      isLoading.value = true
      const updatedUser = await apiService.updateProfile(profileData)
      user.value = updatedUser
      return updatedUser
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const confirmEmail = async (token: string) => {
    try {
      isLoading.value = true
      const response = await apiService.confirmEmail(token)
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      isLoading.value = true
      const response = await apiService.forgotPassword(email)
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      isLoading.value = true
      const response = await apiService.resetPassword(token, password)
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    token,
    isInitialized,
    isLoading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isB2B,
    
    // Actions
    initializeAuth,
    login,
    register,
    logout,
    clearAuth,
    updateProfile,
    confirmEmail,
    forgotPassword,
    resetPassword
  }
})