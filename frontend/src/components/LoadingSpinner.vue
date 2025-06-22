<template>
  <div
    :class="[
      'animate-spin rounded-full border-2 border-gray-300',
      size === 'sm' ? 'h-4 w-4 border-t-gray-600' : 
      size === 'md' ? 'h-8 w-8 border-t-gray-600' :
      size === 'lg' ? 'h-12 w-12 border-t-gray-600' :
      'h-6 w-6 border-t-gray-600',
      variant === 'primary' ? 'border-t-blue-600' :
      variant === 'white' ? 'border-gray-200 border-t-white' :
      variant === 'dark' ? 'border-gray-600 border-t-gray-900' :
      'border-t-gray-600',
      customClass
    ]"
  />
</template>

<script setup lang="ts">
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'white' | 'dark'
  customClass?: string
}

withDefaults(defineProps<LoadingSpinnerProps>(), {
  size: 'md',
  variant: 'default',
  customClass: ''
})
</script>

<script lang="ts">
export default {
  name: 'LoadingSpinner'
}
</script>