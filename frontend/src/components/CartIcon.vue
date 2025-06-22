<template>
  <button
    @click="handleClick"
    :class="[
      'relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md transition-colors',
      customClass
    ]"
    :disabled="disabled"
  >
    <ShoppingCartIcon :class="['w-6 h-6', iconClass]" />
    
    <!-- Badge -->
    <span
      v-if="showBadge && (count > 0 || showZero)"
      :class="[
        'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold text-white flex items-center justify-center',
        'ring-2 ring-white',
        count > 99 ? 'px-1' : '',
        badgeVariant === 'primary' ? 'bg-blue-600' :
        badgeVariant === 'danger' ? 'bg-red-600' :
        badgeVariant === 'success' ? 'bg-green-600' :
        badgeVariant === 'warning' ? 'bg-yellow-600' :
        'bg-blue-600'
      ]"
    >
      {{ displayCount }}
    </span>
    
    <!-- Dot indicator (simpler alternative to badge) -->
    <span
      v-else-if="showDot && count > 0"
      :class="[
        'absolute -top-1 -right-1 h-3 w-3 rounded-full',
        'ring-2 ring-white',
        badgeVariant === 'primary' ? 'bg-blue-600' :
        badgeVariant === 'danger' ? 'bg-red-600' :
        badgeVariant === 'success' ? 'bg-green-600' :
        badgeVariant === 'warning' ? 'bg-yellow-600' :
        'bg-blue-600'
      ]"
    />
    
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md"
    >
      <LoadingSpinner size="sm" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from './LoadingSpinner.vue'

export interface CartIconProps {
  count?: number
  showBadge?: boolean
  showDot?: boolean
  showZero?: boolean
  maxCount?: number
  badgeVariant?: 'primary' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  isLoading?: boolean
  customClass?: string
  iconClass?: string
}

const props = withDefaults(defineProps<CartIconProps>(), {
  count: 0,
  showBadge: true,
  showDot: false,
  showZero: false,
  maxCount: 99,
  badgeVariant: 'primary',
  disabled: false,
  isLoading: false,
  customClass: '',
  iconClass: ''
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Computed properties
const displayCount = computed(() => {
  if (props.count > props.maxCount) {
    return `${props.maxCount}+`
  }
  return props.count.toString()
})

// Methods
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.isLoading) {
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  name: 'CartIcon'
}
</script>