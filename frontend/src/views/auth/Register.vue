<template>
  <AuthLayout title="Create Your Account">
    <!-- Progress Steps -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center flex-1">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <span class="ml-2 text-sm font-medium text-gray-900">Account Info</span>
        </div>
        <div class="flex-1 mx-3">
          <div class="h-0.5 bg-gray-200"></div>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <span class="ml-2 text-sm text-gray-500">Verify Email</span>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Personal Information -->
      <div class="grid grid-cols-2 gap-4">
        <!-- First Name -->
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            id="firstName"
            v-model="values.firstName"
            type="text"
            autocomplete="given-name"
            required
            class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.firstName }"
            placeholder="John"
          />
          <p v-if="errors.firstName" class="mt-2 text-sm text-red-600">
            {{ errors.firstName }}
          </p>
        </div>

        <!-- Last Name -->
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            v-model="values.lastName"
            type="text"
            autocomplete="family-name"
            required
            class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.lastName }"
            placeholder="Doe"
          />
          <p v-if="errors.lastName" class="mt-2 text-sm text-red-600">
            {{ errors.lastName }}
          </p>
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            id="email"
            v-model="values.email"
            type="email"
            autocomplete="email"
            required
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.email }"
            placeholder="john@example.com"
          />
        </div>
        <p v-if="errors.email" class="mt-2 text-sm text-red-600">
          {{ errors.email }}
        </p>
      </div>

      <!-- Account Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Account Type
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none transition-all duration-200" 
                 :class="values.role === 'user' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'">
            <input
              v-model="values.role"
              type="radio"
              value="user"
              class="sr-only"
            />
            <div class="flex w-full">
              <div class="flex flex-col">
                <span class="block text-sm font-medium text-gray-900">Personal</span>
                <span class="mt-1 text-xs text-gray-500">For individual use</span>
              </div>
            </div>
            <svg v-if="values.role === 'user'" class="absolute top-4 right-4 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </label>
          
          <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none transition-all duration-200" 
                 :class="values.role === 'b2b' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'">
            <input
              v-model="values.role"
              type="radio"
              value="b2b"
              class="sr-only"
            />
            <div class="flex w-full">
              <div class="flex flex-col">
                <span class="block text-sm font-medium text-gray-900">Business</span>
                <span class="mt-1 text-xs text-gray-500">B2B pricing</span>
              </div>
            </div>
            <svg v-if="values.role === 'b2b'" class="absolute top-4 right-4 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </label>
        </div>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="password"
            v-model="values.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.password }"
            placeholder="Create a strong password"
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
        <div class="mt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-600">Password strength</span>
            <span class="text-xs font-medium" :class="passwordStrengthColor">
              {{ passwordStrengthText }}
            </span>
          </div>
          <div class="flex space-x-1">
            <div 
              v-for="i in 4" 
              :key="i" 
              class="flex-1 h-2 rounded-full transition-all duration-300"
              :class="i <= passwordStrength ? passwordStrengthBarColor : 'bg-gray-200'"
            ></div>
          </div>
        </div>
        
        <!-- Password Requirements -->
        <div class="mt-3 space-y-1.5">
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
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <input
            id="confirmPassword"
            v-model="values.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 
              'border-red-300 focus:ring-red-500': errors.confirmPassword,
              'border-green-300 focus:ring-green-500': passwordsMatch && values.confirmPassword
            }"
            placeholder="Re-enter your password"
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
        <div v-if="values.confirmPassword" class="mt-2 flex items-center text-xs transition-all duration-200">
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

      <!-- Terms and Privacy -->
      <div class="space-y-3">
        <div class="flex items-start">
          <input
            id="acceptTerms"
            v-model="acceptTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 transition-colors"
          />
          <label for="acceptTerms" class="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
            I agree to the
            <a href="/terms" class="text-blue-600 hover:text-blue-700 underline" target="_blank">
              Terms of Service
            </a>
            and
            <a href="/privacy" class="text-blue-600 hover:text-blue-700 underline" target="_blank">
              Privacy Policy
            </a>
          </label>
        </div>

        <!-- Marketing Consent -->
        <div class="flex items-start">
          <input
            id="marketingConsent"
            v-model="marketingConsent"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 transition-colors"
          />
          <label for="marketingConsent" class="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
            Send me exclusive offers and product updates
          </label>
        </div>
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        :disabled="isSubmitting || !isValid || !acceptTerms"
        class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01]"
      >
        <LoadingSpinner v-if="isSubmitting" size="sm" variant="white" class="mr-2" />
        <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
      </button>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">Already have an account?</span>
        </div>
      </div>

      <!-- Sign In Link -->
      <div class="text-center">
        <router-link 
          to="/login"
          class="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In Instead
        </router-link>
      </div>
    </form>

    <!-- Footer Links -->
    <template #footer>
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          <span class="font-medium">Special Offer:</span> Get €50 off your first order over €500!
        </p>
        <p class="text-sm text-gray-600">
          Need help? 
          <a href="mailto:support@kitchenly.com" class="font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Contact support
          </a>
        </p>
      </div>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormWrapper } from '@/composables/useFormWrapper'
import { useToast } from '@/composables/useToast'
import { registerSchema, type RegisterFormData } from '@/validation/schemas'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import AuthLayout from '@/components/AuthLayout.vue'

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
} = useFormWrapper<RegisterFormData>({
  validationSchema: registerSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  }
})

// Component state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)
const marketingConsent = ref(false)

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
const handleSubmit = formHandleSubmit(async (formData) => {
  try {
    const registerData = {
      ...formData,
      marketingConsent: marketingConsent.value
    }
    
    await authStore.register(registerData)
    
    success('Account created successfully! Please check your email for confirmation instructions.')
    
    // Redirect to email confirmation page
    router.push({
      path: '/email-confirmation',
      query: { email: formData.email }
    })
  } catch (err: any) {
    handleRegistrationError(err)
  }
})

const handleRegistrationError = (err: any) => {
  const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
  
  // Handle specific errors
  if (err.response?.status === 409) {
    error('An account with this email address already exists')
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
    error(errorMessage)
  }
}

// Redirect if already authenticated
if (authStore.isAuthenticated) {
  router.push('/')
}
</script>

<script lang="ts">
export default {
  name: 'RegisterView'
}
</script>