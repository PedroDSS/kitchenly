import { ref, reactive } from 'vue'
import type { ToastNotificationProps, ToastAction } from '../components/ToastNotification.vue'

export interface Toast extends Omit<ToastNotificationProps, 'id'> {
  id: string
  createdAt: Date
}

export interface ToastOptions extends Omit<ToastNotificationProps, 'id' | 'message'> {
  id?: string
}

// Global toast state
const toasts = ref<Toast[]>([])
const maxToasts = ref(5)

// Toast factory function
const createToast = (message: string, options: ToastOptions = {}): Toast => {
  const id = options.id || Math.random().toString(36).substr(2, 9)
  
  return {
    id,
    message,
    type: 'info',
    duration: 5000,
    position: 'top-right',
    closable: true,
    showProgress: false,
    actions: [],
    persistent: false,
    createdAt: new Date(),
    ...options
  }
}

export function useToast() {
  // Add a new toast
  const addToast = (message: string, options: ToastOptions = {}): string => {
    const toast = createToast(message, options)
    
    // Remove oldest toasts if we exceed the maximum
    if (toasts.value.length >= maxToasts.value) {
      toasts.value.splice(0, toasts.value.length - maxToasts.value + 1)
    }
    
    toasts.value.push(toast)
    return toast.id
  }

  // Remove a toast by ID
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Clear all toasts
  const clearToasts = () => {
    toasts.value.splice(0)
  }

  // Convenience methods for different toast types
  const success = (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return addToast(message, { ...options, type: 'success' })
  }

  const error = (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return addToast(message, { ...options, type: 'error', duration: 8000 })
  }

  const warning = (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return addToast(message, { ...options, type: 'warning' })
  }

  const info = (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return addToast(message, { ...options, type: 'info' })
  }

  // Promise-based toast for async operations
  const promise = async <T>(
    promise: Promise<T>,
    options: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: Error) => string)
    } = {}
  ): Promise<T> => {
    const loadingId = options.loading 
      ? addToast(options.loading, { type: 'info', persistent: true })
      : null

    try {
      const result = await promise
      
      if (loadingId) {
        removeToast(loadingId)
      }
      
      if (options.success) {
        const message = typeof options.success === 'function' 
          ? options.success(result) 
          : options.success
        success(message)
      }
      
      return result
    } catch (err) {
      if (loadingId) {
        removeToast(loadingId)
      }
      
      if (options.error) {
        const message = typeof options.error === 'function' 
          ? options.error(err as Error) 
          : options.error
        error(message)
      }
      
      throw err
    }
  }

  // Custom toast with actions
  const withActions = (
    message: string,
    actions: ToastAction[],
    options: Omit<ToastOptions, 'actions'> = {}
  ) => {
    return addToast(message, { ...options, actions, persistent: true })
  }

  // Update toast
  const updateToast = (id: string, updates: Partial<Toast>) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      Object.assign(toast, updates)
    }
  }

  // Get toast by ID
  const getToast = (id: string) => {
    return toasts.value.find(toast => toast.id === id)
  }

  // Check if toast exists
  const hasToast = (id: string) => {
    return toasts.value.some(toast => toast.id === id)
  }

  // Get toasts by type
  const getToastsByType = (type: Toast['type']) => {
    return toasts.value.filter(toast => toast.type === type)
  }

  // Get toasts by position
  const getToastsByPosition = (position: Toast['position']) => {
    return toasts.value.filter(toast => toast.position === position)
  }

  // Configuration
  const setMaxToasts = (max: number) => {
    maxToasts.value = max
  }

  return {
    // State
    toasts: toasts.value,
    maxToasts: maxToasts.value,
    
    // Methods
    addToast,
    removeToast,
    clearToasts,
    updateToast,
    getToast,
    hasToast,
    getToastsByType,
    getToastsByPosition,
    setMaxToasts,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    promise,
    withActions
  }
}

// Global toast instance for use in non-composition contexts
let globalToast: ReturnType<typeof useToast> | null = null

export const getGlobalToast = () => {
  if (!globalToast) {
    globalToast = useToast()
  }
  return globalToast
}

// Export individual methods for convenience
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    getGlobalToast().success(message, options),
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    getGlobalToast().error(message, options),
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    getGlobalToast().warning(message, options),
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    getGlobalToast().info(message, options),
  promise: getGlobalToast().promise,
  withActions: getGlobalToast().withActions,
  clear: getGlobalToast().clearToasts
}