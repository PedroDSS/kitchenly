<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

    <!-- Breadcrumb -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <router-link to="/" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Accueil
          </router-link>
          <ChevronRightIcon class="w-4 h-4 text-gray-400" />
          <router-link 
            v-if="product?.category"
            :to="`/?categoryId=${product.categoryId}`"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {{ product.category.name }}
          </router-link>
          <ChevronRightIcon v-if="product?.category" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-900 dark:text-white">{{ product?.name }}</span>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="productsStore.isLoading" class="container py-12">
      <div class="flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-12">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Produit introuvable</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
        <router-link to="/" class="btn btn-primary">
          Retour à l'accueil
        </router-link>
      </div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="container py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Product Images -->
        <div class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div class="aspect-square relative">
              <!-- Main Image -->
              <img 
                v-if="selectedImage"
                :src="selectedImage"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <PhotoIcon class="w-24 h-24 text-gray-400" />
              </div>
              
              <!-- Stock Badge -->
              <div 
                v-if="product.stock === 0"
                class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                Rupture de stock
              </div>
              <div 
                v-else-if="product.stock < 5"
                class="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                Stock limité
              </div>
            </div>
          </div>
          
          <!-- Thumbnail Images -->
          <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              @click="selectedImageIndex = index"
              :class="[
                'aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                selectedImageIndex === index 
                  ? 'border-primary-500' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              <img 
                :src="image"
                :alt="`${product.name} - Image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Title and Brand -->
          <div>
            <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{{ product.brand?.name }}</span>
              <span>•</span>
              <span>Réf: {{ product.sku || product.id.slice(0, 8).toUpperCase() }}</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ product.name }}
            </h1>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <StarIcon v-for="i in 5" :key="i" :class="[
                  'w-5 h-5',
                  i <= Math.floor(product.rating || 0) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 dark:text-gray-600'
                ]" />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({{ product.reviewCount || 0 }} avis)
                </span>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {{ formatPrice(product.price) }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">TTC</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Dont {{ formatPrice(product.price * 0.2) }} de TVA
            </p>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p class="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {{ product.description }}
            </p>
          </div>

          <!-- Features -->
          <div v-if="product.features && product.features.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Caractéristiques</h3>
            <ul class="space-y-2">
              <li v-for="(feature, index) in product.features" :key="index" class="flex items-start">
                <CheckIcon class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span class="text-gray-600 dark:text-gray-400">{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Add to Cart -->
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label for="quantity" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantité:
                </label>
                <select 
                  id="quantity"
                  v-model.number="quantity"
                  class="form-input w-20"
                  :disabled="product.stock === 0"
                >
                  <option v-for="i in Math.min(10, product.stock)" :key="i" :value="i">
                    {{ i }}
                  </option>
                </select>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ product.stock }} en stock
              </span>
            </div>

            <div class="flex space-x-4">
              <button
                @click="addToCart"
                :disabled="product.stock === 0 || isAddingToCart"
                class="flex-1 btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon class="w-5 h-5 mr-2" />
                {{ product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier' }}
              </button>
              <button
                @click="toggleWishlist"
                class="btn btn-outline btn-lg"
              >
                <HeartIcon :class="[
                  'w-5 h-5',
                  isInWishlist ? 'fill-current text-red-500' : ''
                ]" />
              </button>
            </div>
          </div>

          <!-- Delivery Info -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
            <div class="flex items-center space-x-2 text-sm">
              <TruckIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-600 dark:text-gray-400">
                Livraison gratuite à partir de 500€
              </span>
            </div>
            <div class="flex items-center space-x-2 text-sm">
              <ArrowPathIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-600 dark:text-gray-400">
                Retours gratuits sous 14 jours
              </span>
            </div>
            <div class="flex items-center space-x-2 text-sm">
              <ShieldCheckIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-600 dark:text-gray-400">
                Garantie constructeur 2 ans
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Produits similaires
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
            @add-to-cart="handleAddToCart"
            @click="navigateToProduct(relatedProduct.id)"
          />
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import CartIcon from '@/components/CartIcon.vue'
import ProductCard from '@/components/ProductCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { 
  ChevronRightIcon,
  PhotoIcon,
  StarIcon,
  CheckIcon,
  ShoppingCartIcon,
  HeartIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'
import { toast } from '@/utils/toast'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

// State
const product = computed(() => productsStore.currentProduct)
const error = ref<string | null>(null)
const quantity = ref(1)
const selectedImageIndex = ref(0)
const isAddingToCart = ref(false)
const isInWishlist = ref(false)
const relatedProducts = ref<Product[]>([])

// Computed
const selectedImage = computed(() => {
  if (!product.value?.images || product.value.images.length === 0) {
    return null
  }
  return product.value.images[selectedImageIndex.value]
})

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    toast.warning('Veuillez vous connecter pour ajouter au panier')
    router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    })
    return
  }

  try {
    isAddingToCart.value = true
    await cartStore.addToCart(product.value!.id, quantity.value)
    toast.success(`${quantity.value} × ${product.value!.name} ajouté au panier`)
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'ajout au panier')
  } finally {
    isAddingToCart.value = false
  }
}

const handleAddToCart = async (productId: string) => {
  if (!authStore.isAuthenticated) {
    toast.warning('Veuillez vous connecter pour ajouter au panier')
    router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    })
    return
  }

  try {
    await cartStore.addToCart(productId)
    toast.success('Produit ajouté au panier')
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'ajout au panier')
  }
}

const toggleWishlist = () => {
  if (!authStore.isAuthenticated) {
    toast.warning('Veuillez vous connecter pour ajouter aux favoris')
    router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    })
    return
  }

  isInWishlist.value = !isInWishlist.value
  toast.success(isInWishlist.value ? 'Ajouté aux favoris' : 'Retiré des favoris')
}

const navigateToProduct = (productId: string) => {
  router.push(`/products/${productId}`)
}

const logout = async () => {
  await authStore.logout()
  toast.success('Déconnexion réussie')
  router.push('/')
}

const loadProduct = async (productId: string) => {
  try {
    error.value = null
    await productsStore.fetchProduct(productId)
    
    // Reset state for new product
    quantity.value = 1
    selectedImageIndex.value = 0
    
    // Load related products
    if (product.value?.categoryId) {
      const response = await productsStore.fetchProducts({
        categoryId: product.value.categoryId,
        limit: 4,
        excludeId: product.value.id
      })
      relatedProducts.value = response.data.filter(p => p.id !== product.value!.id).slice(0, 4)
    }
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger le produit'
  }
}

// Load product on mount and route change
onMounted(() => {
  const productId = route.params.id as string
  loadProduct(productId)
})

watch(() => route.params.id, (newId) => {
  if (newId && route.name === 'ProductDetail') {
    loadProduct(newId as string)
  }
})
</script>