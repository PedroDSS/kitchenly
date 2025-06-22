<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="container">
        <div class="flex items-center justify-between py-4">
          <router-link to="/" class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kitchenly</h1>
            <span class="text-sm text-gray-500 dark:text-gray-400">Finalisation de commande</span>
          </router-link>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ authStore.user?.email }}
            </span>
            <button @click="logout" class="btn btn-secondary btn-sm">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Progress Steps -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container py-4">
        <div class="flex items-center justify-center space-x-4">
          <div 
            v-for="(step, index) in steps" 
            :key="step.id"
            class="flex items-center"
          >
            <div class="flex items-center">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep > index 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                ]"
              >
                <CheckIcon v-if="currentStep > index" class="w-5 h-5" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span 
                :class="[
                  'ml-2 text-sm font-medium',
                  currentStep >= index 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                ]"
              >
                {{ step.label }}
              </span>
            </div>
            <ChevronRightIcon 
              v-if="index < steps.length - 1" 
              class="w-4 h-4 text-gray-400 mx-4" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Content -->
    <div class="container py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Address Step -->
          <div v-if="currentStep === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Adresse de livraison
            </h2>

            <form @submit.prevent="nextStep" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Prénom</label>
                  <input
                    v-model="checkoutData.firstName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Nom</label>
                  <input
                    v-model="checkoutData.lastName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="form-label">Adresse</label>
                <input
                  v-model="checkoutData.address"
                  type="text"
                  class="form-input"
                  placeholder="123 rue de la Paix"
                  required
                />
              </div>

              <div>
                <label class="form-label">Complément d'adresse</label>
                <input
                  v-model="checkoutData.addressComplement"
                  type="text"
                  class="form-input"
                  placeholder="Appartement, bâtiment, etc."
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="form-label">Code postal</label>
                  <input
                    v-model="checkoutData.postalCode"
                    type="text"
                    class="form-input"
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label">Ville</label>
                  <input
                    v-model="checkoutData.city"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="form-label">Téléphone</label>
                <input
                  v-model="checkoutData.phone"
                  type="tel"
                  class="form-input"
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>

              <div class="flex items-center">
                <input
                  v-model="checkoutData.saveAddress"
                  type="checkbox"
                  id="save-address"
                  class="form-checkbox"
                />
                <label for="save-address" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enregistrer cette adresse pour mes prochaines commandes
                </label>
              </div>

              <div class="flex justify-between pt-6">
                <router-link to="/cart" class="btn btn-outline">
                  Retour au panier
                </router-link>
                <button type="submit" class="btn btn-primary">
                  Continuer vers la livraison
                </button>
              </div>
            </form>
          </div>

          <!-- Delivery Step -->
          <div v-else-if="currentStep === 1" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Mode de livraison
            </h2>

            <div class="space-y-4">
              <!-- Delivery Options -->
              <label
                v-for="option in deliveryOptions"
                :key="option.id"
                class="block"
              >
                <div 
                  :class="[
                    'border rounded-lg p-4 cursor-pointer transition-colors',
                    checkoutData.deliveryOption === option.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <div class="flex items-start">
                    <input
                      v-model="checkoutData.deliveryOption"
                      type="radio"
                      :value="option.id"
                      class="form-radio mt-1"
                    />
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <h4 class="font-medium text-gray-900 dark:text-white">
                          {{ option.name }}
                        </h4>
                        <span class="font-semibold text-gray-900 dark:text-white">
                          {{ option.price === 0 ? 'Gratuit' : formatPrice(option.price) }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ option.description }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Livraison estimée : {{ option.estimatedDays }} jours
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              <!-- Relay Points Map (if relay point selected) -->
              <div v-if="checkoutData.deliveryOption === 'relay'" class="mt-6">
                <h3 class="font-medium text-gray-900 dark:text-white mb-3">
                  Choisir un point relais
                </h3>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                  <p class="text-gray-500 dark:text-gray-400">
                    Carte des points relais (à implémenter)
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-between pt-6">
              <button @click="previousStep" class="btn btn-outline">
                Retour
              </button>
              <button @click="nextStep" class="btn btn-primary" :disabled="!checkoutData.deliveryOption">
                Continuer vers le paiement
              </button>
            </div>
          </div>

          <!-- Payment Step -->
          <div v-else-if="currentStep === 2" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Paiement
            </h2>

            <div class="space-y-6">
              <!-- Payment Method Selection -->
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white mb-3">
                  Méthode de paiement
                </h3>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="checkoutData.paymentMethod"
                      type="radio"
                      value="card"
                      class="form-radio"
                    />
                    <span class="ml-2 text-gray-700 dark:text-gray-300">Carte bancaire</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="checkoutData.paymentMethod"
                      type="radio"
                      value="paypal"
                      class="form-radio"
                    />
                    <span class="ml-2 text-gray-700 dark:text-gray-300">PayPal</span>
                  </label>
                </div>
              </div>

              <!-- Card Payment Form -->
              <div v-if="checkoutData.paymentMethod === 'card'" class="space-y-4">
                <div>
                  <label class="form-label">Numéro de carte</label>
                  <div class="relative">
                    <input
                      v-model="cardNumber"
                      type="text"
                      class="form-input pl-12"
                      placeholder="1234 5678 9012 3456"
                      maxlength="19"
                      @input="formatCardNumber"
                    />
                    <CreditCardIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Date d'expiration</label>
                    <input
                      v-model="expiryDate"
                      type="text"
                      class="form-input"
                      placeholder="MM/AA"
                      maxlength="5"
                      @input="formatExpiryDate"
                    />
                  </div>
                  <div>
                    <label class="form-label">Code de sécurité</label>
                    <input
                      v-model="cvv"
                      type="text"
                      class="form-input"
                      placeholder="123"
                      maxlength="4"
                    />
                  </div>
                </div>

                <div>
                  <label class="form-label">Nom sur la carte</label>
                  <input
                    v-model="cardName"
                    type="text"
                    class="form-input"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <!-- PayPal -->
              <div v-else-if="checkoutData.paymentMethod === 'paypal'" class="text-center py-8">
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  Vous serez redirigé vers PayPal pour finaliser le paiement
                </p>
                <div class="inline-flex items-center justify-center w-32 h-12 bg-gray-100 dark:bg-gray-700 rounded">
                  <span class="font-bold text-blue-800 dark:text-blue-400">PayPal</span>
                </div>
              </div>

              <!-- Terms Acceptance -->
              <div class="flex items-start">
                <input
                  v-model="acceptTerms"
                  type="checkbox"
                  id="accept-terms"
                  class="form-checkbox mt-1"
                />
                <label for="accept-terms" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  J'accepte les 
                  <a href="#" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    conditions générales de vente
                  </a>
                  et la 
                  <a href="#" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    politique de confidentialité
                  </a>
                </label>
              </div>
            </div>

            <div class="flex justify-between pt-6">
              <button @click="previousStep" class="btn btn-outline">
                Retour
              </button>
              <button 
                @click="submitOrder" 
                class="btn btn-primary"
                :disabled="!checkoutData.paymentMethod || !acceptTerms || isProcessing"
              >
                <span v-if="!isProcessing">Confirmer et payer</span>
                <span v-else class="flex items-center">
                  <LoadingSpinner size="sm" class="mr-2" />
                  Traitement...
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Récapitulatif de commande
            </h3>

            <!-- Cart Items -->
            <div class="space-y-3 mb-6">
              <div v-for="item in cartStore.cart?.items" :key="item.id" class="flex items-center space-x-3">
                <div class="w-12 h-12 flex-shrink-0">
                  <img 
                    v-if="item.product.images?.[0]"
                    :src="item.product.images[0]"
                    :alt="item.product.name"
                    class="w-full h-full object-cover rounded"
                  />
                  <div v-else class="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <PhotoIcon class="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.product.name }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Qté: {{ item.quantity }}
                  </p>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(item.product.price * item.quantity) }}
                </span>
              </div>
            </div>

            <!-- Totals -->
            <div class="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(cartStore.totalAmount) }}
                </span>
              </div>
              <div v-if="selectedDeliveryOption" class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Livraison</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ selectedDeliveryOption.price === 0 ? 'Gratuite' : formatPrice(selectedDeliveryOption.price) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(taxAmount) }}
                </span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div class="flex justify-between">
                  <span class="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {{ formatPrice(orderTotal) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Security Badge -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <LockClosedIcon class="w-4 h-4 mr-2" />
                Paiement 100% sécurisé
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { 
  CheckIcon,
  ChevronRightIcon,
  PhotoIcon,
  CreditCardIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'
import { toast } from '@/utils/toast'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// Steps configuration
const steps = [
  { id: 'address', label: 'Adresse' },
  { id: 'delivery', label: 'Livraison' },
  { id: 'payment', label: 'Paiement' }
]

// State
const currentStep = ref(0)
const isProcessing = ref(false)
const acceptTerms = ref(false)

// Checkout data
const checkoutData = ref({
  // Address
  firstName: '',
  lastName: '',
  address: '',
  addressComplement: '',
  postalCode: '',
  city: '',
  phone: '',
  saveAddress: false,
  
  // Delivery
  deliveryOption: '',
  relayPointId: null,
  
  // Payment
  paymentMethod: 'card'
})

// Payment form data
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const cardName = ref('')

// Delivery options
const deliveryOptions = ref([
  {
    id: 'standard',
    name: 'Livraison standard',
    description: 'Livraison à domicile par transporteur',
    price: 15,
    estimatedDays: '3-5'
  },
  {
    id: 'express',
    name: 'Livraison express',
    description: 'Livraison rapide à domicile',
    price: 25,
    estimatedDays: '1-2'
  },
  {
    id: 'relay',
    name: 'Point relais',
    description: 'Retrait en point relais proche de chez vous',
    price: 8,
    estimatedDays: '2-4'
  }
])

// Computed
const selectedDeliveryOption = computed(() => {
  return deliveryOptions.value.find(opt => opt.id === checkoutData.value.deliveryOption)
})

const deliveryPrice = computed(() => {
  if (cartStore.totalAmount >= 500) return 0
  return selectedDeliveryOption.value?.price || 0
})

const taxAmount = computed(() => {
  return (cartStore.totalAmount + deliveryPrice.value) * 0.2
})

const orderTotal = computed(() => {
  return cartStore.totalAmount + deliveryPrice.value
})

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatCardNumber = () => {
  cardNumber.value = cardNumber.value
    .replace(/\s/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim()
}

const formatExpiryDate = () => {
  expiryDate.value = expiryDate.value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 5)
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitOrder = async () => {
  try {
    isProcessing.value = true
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: Implement actual order submission with Stripe
    const orderData = {
      items: cartStore.cart?.items,
      deliveryAddress: {
        firstName: checkoutData.value.firstName,
        lastName: checkoutData.value.lastName,
        address: checkoutData.value.address,
        addressComplement: checkoutData.value.addressComplement,
        postalCode: checkoutData.value.postalCode,
        city: checkoutData.value.city,
        phone: checkoutData.value.phone
      },
      deliveryOption: checkoutData.value.deliveryOption,
      paymentMethod: checkoutData.value.paymentMethod,
      total: orderTotal.value
    }
    
    // For now, just redirect to confirmation
    toast.success('Commande confirmée!')
    
    // Clear cart
    cartStore.clearCart()
    
    // Redirect to confirmation page
    router.push('/order-confirmation/123456')
    
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors du traitement de la commande')
  } finally {
    isProcessing.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Load user data on mount
onMounted(async () => {
  // Ensure cart is loaded
  if (!cartStore.cart || cartStore.itemCount === 0) {
    toast.warning('Votre panier est vide')
    router.push('/cart')
    return
  }
  
  // Pre-fill with user data if available
  if (authStore.user) {
    checkoutData.value.firstName = authStore.user.firstName || ''
    checkoutData.value.lastName = authStore.user.lastName || ''
    checkoutData.value.phone = authStore.user.phone || ''
  }
})
</script>