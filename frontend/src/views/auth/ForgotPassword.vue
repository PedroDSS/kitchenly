<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center justify-center space-x-3 group">
          <div class="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
            <img src="/kitchenly-no-bg.png" alt="Kitchenly" class="h-10 w-auto filter brightness-0 invert" />
          </div>
          <span class="text-3xl font-bold text-gray-900">Kitchenly</span>
        </router-link>
      </div>

      <!-- Content Card -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <h2 class="text-2xl font-bold text-white text-center">
            Password Recovery
          </h2>
        </div>
        
        <div class="p-8 space-y-6">
          <!-- Request Form State -->
          <div v-if="!emailSent" class="space-y-6">
            <div class="text-center space-y-4">
              <div class="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <KeyIcon class="w-10 h-10 text-blue-600" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-semibold text-gray-900">
                  Forgot your password?
                </h3>
                <p class="text-gray-600">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    v-model="values.email"
                    type="email"
                    autocomplete="email"
                    required
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    :class="{ 'border-red-300 focus:ring-red-500': errors.email }"
                    placeholder="you@example.com"
                  />
                </div>
                <p v-if="errors.email" class="mt-1 text-sm text-red-600 flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  {{ errors.email }}
                </p>
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                :disabled="isSubmitting || !isValid"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                <LoadingSpinner
                  v-if="isSubmitting"
                  size="sm"
                  variant="white"
                  customClass="mr-2"
                />
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ isSubmitting ? 'Sending...' : 'Send reset instructions' }}
              </button>
            </form>
            
            <!-- Back to login -->
            <div class="text-center pt-4">
              <router-link
                to="/login"
                class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to sign in
              </router-link>
            </div>
          </div>

          <!-- Email Sent State -->
          <div v-else class="space-y-6">
            <div class="text-center space-y-6">
              <div class="relative">
                <div class="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center transform transition-all duration-500 scale-110">
                  <CheckCircleIcon class="w-12 h-12 text-green-600" />
                </div>
                <div class="absolute -inset-4">
                  <svg class="w-32 h-32" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="url(#gradient)" stroke-width="2" stroke-dasharray="377" stroke-dashoffset="377" class="animate-[dash_1s_ease-out_forwards]"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="100%" stop-color="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div class="space-y-3">
                <h3 class="text-2xl font-bold text-gray-900">
                  Check your email!
                </h3>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-700">
                    We've sent password reset instructions to:
                  </p>
                  <p class="font-medium text-gray-900 mt-1">{{ values.email }}</p>
                </div>
                <p class="text-sm text-gray-600">
                  Click the link in the email to create a new password. The link will expire in 1 hour for security reasons.
                </p>
              </div>

              <!-- Resend button -->
              <div class="space-y-4 pt-4">
                <button
                  @click="resendResetLink"
                  :disabled="isResending || cooldownTime > 0"
                  class="w-full flex justify-center items-center py-3 px-4 border-2 border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <LoadingSpinner v-if="isResending" size="sm" customClass="mr-2" />
                  <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ resendButtonText }}
                </button>
                
                <div v-if="cooldownTime > 0" class="flex items-center justify-center space-x-2">
                  <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-xs text-gray-500">
                    Wait {{ cooldownTime }} seconds before resending
                  </p>
                </div>
              </div>

              <!-- Email not received -->
              <div class="border-t pt-6">
                <details class="text-left group">
                  <summary class="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer flex items-center justify-between">
                    <span>Didn't receive the email?</span>
                    <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div class="mt-4 space-y-3">
                    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p class="text-sm font-medium text-amber-800 mb-2">Quick troubleshooting:</p>
                      <ul class="space-y-2 text-sm text-amber-700">
                        <li class="flex items-start">
                          <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.707 8.621a1 1 0 00-1.414 1.414l1.5 1.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clip-rule="evenodd" />
                          </svg>
                          Check your spam or junk folder
                        </li>
                        <li class="flex items-start">
                          <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.707 8.621a1 1 0 00-1.414 1.414l1.5 1.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clip-rule="evenodd" />
                          </svg>
                          Ensure <span class="font-medium">{{ values.email }}</span> is correct
                        </li>
                        <li class="flex items-start">
                          <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.707 8.621a1 1 0 00-1.414 1.414l1.5 1.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clip-rule="evenodd" />
                          </svg>
                          Add noreply@kitchenly.com to safe senders
                        </li>
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

      <!-- Footer Links -->
      <div class="mt-8 text-center space-y-3">
        <div class="flex items-center justify-center space-x-4 text-sm">
          <router-link
            to="/register"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Create account
          </router-link>
          <span class="text-gray-400">•</span>
          <a
            href="mailto:support@kitchenly.com"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact support
          </a>
        </div>
        <p class="text-xs text-gray-500">
          © {{ new Date().getFullYear() }} Kitchenly. All rights reserved.
        </p>
      </div>
    </div>
  </div>
  </div>
  
  <style scoped>
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
  </style>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormWrapper } from '@/composables/useFormWrapper'
import { useToast } from '@/composables/useToast'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/validation/schemas'
import {
  KeyIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

// Form setup
const {
  values,
  errors,
  isValid,
  isSubmitting,
  handleSubmit: formHandleSubmit
} = useFormWrapper<ForgotPasswordFormData>({
  validationSchema: forgotPasswordSchema,
  initialValues: {
    email: ''
  }
})

// Component state
const emailSent = ref(false)
const isResending = ref(false)
const cooldownTime = ref(0)
const cooldownTimer = ref<number | null>(null)

// Computed properties
const resendButtonText = computed(() => {
  if (isResending.value) {
    return 'Sending...'
  } else if (cooldownTime.value > 0) {
    return `Resend email (${cooldownTime.value}s)`
  }
  return 'Resend reset link'
})

// Methods
const handleSubmit = formHandleSubmit(async (formData) => {
  try {
    await authStore.forgotPassword(formData.email)
    
    emailSent.value = true
    success('Password reset link sent successfully!')
    startCooldown()
  } catch (err: any) {
    handleForgotPasswordError(err)
  }
})

const handleForgotPasswordError = (err: any) => {
  const errorMessage = err.response?.data?.message || err.message || 'Failed to send reset link'
  
  // Handle specific errors
  if (err.response?.status === 404) {
    error('No account found with this email address')
  } else if (err.response?.status === 429) {
    error('Too many requests. Please try again later.')
  } else {
    error(errorMessage)
  }
}

const resendResetLink = async () => {
  if (!values.value.email || isResending.value || cooldownTime.value > 0) return
  
  try {
    isResending.value = true
    
    await authStore.forgotPassword(values.value.email)
    
    success('Reset link sent again!')
    startCooldown()
  } catch (err: any) {
    error('Failed to send reset link. Please try again later.')
  } finally {
    isResending.value = false
  }
}

const startCooldown = () => {
  cooldownTime.value = 60 // 60 seconds cooldown
  
  cooldownTimer.value = window.setInterval(() => {
    cooldownTime.value--
    
    if (cooldownTime.value <= 0) {
      clearInterval(cooldownTimer.value!)
      cooldownTimer.value = null
    }
  }, 1000)
}

// Lifecycle
onUnmounted(() => {
  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value)
  }
})

// Redirect if already authenticated
if (authStore.isAuthenticated) {
  router.push('/')
}
</script>

<script lang="ts">
export default {
  name: 'ForgotPasswordView'
}
</script>