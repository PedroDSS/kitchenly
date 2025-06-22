<template>
  <div
    :class="[
      'bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200',
      isClickable ? 'cursor-pointer' : '',
      customClass
    ]"
    @click="handleClick"
  >
    <!-- Product Image -->
    <div class="relative">
      <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="w-full h-48 object-cover"
          @error="handleImageError"
        />
        <div v-else class="w-full h-48 bg-gray-100 flex items-center justify-center">
          <PhotoIcon class="w-12 h-12 text-gray-400" />
        </div>
      </div>
      
      <!-- Badges -->
      <div class="absolute top-2 left-2 flex flex-col space-y-1">
        <span
          v-if="product.isNew"
          class="inline-flex px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full"
        >
          New
        </span>
        <span
          v-if="product.isOnSale"
          class="inline-flex px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full"
        >
          Sale
        </span>
        <span
          v-if="product.stock === 0"
          class="inline-flex px-2 py-1 text-xs font-semibold text-white bg-gray-600 rounded-full"
        >
          Out of Stock
        </span>
        <span
          v-else-if="product.stock <= lowStockThreshold"
          class="inline-flex px-2 py-1 text-xs font-semibold text-white bg-yellow-600 rounded-full"
        >
          Low Stock
        </span>
      </div>

      <!-- Favorite Button -->
      <button
        v-if="showFavorite"
        @click.stop="toggleFavorite"
        class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
      >
        <HeartIcon
          :class="[
            'w-5 h-5',
            isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
          ]"
        />
      </button>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Brand -->
      <p v-if="product.brand" class="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {{ product.brand }}
      </p>
      
      <!-- Name -->
      <h3 class="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
        {{ product.name }}
      </h3>
      
      <!-- Rating -->
      <div v-if="product.rating && showRating" class="flex items-center mb-2">
        <div class="flex items-center">
          <StarIcon
            v-for="n in 5"
            :key="n"
            :class="[
              'w-4 h-4',
              n <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            ]"
          />
        </div>
        <span class="ml-1 text-xs text-gray-500">
          ({{ product.reviewCount || 0 }})
        </span>
      </div>
      
      <!-- Price -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <span class="text-lg font-bold text-gray-900">
            {{ formatPrice(finalPrice) }}
          </span>
          <span
            v-if="product.originalPrice && product.originalPrice > finalPrice"
            class="text-sm text-gray-500 line-through"
          >
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        <span
          v-if="discountPercentage > 0"
          class="text-sm font-medium text-red-600"
        >
          -{{ discountPercentage }}%
        </span>
      </div>
      
      <!-- Description -->
      <p v-if="product.description && showDescription" class="text-xs text-gray-600 mb-3 line-clamp-2">
        {{ product.description }}
      </p>
      
      <!-- Quick Info -->
      <div v-if="product.features && showFeatures" class="mb-3">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="feature in product.features.slice(0, 3)"
            :key="feature"
            class="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
          >
            {{ feature }}
          </span>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center space-x-2">
        <button
          v-if="showAddToCart"
          @click.stop="addToCart"
          :disabled="product.stock === 0 || isAddingToCart"
          :class="[
            'flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors',
            product.stock === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          ]"
        >
          <LoadingSpinner v-if="isAddingToCart" size="sm" variant="white" customClass="mr-2" />
          <ShoppingCartIcon v-else class="w-4 h-4 mr-1" />
          {{ product.stock === 0 ? 'Plus de stock' : 'Ajouter au panier' }}
        </button>
        
        <button
          v-if="showQuickView"
          @click.stop="openQuickView"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <EyeIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  PhotoIcon,
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from './LoadingSpinner.vue'

export interface Product {
  id: string | number
  name: string
  description?: string
  image?: string
  brand?: string
  price: number
  originalPrice?: number
  stock: number
  rating?: number
  reviewCount?: number
  features?: string[]
  isNew?: boolean
  isOnSale?: boolean
  category?: string
}

export interface ProductCardProps {
  product: Product
  showFavorite?: boolean
  showRating?: boolean
  showDescription?: boolean
  showFeatures?: boolean
  showAddToCart?: boolean
  showQuickView?: boolean
  isClickable?: boolean
  lowStockThreshold?: number
  customClass?: string
  currency?: string
  isFavorite?: boolean
}

const props = withDefaults(defineProps<ProductCardProps>(), {
  showFavorite: true,
  showRating: true,
  showDescription: true,
  showFeatures: true,
  showAddToCart: true,
  showQuickView: false,
  isClickable: true,
  lowStockThreshold: 5,
  customClass: '',
  currency: '€',
  isFavorite: false
})

const emit = defineEmits<{
  click: [product: Product]
  addToCart: [product: Product]
  toggleFavorite: [product: Product, isFavorite: boolean]
  quickView: [product: Product]
}>()

// State
const isAddingToCart = ref(false)

// Computed properties
const finalPrice = computed(() => {
  return props.product.originalPrice && props.product.originalPrice > props.product.price
    ? props.product.price
    : props.product.price
})

const discountPercentage = computed(() => {
  if (!props.product.originalPrice || props.product.originalPrice <= props.product.price) {
    return 0
  }
  return Math.round(((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100)
})

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const handleClick = () => {
  if (props.isClickable) {
    emit('click', props.product)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const addToCart = async () => {
  if (props.product.stock === 0) return
  
  try {
    isAddingToCart.value = true
    emit('addToCart', props.product)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('Error adding to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

const toggleFavorite = () => {
  emit('toggleFavorite', props.product, !props.isFavorite)
}

const openQuickView = () => {
  emit('quickView', props.product)
}
</script>

<script lang="ts">
export default {
  name: 'ProductCard'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>