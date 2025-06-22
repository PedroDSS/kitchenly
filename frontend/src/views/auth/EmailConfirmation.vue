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
        <!-- Animated Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <h2 class="text-2xl font-bold text-white text-center">
            {{ pageTitle }}
          </h2>
        </div>
        
        <div class="p-8 space-y-6">
          <!-- Pending Confirmation State -->
          <div v-if="!token && !isConfirming" class="text-center space-y-6">
            <div class="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center animate-pulse">
              <EnvelopeIcon class="w-12 h-12 text-blue-600" />
            </div>
            
            <div class="space-y-3">
              <h3 class="text-xl font-semibold text-gray-900">
                Check your inbox!
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700">
                  We've sent a confirmation email to:
                </p>
                <p class="font-medium text-gray-900 mt-1">{{ userEmail }}</p>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                Click the link in the email to activate your account and start shopping for amazing home appliances.
              </p>
            </div>

            <!-- Resend button -->
            <div class="space-y-4 pt-4">
              <button
                @click="resendConfirmation"
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
                    <p class="text-sm font-medium text-amber-800 mb-2">Common issues:</p>
                    <ul class="space-y-2 text-sm text-amber-700">
                      <li class="flex items-start">
                        <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.707 8.621a1 1 0 00-1.414 1.414l1.5 1.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clip-rule="evenodd" />
                        </svg>
                        Check your spam or promotions folder
                      </li>
                      <li class="flex items-start">
                        <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.707 8.621a1 1 0 00-1.414 1.414l1.5 1.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clip-rule="evenodd" />
                        </svg>
                        Verify <span class="font-medium">{{ userEmail }}</span> is correct
                      </li>
                      <li class="flex items-start">
                        <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.707 8.621a1 1 0 00-1.414 1.414l1.5 1.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clip-rule="evenodd" />
                        </svg>
                        Add noreply@kitchenly.com to your contacts
                      </li>
                    </ul>
                  </div>
                  <div class="text-center pt-2">
                    <a href="mailto:support@kitchenly.com" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Contact Support Team
                    </a>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <!-- Confirming State -->
          <div v-else-if="isConfirming" class="text-center space-y-6">
            <div class="relative">
              <div class="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <LoadingSpinner size="lg" variant="primary" />
              </div>
              <div class="absolute inset-0 mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <div class="space-y-2">
              <h3 class="text-xl font-semibold text-gray-900">
                Verifying your email...
              </h3>
              <p class="text-sm text-gray-600">
                This will only take a moment.
              </p>
            </div>
          </div>

          <!-- Success State -->
          <div v-else-if="confirmationStatus === 'success'" class="text-center space-y-6">
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
                Welcome to Kitchenly!
              </h3>
              <p class="text-gray-600">
                Your email has been verified. You're all set to explore our amazing collection of home appliances.
              </p>
            </div>

            <div class="space-y-3 pt-4">
              <button
                @click="goToLogin"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-[1.02]"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Your Account
              </button>
              
              <button
                @click="goToHome"
                class="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Browse Without Account
              </button>
            </div>
            
            <!-- Special offer for new users -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
              <p class="text-sm text-blue-800">
                🎉 <span class="font-semibold">Welcome Gift:</span> Use code <span class="font-mono bg-blue-100 px-2 py-1 rounded">WELCOME50</span> for €50 off your first order!
              </p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="confirmationStatus === 'error'" class="text-center space-y-6">
            <div class="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
              <XCircleIcon class="w-12 h-12 text-red-600" />
            </div>
            
            <div class="space-y-3">
              <h3 class="text-xl font-semibold text-gray-900">
                Oops! Something went wrong
              </h3>
              <div class="bg-red-50 rounded-lg p-4">
                <p class="text-sm text-red-800">
                  {{ errorMessage }}
                </p>
              </div>
            </div>

            <div class="space-y-3 pt-4">
              <button
                @click="resendConfirmation"
                :disabled="isResending"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LoadingSpinner v-if="isResending" size="sm" variant="white" customClass="mr-2" />
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              
              <button
                @click="goToLogin"
                class="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Sign In
              </button>
            </div>
          </div>

          <!-- Expired Token State -->
          <div v-else-if="confirmationStatus === 'expired'" class="text-center space-y-6">
            <div class="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon class="w-12 h-12 text-amber-600" />
            </div>
            
            <div class="space-y-3">
              <h3 class="text-xl font-semibold text-gray-900">
                Link Expired
              </h3>
              <div class="bg-amber-50 rounded-lg p-4">
                <p class="text-sm text-amber-800">
                  This confirmation link has expired for security reasons. Let's send you a fresh one!
                </p>
              </div>
            </div>

            <button
              @click="resendConfirmation"
              :disabled="isResending"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LoadingSpinner v-if="isResending" size="sm" variant="white" customClass="mr-2" />
              <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send New Confirmation Email
            </button>
          </div>
        </div>
      </div>

      <!-- Help Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600">
          Need assistance? Our support team is here to help
        </p>
        <div class="mt-3 flex items-center justify-center space-x-4">
          <a href="mailto:support@kitchenly.com" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@kitchenly.com
          </a>
          <span class="text-gray-400">•</span>
          <a href="tel:+33123456789" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +33 1 23 45 67 89
          </a>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

// State
const token = ref(route.params.token as string || route.query.token as string)
const userEmail = ref(route.query.email as string || 'your email address')
const isConfirming = ref(false)
const isResending = ref(false)
const confirmationStatus = ref<'pending' | 'success' | 'error' | 'expired'>('pending')
const errorMessage = ref('')
const cooldownTime = ref(0)
const cooldownTimer = ref<number | null>(null)

// Computed properties
const pageTitle = computed(() => {
  switch (confirmationStatus.value) {
    case 'success':
      return 'Email Confirmed'
    case 'error':
    case 'expired':
      return 'Confirmation Failed'
    default:
      return 'Confirm Your Email'
  }
})

const resendButtonText = computed(() => {
  if (isResending.value) {
    return 'Sending...'
  } else if (cooldownTime.value > 0) {
    return `Resend email (${cooldownTime.value}s)`
  }
  return 'Resend confirmation email'
})

// Methods
const confirmEmail = async () => {
  if (!token.value) return
  
  try {
    isConfirming.value = true
    await authStore.confirmEmail(token.value)
    
    confirmationStatus.value = 'success'
    success('Email confirmed successfully!')
  } catch (err: any) {
    console.error('Email confirmation error:', err)
    
    if (err.response?.status === 410) {
      confirmationStatus.value = 'expired'
    } else {
      confirmationStatus.value = 'error'
      errorMessage.value = err.response?.data?.message || 'Failed to confirm email. Please try again.'
    }
    
    error(errorMessage.value || 'Failed to confirm email')
  } finally {
    isConfirming.value = false
  }
}

const resendConfirmation = async () => {
  if (!userEmail.value || isResending.value || cooldownTime.value > 0) return
  
  try {
    isResending.value = true
    
    // Call the forgot password endpoint to resend confirmation
    // Since we don't have a dedicated resend endpoint, we use the registration flow
    await authStore.forgotPassword(userEmail.value)
    
    success('A new confirmation email has been sent to your inbox.')
    startCooldown()
  } catch (err: any) {
    error('Failed to send confirmation email. Please try again later.')
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

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/')
}

// Lifecycle
onMounted(() => {
  // If we have a token in the URL, attempt to confirm
  if (token.value) {
    confirmEmail()
  }
  
  // If no email is provided in query params, try to get it from localStorage or previous registration
  if (!userEmail.value || userEmail.value === 'your email address') {
    const storedEmail = localStorage.getItem('pending_confirmation_email')
    if (storedEmail) {
      userEmail.value = storedEmail
    }
  } else {
    // Store email for future reference
    localStorage.setItem('pending_confirmation_email', userEmail.value)
  }
})

onUnmounted(() => {
  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value)
  }
})

// Clean up stored email on successful confirmation
if (confirmationStatus.value === 'success') {
  localStorage.removeItem('pending_confirmation_email')
}

// Redirect if already authenticated
if (authStore.isAuthenticated) {
  router.push('/')
}
</script>

<script lang="ts">
export default {
  name: 'EmailConfirmationView'
}
</script>