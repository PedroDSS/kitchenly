<template>
  <div>
    <!-- Button -->
    <button
      @click="showModal = true"
      :disabled="isLoading"
      :class="[
        'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
        variant === 'danger' ? 
          'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300' :
        variant === 'warning' ? 
          'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 disabled:bg-yellow-300' :
          'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
        buttonClass
      ]"
    >
      <LoadingSpinner v-if="isLoading" size="sm" variant="white" customClass="mr-2" />
      <component :is="icon" v-else-if="icon" class="w-4 h-4 mr-2" />
      {{ buttonText }}
    </button>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="handleBackdropClick"
    >
      <div 
        class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 transform transition-all"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
          <button
            @click="showModal = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="mb-6">
          <p class="text-sm text-gray-600">
            {{ message }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="showModal = false"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            :disabled="isLoading"
            :class="[
              'inline-flex items-center px-4 py-2 text-sm font-medium border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
              variant === 'danger' ? 
                'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300' :
              variant === 'warning' ? 
                'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 disabled:bg-yellow-300' :
                'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300'
            ]"
          >
            <LoadingSpinner v-if="isLoading" size="sm" variant="white" customClass="mr-2" />
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      :class="[
        'fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transform transition-all duration-300',
        toastType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
        toastType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
        'bg-blue-50 text-blue-800 border border-blue-200'
      ]"
    >
      <div class="flex items-center">
        <CheckCircleIcon v-if="toastType === 'success'" class="w-5 h-5 mr-2" />
        <XCircleIcon v-else-if="toastType === 'error'" class="w-5 h-5 mr-2" />
        <InformationCircleIcon v-else class="w-5 h-5 mr-2" />
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import { XMarkIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from './LoadingSpinner.vue'

export interface ConfirmButtonProps {
  buttonText: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning'
  icon?: Component
  buttonClass?: string
  closeOnBackdrop?: boolean
  successMessage?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<ConfirmButtonProps>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
  closeOnBackdrop: true,
  successMessage: 'Action completed successfully',
  errorMessage: 'An error occurred'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  success: []
  error: [error: Error]
}>()

const showModal = ref(false)
const isLoading = ref(false)
const showToast = ref(false)
const toastType = ref<'success' | 'error' | 'info'>('success')
const toastMessage = ref('')

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !isLoading.value) {
    showModal.value = false
    emit('cancel')
  }
}

const handleConfirm = async () => {
  try {
    isLoading.value = true
    emit('confirm')
    
    // Simulate async operation - in real usage, the parent would handle this
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showModal.value = false
    showToast.value = true
    toastType.value = 'success'
    toastMessage.value = props.successMessage
    emit('success')
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      showToast.value = false
    }, 3000)
    
  } catch (error) {
    showToast.value = true
    toastType.value = 'error'
    toastMessage.value = props.errorMessage
    emit('error', error as Error)
    
    // Hide toast after 5 seconds for errors
    setTimeout(() => {
      showToast.value = false
    }, 5000)
  } finally {
    isLoading.value = false
  }
}
</script>

<script lang="ts">
export default {
  name: 'ConfirmButton'
}
</script>