<template>
  <AuthLayout title="Créer votre compte">
    <!-- Progress Steps -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center flex-1">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <span class="ml-2 text-sm font-medium text-gray-900">Informations du compte</span>
        </div>
        <div class="flex-1 mx-3">
          <div class="h-0.5 bg-gray-200"></div>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <span class="ml-2 text-sm text-gray-500">Vérification du mail</span>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="onSubmit" class="space-y-6">

      <!-- Personal Information -->
      <div class="grid grid-cols-2 gap-4">
        <!-- First Name -->
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          <input
            id="firstName"
            v-model="firstName"
            v-bind="firstNameAttrs"
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
            Nom
          </label>
          <input
            id="lastName"
            v-model="lastName"
            v-bind="lastNameAttrs"
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

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            id="phone"
            v-model="phone"
            v-bind="phoneAttrs"
            type="tel"
            autocomplete="tel"
            required
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.phone }"
            placeholder="+33 6 12 34 56 78"
          />
        </div>
        <p v-if="errors.phone" class="mt-2 text-sm text-red-600">
          {{ errors.phone }}
        </p>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Adresse email
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
            v-model="email"
            v-bind="emailAttrs"
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
          Type de compte
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none transition-all duration-200" 
                 :class="values.customerType === 'B2C' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'">
            <input
              v-model="customerType"
              v-bind="customerTypeAttrs"
              type="radio"
              value="B2C"
              class="sr-only"
            />
            <div class="flex w-full">
              <div class="flex flex-col">
                <span class="block text-sm font-medium text-gray-900">Particulier</span>
                <span class="mt-1 text-xs text-gray-500">Pour usage personnel</span>
              </div>
            </div>
            <svg v-if="customerType === 'B2C'" class="absolute top-4 right-4 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </label>
          
          <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none transition-all duration-200" 
                 :class="values.customerType === 'B2B' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'">
            <input
              v-model="customerType"
              v-bind="customerTypeAttrs"
              type="radio"
              value="B2B"
              class="sr-only"
            />
            <div class="flex w-full">
              <div class="flex flex-col">
                <span class="block text-sm font-medium text-gray-900">Professionnel</span>
                <span class="mt-1 text-xs text-gray-500">Tarifs B2B</span>
              </div>
            </div>
            <svg v-if="customerType === 'B2B'" class="absolute top-4 right-4 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </label>
        </div>
      </div>

      <!-- B2B Additional Fields -->
      <div v-if="customerType === 'B2B'" class="space-y-4">
        <!-- Company Name -->
        <div>
          <label for="companyName" class="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'entreprise
          </label>
          <input
            id="companyName"
            v-model="companyName"
            v-bind="companyNameAttrs"
            type="text"
            autocomplete="organization"
            required
            class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.companyName }"
            placeholder="Nom de votre entreprise"
          />
          <p v-if="errors.companyName" class="mt-2 text-sm text-red-600">
            {{ errors.companyName }}
          </p>
        </div>

        <!-- VAT Number -->
        <div>
          <label for="vatNumber" class="block text-sm font-medium text-gray-700 mb-2">
            Numéro de TVA intracommunautaire
          </label>
          <input
            id="vatNumber"
            v-model="vatNumber"
            v-bind="vatNumberAttrs"
            type="text"
            autocomplete="off"
            required
            class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.vatNumber }"
            placeholder="FR12345678901"
          />
          <p v-if="errors.vatNumber" class="mt-2 text-sm text-red-600">
            {{ errors.vatNumber }}
          </p>
        </div>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Mot de passe
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
            v-model="password"
            v-bind="passwordAttrs"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-300 focus:ring-red-500': errors.password }"
            placeholder="M3ubl3.2.M4rbr3"
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
          Confirmer le mot de passe
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
            v-model="confirmPassword"
            v-bind="confirmPasswordAttrs"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 
              'border-red-300 focus:ring-red-500': errors.confirmPassword,
              'border-green-300 focus:ring-green-500': passwordsMatch && confirmPassword
            }"
            placeholder="M3ubl3.2.M4rbr3"
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
        <div v-if="confirmPassword" class="mt-2 flex items-center text-xs transition-all duration-200">
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
            J'accepte les
            <a href="/terms" class="text-blue-600 hover:text-blue-700 underline" target="_blank">
              Conditions d'utilisation
            </a>
            et la
            <a href="/privacy" class="text-blue-600 hover:text-blue-700 underline" target="_blank">
              Politique de confidentialité
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
            Envoyez-moi des offres exclusives et des mises à jour produits
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
          <span class="px-4 bg-white text-gray-500">Vous avez déjà un compte ?</span>
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
          Se connecter
        </router-link>
      </div>
    </form>

    <!-- Footer Links -->
    <template #footer>
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          <span class="font-medium">Offre spéciale :</span> Bénéficiez de 50 € de réduction sur votre première commande de plus de 500 € !
        </p>
        <p class="text-sm text-gray-600">
          Besoin d’aide ? 
          <a href="mailto:contact.kitchenly@gmail.com" class="font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Contactez le support
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
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from '@/composables/useToast'
import { registerSchema, type RegisterFormData } from '@/validation/schemas'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import AuthLayout from '@/components/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

// Form setup with VeeValidate
const {
  values,
  errors,
  isSubmitting,
  defineField,
  handleSubmit
} = useForm<RegisterFormData>({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    customerType: 'B2C',
    phone: '',
    companyName: '',
    vatNumber: ''
  }
})

// Define form fields
const [firstName, firstNameAttrs] = defineField('firstName')
const [lastName, lastNameAttrs] = defineField('lastName')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')
const [customerType, customerTypeAttrs] = defineField('customerType')
const [phone, phoneAttrs] = defineField('phone')
const [companyName, companyNameAttrs] = defineField('companyName')
const [vatNumber, vatNumberAttrs] = defineField('vatNumber')

// Component state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)
const marketingConsent = ref(false)

// Password validation checks
const passwordChecks = computed(() => {
  const pwd = password.value || ''
  return {
    minLength: pwd.length >= 12,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  }
})

// Password checks for display
const passwordChecksDisplay = computed(() => {
  return {
    minLength: { text: 'Au moins 12 caractères', valid: passwordChecks.value.minLength },
    uppercase: { text: 'Une lettre majuscule', valid: passwordChecks.value.uppercase },
    lowercase: { text: 'Une lettre minuscule', valid: passwordChecks.value.lowercase },
    number: { text: 'Un chiffre', valid: passwordChecks.value.number },
    special: { text: 'Un caractère spécial', valid: passwordChecks.value.special }
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
  return password.value === confirmPassword.value && 
         (confirmPassword.value?.length || 0) > 0
})

// Form validation state
const isValid = computed(() => {
  return acceptTerms.value && Object.keys(errors.value).length === 0
})

// Methods
const onSubmit = handleSubmit(async (formData) => {
  try {
    // Prepare data for backend API
    const registerData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      customerType: formData.customerType,
      companyName: formData.customerType === 'B2B' ? formData.companyName : undefined,
      vatNumber: formData.customerType === 'B2B' ? formData.vatNumber : undefined,
      marketingConsent: marketingConsent.value
    }
    
    await authStore.register(registerData)
    
    success('Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.')
    
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
  const errorMessage = err.response?.data?.message || err.message || 'L\'inscription a échoué'
  
  // Handle specific errors
  if (err.response?.status === 400 && errorMessage.includes('existe déjà')) {
    error('Un compte avec cette adresse email existe déjà')
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