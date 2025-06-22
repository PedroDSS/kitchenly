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
        <!-- Dynamic Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <h2 class="text-2xl font-bold text-white text-center">
            {{ pageTitle }}
          </h2>
        </div>
        
        <div class="p-8 space-y-6">
          <!-- Loading State -->
          <div v-if="isValidating" class="text-center space-y-6">
            <div class="relative">
              <div class="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <LoadingSpinner size="lg" variant="primary" />
              </div>
              <div class="absolute inset-0 mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <div class="space-y-2">
              <h3 class="text-xl font-semibold text-gray-900">
                Validating your reset link...
              </h3>
              <p class="text-sm text-gray-600">
                This will only take a moment.
              </p>
            </div>
          </div>

          <!-- Reset Form State -->
          <div v-else-if="tokenValid && !resetSuccess" class="space-y-6">
            <div class="text-center space-y-4">
              <div class="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <KeyIcon class="w-10 h-10 text-blue-600" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-semibold text-gray-900">
                  Create your new password
                </h3>
                <p class="text-gray-600">
                  Choose a strong password that you haven't used before on this account.
                </p>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- New Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    v-model="values.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    :class="{ 'border-red-300 focus:ring-red-500': errors.password }"
                    placeholder="Create your new password"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                    <EyeSlashIcon v-else class="h-5 w-5" />
                  </button>
                </div>
              
                <!-- Password Strength Indicator -->
                <div class="mt-2">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-600">Password strength</span>
                    <span class="text-xs font-medium" :class="passwordStrengthColor">
                      {{ passwordStrengthText }}
                    </span>
                  </div>
                  <div class="flex space-x-1">
                    <div 
                      v-for="i in 4" 
                      :key="i" 
                      class="flex-1 h-1.5 rounded-full transition-colors duration-300"
                      :class="i <= passwordStrength ? passwordStrengthBarColor : 'bg-gray-200'"
                    ></div>
                  </div>
                </div>
                
                <!-- Password Requirements -->
                <div class="mt-3 space-y-1">
                  <div 
                    v-for="(check, key) in passwordChecksDisplay" 
                    :key="key"
                    class="flex items-center text-xs transition-all duration-200"
                    :class="check.valid ? 'text-green-600' : 'text-gray-500'"
                  >
                    <svg 
                      class="h-4 w-4 mr-1.5 transition-transform duration-200" 
                      :class="check.valid ? 'scale-100' : 'scale-90'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        v-if="check.valid" 
                        fill-rule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clip-rule="evenodd" 
                      />
                      <path 
                        v-else 
                        fill-rule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clip-rule="evenodd" 
                      />
                    </svg>
                    <span>{{ check.text }}</span>
                  </div>
                </div>

                <p v-if="errors.password" class="mt-2 text-sm text-red-600">
                  {{ errors.password }}
                </p>
              </div>

              <!-- Confirm Password -->
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    v-model="values.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    :class="{ 
                      'border-red-300 focus:ring-red-500': errors.confirmPassword,
                      'border-green-300 focus:ring-green-500': passwordsMatch && values.confirmPassword
                    }"
                    placeholder="Re-enter your new password"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                    <EyeSlashIcon v-else class="h-5 w-5" />
                  </button>
                </div>
                
                <!-- Password Match Indicator -->
                <div v-if="values.confirmPassword" class="mt-1 flex items-center text-xs transition-all duration-200">
                  <svg 
                    class="h-4 w-4 mr-1.5" 
                    :class="passwordsMatch ? 'text-green-500' : 'text-red-500'"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      v-if="passwordsMatch" 
                      fill-rule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clip-rule="evenodd" 
                    />
                    <path 
                      v-else 
                      fill-rule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clip-rule="evenodd" 
                    />
                  </svg>
                  <span :class="passwordsMatch ? 'text-green-600' : 'text-red-600'">
                    {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
                  </span>
                </div>

                <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-600">
                  {{ errors.confirmPassword }}
                </p>
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                :disabled="isSubmitting || !isValid || !passwordsMatch || passwordStrength < 3"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                <LoadingSpinner
                  v-if="isSubmitting"
                  size="sm"
                  variant="white"
                  customClass="mr-2"
                />
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {{ isSubmitting ? 'Updating password...' : 'Set new password' }}
              </button>
            </form>
          </div>

          <!-- Success State -->
          <div v-else-if="resetSuccess" class="text-center space-y-6">
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
                Password updated!
              </h3>
              <p class="text-gray-600">
                Your password has been successfully reset. You can now sign in with your new password.
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
                Sign in with new password
              </button>
              
              <button
                @click="goToHome"
                class="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
            
            <!-- Security tip -->
            <div class="bg-blue-50 rounded-lg p-4 mt-6">
              <p class="text-sm text-blue-800">
                🔒 <span class="font-semibold">Security tip:</span> Use a password manager to keep your passwords safe and unique.
              </p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else class="text-center space-y-6">
            <div class="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
              <XCircleIcon class="w-12 h-12 text-red-600" />
            </div>
            
            <div class="space-y-3">
              <h3 class="text-xl font-semibold text-gray-900">
                Invalid or expired link
              </h3>
              <div class="bg-red-50 rounded-lg p-4">
                <p class="text-sm text-red-800">
                  {{ errorMessage }}
                </p>
              </div>
            </div>

            <div class="space-y-3 pt-4">
              <button
                @click="goToForgotPassword"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Request new reset link
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
        </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600">
          Having trouble? Our support team is ready to help
        </p>
        <div class="mt-3">
          <a href="mailto:support@kitchenly.com" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@kitchenly.com
          </a>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormWrapper } from '@/composables/useFormWrapper'
import { useToast } from '@/composables/useToast'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/validation/schemas'
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

// Get token from URL
const token = ref(route.params.token as string || route.query.token as string)

// Form setup
const {
  values,
  errors,
  isValid,
  isSubmitting,
  handleSubmit: formHandleSubmit
} = useFormWrapper<ResetPasswordFormData>({
  validationSchema: resetPasswordSchema,
  initialValues: {
    password: '',
    confirmPassword: ''
  }
})

// Component state
const isValidating = ref(false)
const tokenValid = ref(false)
const resetSuccess = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

// Computed properties
const pageTitle = computed(() => {
  if (isValidating.value) {
    return 'Validating Reset Link'
  } else if (resetSuccess.value) {
    return 'Password Reset Successful'
  } else if (!tokenValid.value) {
    return 'Invalid Reset Link'
  }
  return 'Reset Your Password'
})

// Password validation checks
const passwordChecks = computed(() => {
  const password = values.value.password
  return {
    minLength: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
})

// Password checks for display
const passwordChecksDisplay = computed(() => {
  return {
    minLength: { text: 'At least 12 characters', valid: passwordChecks.value.minLength },
    uppercase: { text: 'One uppercase letter', valid: passwordChecks.value.uppercase },
    lowercase: { text: 'One lowercase letter', valid: passwordChecks.value.lowercase },
    number: { text: 'One number', valid: passwordChecks.value.number },
    special: { text: 'One special character', valid: passwordChecks.value.special }
  }
})

// Password strength calculation
const passwordStrength = computed(() => {
  const checks = passwordChecks.value
  let strength = 0
  if (checks.minLength) strength++
  if (checks.uppercase && checks.lowercase) strength++
  if (checks.number) strength++
  if (checks.special) strength++
  return strength
})

// Password strength text
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'Weak'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    case 4:
      return 'Strong'
    default:
      return ''
  }
})

// Password strength color
const passwordStrengthColor = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'text-red-600'
    case 2:
      return 'text-amber-600'
    case 3:
      return 'text-blue-600'
    case 4:
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
})

// Password strength bar color
const passwordStrengthBarColor = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'bg-red-500'
    case 2:
      return 'bg-amber-500'
    case 3:
      return 'bg-blue-500'
    case 4:
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
})

// Password match indicator
const passwordsMatch = computed(() => {
  return values.value.password === values.value.confirmPassword && 
         values.value.confirmPassword.length > 0
})

// Methods
const validateToken = async () => {
  if (!token.value) {
    tokenValid.value = false
    errorMessage.value = 'No reset token provided. Please request a new password reset link.'
    return
  }

  try {
    isValidating.value = true
    
    // We'll validate the token by attempting to use it
    // Since there's no dedicated validate endpoint, we'll just set it as valid
    // The actual validation will happen when we submit the form
    tokenValid.value = true
  } catch (err: any) {
    tokenValid.value = false
    errorMessage.value = err.response?.data?.message || 'Invalid or expired reset token'
  } finally {
    isValidating.value = false
  }
}

const handleSubmit = formHandleSubmit(async (formData) => {
  try {
    await authStore.resetPassword(token.value, formData.password)
    
    resetSuccess.value = true
    success('Password reset successfully!')
  } catch (err: any) {
    handleResetError(err)
  }
})

const handleResetError = (err: any) => {
  const errorMsg = err.response?.data?.message || err.message || 'Failed to reset password'
  
  // Handle specific errors
  if (err.response?.status === 400 || err.response?.status === 410) {
    tokenValid.value = false
    errorMessage.value = 'This reset link has expired or is invalid. Please request a new one.'
  } else if (err.response?.status === 422) {
    // Validation errors
    const validationErrors = err.response.data?.errors
    if (validationErrors) {
      Object.entries(validationErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          error(`${field}: ${messages[0]}`)
        }
      })
    }
  } else {
    error(errorMsg)
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

// Lifecycle
onMounted(() => {
  validateToken()
})

// Redirect if already authenticated
if (authStore.isAuthenticated) {
  router.push('/')
}
</script>

<script lang="ts">
export default {
  name: 'ResetPasswordView'
}
</script>