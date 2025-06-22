<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Cart Content -->
    <div class="container py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mon panier</h1>

      <!-- Loading State -->
      <div v-if="cartStore.isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!cartStore.hasItems" class="text-center py-12">
        <ShoppingCartIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Votre panier est vide</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Découvrez nos produits et ajoutez vos articles préférés
        </p>
        <router-link to="/" class="btn btn-primary">
          Continuer mes achats
        </router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Items List -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Reservation Timer Alert -->
          <div v-if="cartStore.reservationTimeLeft > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-center">
              <ClockIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p class="text-sm text-yellow-800 dark:text-yellow-200">
                Vos articles sont réservés pendant 
                <span class="font-bold">{{ cartStore.formatTimeLeft(cartStore.reservationTimeLeft) }}</span>
              </p>
            </div>
          </div>

          <!-- Cart Items -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="item in cartStore.cart?.items" :key="item.id" class="p-6">
              <div class="flex items-start space-x-4">
                <!-- Product Image -->
                <div class="w-20 h-20 flex-shrink-0">
                  <img 
                    v-if="item.product.images?.[0]"
                    :src="item.product.images[0]"
                    :alt="item.product.name"
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <div v-else class="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <PhotoIcon class="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <!-- Product Info -->
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                    <router-link :to="`/products/${item.product.id}`" class="hover:text-primary-600 dark:hover:text-primary-400">
                      {{ item.product.name }}
                    </router-link>
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {{ item.product.brand?.name }}
                  </p>
                  
                  <!-- Quantity and Actions -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="updateQuantity(item.id, item.quantity - 1)"
                        :disabled="item.quantity <= 1 || isUpdating[item.id]"
                        class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusIcon class="w-4 h-4" />
                      </button>
                      <span class="w-12 text-center font-medium text-gray-900 dark:text-white">
                        {{ item.quantity }}
                      </span>
                      <button
                        @click="updateQuantity(item.id, item.quantity + 1)"
                        :disabled="item.quantity >= item.product.stock || isUpdating[item.id]"
                        class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon class="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      @click="removeItem(item.id)"
                      :disabled="isRemoving[item.id]"
                      class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>

                  <!-- Stock Warning -->
                  <p v-if="item.quantity === item.product.stock" class="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    Stock maximum atteint
                  </p>
                </div>

                <!-- Price -->
                <div class="text-right">
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ formatPrice(item.product.price * item.quantity) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatPrice(item.product.price) }} / unité
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Promo Code -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Code promo</h3>
            <div class="flex space-x-2">
              <input
                v-model="promoCode"
                type="text"
                placeholder="Entrer un code promo"
                class="form-input flex-1"
                :disabled="!!appliedPromoCode"
              />
              <button
                v-if="!appliedPromoCode"
                @click="applyPromoCode"
                :disabled="!promoCode || isApplyingPromo"
                class="btn btn-secondary disabled:opacity-50"
              >
                Appliquer
              </button>
              <button
                v-else
                @click="removePromoCode"
                class="btn btn-outline"
              >
                Retirer
              </button>
            </div>
            <p v-if="appliedPromoCode" class="text-sm text-green-600 dark:text-green-400 mt-2">
              Code promo "{{ appliedPromoCode }}" appliqué (-{{ promoDiscount }}%)
            </p>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Récapitulatif
            </h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(subtotal) }}
                </span>
              </div>

              <div v-if="promoDiscount > 0" class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Remise promo</span>
                <span class="font-medium text-green-600 dark:text-green-400">
                  -{{ formatPrice(discountAmount) }}
                </span>
              </div>

              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(taxAmount) }}
                </span>
              </div>

              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Livraison</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ total >= 500 ? 'Gratuite' : formatPrice(shippingCost) }}
                </span>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div class="flex justify-between">
                  <span class="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {{ formatPrice(total) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <router-link
                to="/checkout"
                class="btn btn-primary btn-lg w-full"
                :class="{ 'opacity-50 cursor-not-allowed': !authStore.isAuthenticated }"
              >
                Procéder au paiement
              </router-link>

              <p v-if="!authStore.isAuthenticated" class="text-xs text-center text-gray-500 dark:text-gray-400">
                Veuillez vous 
                <router-link to="/login" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  connecter
                </router-link> 
                pour finaliser votre commande
              </p>

              <router-link to="/" class="btn btn-outline w-full">
                Continuer mes achats
              </router-link>
            </div>

            <!-- Trust Badges -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <LockClosedIcon class="w-4 h-4 mr-2" />
                Paiement sécurisé
              </div>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheckIcon class="w-4 h-4 mr-2" />
                Garantie satisfaction
              </div>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TruckIcon class="w-4 h-4 mr-2" />
                Livraison rapide
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { 
  ShoppingCartIcon,
  PhotoIcon,
  ClockIcon,
  MinusIcon,
  PlusIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/vue/24/outline'
import { toast } from '@/utils/toast'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// State
const promoCode = ref('')
const appliedPromoCode = ref('')
const promoDiscount = ref(0)
const isApplyingPromo = ref(false)
const isUpdating = ref<Record<string, boolean>>({})
const isRemoving = ref<Record<string, boolean>>({})

// Constants
const shippingCost = 15
const freeShippingThreshold = 500

// Computed
const subtotal = computed(() => cartStore.totalAmount)

const discountAmount = computed(() => {
  return subtotal.value * (promoDiscount.value / 100)
})

const taxAmount = computed(() => {
  return (subtotal.value - discountAmount.value) * 0.2
})

const total = computed(() => {
  const afterDiscount = subtotal.value - discountAmount.value
  const shipping = afterDiscount >= freeShippingThreshold ? 0 : shippingCost
  return afterDiscount + shipping
})

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const updateQuantity = async (itemId: string, newQuantity: number) => {
  if (newQuantity < 1) return
  
  try {
    isUpdating.value[itemId] = true
    await cartStore.updateCartItem(itemId, newQuantity)
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la mise à jour')
  } finally {
    isUpdating.value[itemId] = false
  }
}

const removeItem = async (itemId: string) => {
  try {
    isRemoving.value[itemId] = true
    await cartStore.removeFromCart(itemId)
    toast.success('Article retiré du panier')
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la suppression')
  } finally {
    isRemoving.value[itemId] = false
  }
}

const applyPromoCode = async () => {
  if (!promoCode.value) return
  
  try {
    isApplyingPromo.value = true
    // TODO: Validate promo code with backend
    // For now, simulate a valid promo code
    if (promoCode.value.toUpperCase() === 'WELCOME10') {
      appliedPromoCode.value = promoCode.value
      promoDiscount.value = 10
      toast.success('Code promo appliqué avec succès')
    } else {
      toast.error('Code promo invalide')
    }
  } finally {
    isApplyingPromo.value = false
  }
}

const removePromoCode = () => {
  appliedPromoCode.value = ''
  promoDiscount.value = 0
  promoCode.value = ''
  toast.info('Code promo retiré')
}

const logout = async () => {
  await authStore.logout()
  toast.success('Déconnexion réussie')
  router.push('/')
}

// Load cart on mount
onMounted(async () => {
  if (!cartStore.cart) {
    await cartStore.fetchCart()
  }
})

// Cleanup timer on unmount
onUnmounted(() => {
  // Timer is managed in the store
})
</script>