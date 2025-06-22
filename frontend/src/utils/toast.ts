import { ref, reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

export const toast = {
  show(type: ToastType, message: string, duration = 5000) {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { id, type, message, duration }
    
    toasts.value.push(newToast)
    
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }
    
    return id
  },
  
  success(message: string, duration?: number) {
    return this.show('success', message, duration)
  },
  
  error(message: string, duration?: number) {
    return this.show('error', message, duration)
  },
  
  warning(message: string, duration?: number) {
    return this.show('warning', message, duration)
  },
  
  info(message: string, duration?: number) {
    return this.show('info', message, duration)
  },
  
  remove(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  },
  
  clear() {
    toasts.value = []
  }
}

export const useToast = () => {
  return {
    toasts,
    toast
  }
}