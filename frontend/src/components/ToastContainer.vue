<template>
  <div class="fixed inset-0 pointer-events-none z-50">
    <!-- Toasts grouped by position -->
    <div
      v-for="position in positions"
      :key="position"
      :class="getContainerClasses(position)"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <ToastNotification
          v-for="toast in getToastsByPosition(position)"
          :key="toast.id"
          v-bind="toast"
          class="pointer-events-auto"
          @close="handleToastClose"
          @action="handleToastAction"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToastNotification, { type ToastAction } from './ToastNotification.vue'
import { useToast, type Toast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

// Get unique positions from active toasts
const positions = computed(() => {
  const uniquePositions = new Set(toasts.map(toast => toast.position))
  return Array.from(uniquePositions)
})

// Get container classes for each position
const getContainerClasses = (position: string) => {
  const baseClasses = 'fixed flex flex-col max-w-md w-full sm:max-w-lg'
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  
  return `${baseClasses} ${positionClasses[position as keyof typeof positionClasses] || positionClasses['top-right']}`
}

// Get toasts for a specific position
const getToastsByPosition = (position: string) => {
  return toasts.filter(toast => toast.position === position)
}

// Handle toast close
const handleToastClose = (id: string) => {
  removeToast(id)
}

// Handle toast action
const handleToastAction = (action: ToastAction, id: string) => {
  // Emit action event or handle it globally
  console.log('Toast action:', action, id)
}
</script>

<script lang="ts">
export default {
  name: 'ToastContainer'
}
</script>

<style scoped>
/* Toast transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Position-specific enter animations */
.toast-enter-from {
  opacity: 0;
}

/* Top positions slide down */
.toast-container-top-right .toast-enter-from,
.toast-container-top-left .toast-enter-from,
.toast-container-top-center .toast-enter-from {
  transform: translateY(-100%);
}

/* Bottom positions slide up */
.toast-container-bottom-right .toast-enter-from,
.toast-container-bottom-left .toast-enter-from,
.toast-container-bottom-center .toast-enter-from {
  transform: translateY(100%);
}

/* Right positions slide from right */
.toast-container-top-right .toast-leave-to,
.toast-container-bottom-right .toast-leave-to {
  transform: translateX(100%);
}

/* Left positions slide to left */
.toast-container-top-left .toast-leave-to,
.toast-container-bottom-left .toast-leave-to {
  transform: translateX(-100%);
}

/* Center positions fade out */
.toast-container-top-center .toast-leave-to,
.toast-container-bottom-center .toast-leave-to {
  transform: scale(0.95);
}
</style>