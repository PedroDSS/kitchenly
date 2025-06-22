<template>
  <div
    v-if="isVisible"
    :class="[
      'fixed z-50 p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out',
      positionClasses,
      typeClasses,
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    ]"
    role="alert"
  >
    <div class="flex items-start">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <CheckCircleIcon v-if="type === 'success'" class="w-5 h-5" />
        <XCircleIcon v-else-if="type === 'error'" class="w-5 h-5" />
        <ExclamationTriangleIcon v-else-if="type === 'warning'" class="w-5 h-5" />
        <InformationCircleIcon v-else class="w-5 h-5" />
      </div>
      
      <!-- Content -->
      <div class="ml-3 flex-1">
        <p v-if="title" class="text-sm font-medium">
          {{ title }}
        </p>
        <p :class="['text-sm', title ? 'mt-1' : '']">
          {{ message }}
        </p>
        
        <!-- Action buttons -->
        <div v-if="actions.length > 0" class="mt-3 flex space-x-2">
          <button
            v-for="action in actions"
            :key="action.key"
            @click="handleActionClick(action)"
            :class="[
              'text-xs font-medium underline hover:no-underline',
              action.variant === 'primary' ? 'text-current' : 'text-current opacity-75'
            ]"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Close button -->
      <div v-if="closable" class="ml-4 flex-shrink-0">
        <button
          @click="close"
          class="inline-flex text-current hover:opacity-75 focus:outline-none focus:opacity-75"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <!-- Progress bar for auto-dismiss -->
    <div
      v-if="showProgress && duration > 0"
      class="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all ease-linear"
      :style="{ width: progressWidth + '%' }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export interface ToastAction {
  key: string
  label: string
  variant?: 'primary' | 'secondary'
}

export interface ToastNotificationProps {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  closable?: boolean
  showProgress?: boolean
  actions?: ToastAction[]
  persistent?: boolean
}

const props = withDefaults(defineProps<ToastNotificationProps>(), {
  id: () => Math.random().toString(36).substr(2, 9),
  type: 'info',
  duration: 5000,
  position: 'top-right',
  closable: true,
  showProgress: false,
  actions: () => [],
  persistent: false
})

const emit = defineEmits<{
  close: [id: string]
  action: [action: ToastAction, id: string]
}>()

// State
const isVisible = ref(false)
const progressWidth = ref(100)
let timeoutId: number | null = null
let progressInterval: number | null = null

// Computed properties
const positionClasses = computed(() => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  return positions[props.position] || positions['top-right']
})

const typeClasses = computed(() => {
  const classes = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }
  return classes[props.type] || classes.info
})

// Methods
const show = () => {
  isVisible.value = true
  
  if (!props.persistent && props.duration > 0) {
    startAutoDismiss()
  }
}

const close = () => {
  isVisible.value = false
  clearTimers()
  
  setTimeout(() => {
    emit('close', props.id)
  }, 300) // Wait for transition to complete
}

const handleActionClick = (action: ToastAction) => {
  emit('action', action, props.id)
  
  // Close toast after action unless it's persistent
  if (!props.persistent) {
    close()
  }
}

const startAutoDismiss = () => {
  if (props.duration <= 0) return
  
  // Set up auto-dismiss timer
  timeoutId = window.setTimeout(() => {
    close()
  }, props.duration)
  
  // Set up progress bar animation
  if (props.showProgress) {
    const startTime = Date.now()
    progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, props.duration - elapsed)
      progressWidth.value = (remaining / props.duration) * 100
      
      if (remaining <= 0) {
        clearInterval(progressInterval!)
        progressInterval = null
      }
    }, 50)
  }
}

const clearTimers = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

// Lifecycle
onMounted(() => {
  // Trigger animation on next tick
  setTimeout(show, 10)
})

onUnmounted(() => {
  clearTimers()
})

// Pause auto-dismiss on hover
const pauseAutoDismiss = () => {
  clearTimers()
}

const resumeAutoDismiss = () => {
  if (!props.persistent && props.duration > 0 && isVisible.value) {
    startAutoDismiss()
  }
}

defineExpose({
  show,
  close,
  pauseAutoDismiss,
  resumeAutoDismiss
})
</script>

<script lang="ts">
export default {
  name: 'ToastNotification'
}
</script>