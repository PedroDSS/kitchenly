<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="container">
        <div class="flex items-center justify-between py-4">
          <router-link to="/" class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kitchenly</h1>
            <span class="text-sm text-gray-500 dark:text-gray-400">Commande confirmée</span>
          </router-link>
          
          <nav class="flex items-center space-x-4">
            <router-link to="/orders" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Mes commandes
            </router-link>
            <router-link to="/profile" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Mon compte
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Confirmation Content -->
    <div class="container py-12">
      <div class="max-w-3xl mx-auto">
        <!-- Success Message -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center mb-8">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon class="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Merci pour votre commande !
          </h1>
          
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Votre commande #{{ orderId }} a été confirmée avec succès
          </p>
          
          <div class="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Date: {{ formatDate(new Date()) }}</span>
            <span>•</span>
            <span>Montant: {{ formatPrice(orderTotal) }}</span>
          </div>
        </div>

        <!-- Order Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Delivery Information -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TruckIcon class="w-5 h-5 mr-2" />
              Informations de livraison
            </h2>
            
            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse de livraison</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ deliveryAddress.firstName }} {{ deliveryAddress.lastName }}<br>
                  {{ deliveryAddress.address }}<br>
                  {{ deliveryAddress.addressComplement }}<br v-if="deliveryAddress.addressComplement">
                  {{ deliveryAddress.postalCode }} {{ deliveryAddress.city }}<br>
                  Tél: {{ deliveryAddress.phone }}
                </p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Mode de livraison</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ deliveryMethod }}<br>
                  Livraison estimée: {{ estimatedDelivery }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCardIcon class="w-5 h-5 mr-2" />
              Informations de paiement
            </h2>
            
            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de paiement</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ paymentMethod === 'card' ? 'Carte bancaire' : 'PayPal' }}
                </p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Statut du paiement</h3>
                <div class="flex items-center mt-1">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">Paiement accepté</span>
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Facture</h3>
                <button class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mt-1">
                  Télécharger la facture (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Articles commandés
          </h2>
          
          <div class="space-y-4">
            <div v-for="item in orderItems" :key="item.id" class="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
              <div class="w-16 h-16 flex-shrink-0">
                <img 
                  v-if="item.product.image"
                  :src="item.product.image"
                  :alt="item.product.name"
                  class="w-full h-full object-cover rounded"
                />
                <div v-else class="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <PhotoIcon class="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ item.product.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Quantité: {{ item.quantity }} × {{ formatPrice(item.unitPrice) }}
                </p>
              </div>
              
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatPrice(item.quantity * item.unitPrice) }}
              </span>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Sous-total</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Livraison</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(shippingCost) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">TVA (20%)</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(taxAmount) }}</span>
            </div>
            <div class="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-gray-900 dark:text-white">Total</span>
              <span class="text-primary-600 dark:text-primary-400">{{ formatPrice(orderTotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Prochaines étapes
          </h3>
          <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li class="flex items-start">
              <CheckIcon class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Vous recevrez un email de confirmation dans quelques minutes</span>
            </li>
            <li class="flex items-start">
              <CheckIcon class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Vous serez notifié par email lors de l'expédition de votre commande</span>
            </li>
            <li class="flex items-start">
              <CheckIcon class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Vous pouvez suivre votre commande dans la section "Mes commandes"</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/orders" class="btn btn-primary">
            Voir mes commandes
          </router-link>
          <router-link to="/" class="btn btn-outline">
            Continuer mes achats
          </router-link>
        </div>

        <!-- Customer Service -->
        <div class="text-center mt-12 text-sm text-gray-600 dark:text-gray-400">
          <p>Des questions sur votre commande ?</p>
          <p class="mt-1">
            Contactez notre service client au 
            <a href="tel:0123456789" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              01 23 45 67 89
            </a>
            ou par email à 
            <a href="mailto:contact.kitchenly@gmail.com" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              contact.kitchenly@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
import { 
  CheckCircleIcon,
  TruckIcon,
  CreditCardIcon,
  PhotoIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import { toast } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Mock order data (in a real app, this would come from the API)
const orderId = ref(route.params.orderId as string)
const orderTotal = ref(1234.50)
const subtotal = ref(1000)
const shippingCost = ref(15)
const taxAmount = ref(219.50)
const paymentMethod = ref('card')
const deliveryMethod = ref('Livraison standard')
const estimatedDelivery = ref('3-5 jours ouvrés')

const deliveryAddress = ref({
  firstName: 'Jean',
  lastName: 'Dupont',
  address: '123 rue de la Paix',
  addressComplement: 'Appartement 4B',
  postalCode: '75001',
  city: 'Paris',
  phone: '06 12 34 56 78'
})

const orderItems = ref([
  {
    id: '1',
    product: {
      name: 'Réfrigérateur Samsung 300L',
      image: null
    },
    quantity: 1,
    unitPrice: 599
  },
  {
    id: '2',
    product: {
      name: 'Micro-ondes Whirlpool 25L',
      image: null
    },
    quantity: 2,
    unitPrice: 149
  },
  {
    id: '3',
    product: {
      name: 'Grille-pain Philips',
      image: null
    },
    quantity: 1,
    unitPrice: 89
  }
])

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Load order data on mount
onMounted(async () => {
  // In a real app, fetch order details from API
  // For now, we're using mock data
  
  // Show a success notification
  toast.success('Votre commande a été confirmée avec succès!')
})
</script>