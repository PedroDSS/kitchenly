<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Search and Filters Section -->
    <section class="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Filters Sidebar -->
          <div class="lg:col-span-1">
            <SearchBar
              :facets="searchFacets"
              :placeholder="'Rechercher des produits...'"
              :suggestions="['Réfrigérateur Samsung', 'Lave-vaisselle Bosch', 'Four Miele']"
              @search="handleSearch"
              @filters-change="handleFiltersChange"
              @clear="handleClearSearch"
            />
          </div>
          
          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- Sort and View Options -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ searchQuery ? `Résultats pour "${searchQuery}"` : 'Nos produits' }}
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({{ productsStore.totalProducts }} produits)
                </span>
              </h2>
              
              <select
                v-model="sortBy"
                @change="handleSortChange"
                class="form-input w-auto text-sm"
              >
                <option value="">Trier par</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name_asc">Nom A-Z</option>
                <option value="name_desc">Nom Z-A</option>
                <option value="newest">Nouveautés</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Grid -->
    <section id="products" class="py-12">
      <div class="container">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Mobile filters already in search section above -->
          
          <!-- Products -->
          <div class="lg:col-span-3 lg:col-start-2">
            <!-- Loading State -->
            <div v-if="productsStore.isLoading || productsStore.searchLoading" class="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
            
            <!-- Empty State -->
            <div v-else-if="productsStore.products.length === 0" class="text-center py-12">
              <ShoppingBagIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button @click="handleClearSearch" class="btn btn-primary">
                Réinitialiser les filtres
              </button>
            </div>
            
            <!-- Products Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCard
                v-for="product in productsStore.products"
                :key="product.id"
                :product="product"
                @add-to-cart="handleAddToCart"
                @click="navigateToProduct(product.id)"
              />
            </div>
            
            <!-- Pagination -->
            <div v-if="productsStore.totalPages > 1" class="mt-8 flex justify-center">
              <nav class="flex items-center space-x-2">
                <button
                  @click="productsStore.prevPage"
                  :disabled="!productsStore.hasPrevPage"
                  class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon class="w-5 h-5" />
                </button>
                
                <span class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {{ productsStore.currentPage }} sur {{ productsStore.totalPages }}
                </span>
                
                <button
                  @click="productsStore.nextPage"
                  :disabled="!productsStore.hasNextPage"
                  class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon class="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { 
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from '@heroicons/vue/24/outline'
import type { SearchFacet } from '@/components/SearchBar.vue'
import { toast } from '@/utils/toast'

const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const sortBy = ref('')
const currentFilters = ref<Record<string, any>>({})

// Computed facets from search results
const searchFacets = computed<SearchFacet[]>(() => {
  const facets: SearchFacet[] = []
  
  // Categories facet
  if (productsStore.searchFacets.categories?.length > 0) {
    facets.push({
      key: 'categoryId',
      label: 'Catégories',
      type: 'checkbox',
      options: productsStore.searchFacets.categories.map((cat: any) => ({
        value: cat.id,
        label: cat.name,
        count: cat.count
      }))
    })
  }
  
  // Brands facet
  if (productsStore.searchFacets.brands?.length > 0) {
    facets.push({
      key: 'brandId',
      label: 'Marques',
      type: 'checkbox',
      options: productsStore.searchFacets.brands.map((brand: any) => ({
        value: brand.id,
        label: brand.name,
        count: brand.count
      }))
    })
  }
  
  // Price range facet
  if (productsStore.searchFacets.priceRange) {
    facets.push({
      key: 'price',
      label: 'Prix (€)',
      type: 'range'
    })
  }
  
  // In stock facet
  facets.push({
    key: 'inStock',
    label: 'Disponibilité',
    type: 'radio',
    options: [
      { value: '', label: 'Tous les produits' },
      { value: 'true', label: 'En stock uniquement' }
    ]
  })
  
  return facets
})

// Actions
const handleSearch = async (query: string, filters: Record<string, any>) => {
  searchQuery.value = query
  currentFilters.value = filters
  
  if (query) {
    await productsStore.searchProducts(query, filters)
  } else {
    await productsStore.fetchProducts(filters)
  }
}

const handleFiltersChange = async (filters: Record<string, any>) => {
  currentFilters.value = filters
  
  if (searchQuery.value) {
    await productsStore.searchProducts(searchQuery.value, filters)
  } else {
    await productsStore.fetchProducts(filters)
  }
}

const handleClearSearch = async () => {
  searchQuery.value = ''
  currentFilters.value = {}
  sortBy.value = ''
  productsStore.clearSearch()
  await productsStore.fetchProducts()
}

const handleSortChange = async () => {
  const filters = { ...currentFilters.value }
  
  // Parse sort value
  if (sortBy.value) {
    const [field, order] = sortBy.value.split('_')
    filters.sortBy = field
    filters.sortOrder = order
  } else {
    delete filters.sortBy
    delete filters.sortOrder
  }
  
  currentFilters.value = filters
  
  if (searchQuery.value) {
    await productsStore.searchProducts(searchQuery.value, filters)
  } else {
    await productsStore.fetchProducts(filters)
  }
}

const handleAddToCart = async (productId: string) => {
  try {
    if (!authStore.isAuthenticated) {
      toast.warning('Veuillez vous connecter pour ajouter au panier')
      router.push('/login')
      return
    }
    
    await cartStore.addToCart(productId)
    toast.success('Produit ajouté au panier')
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'ajout au panier')
  }
}

const navigateToProduct = (productId: string) => {
  router.push(`/products/${productId}`)
}


// Load initial data
onMounted(async () => {
  // Load products
  await productsStore.fetchProducts()
  
  // Load categories and brands for facets
  await Promise.all([
    productsStore.fetchCategories(),
    productsStore.fetchBrands()
  ])
  
  // Load cart if authenticated
  if (authStore.isAuthenticated) {
    await cartStore.fetchCart()
  }
})

// Watch for auth changes to load cart
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await cartStore.fetchCart()
  } else {
    cartStore.clearCart()
  }
})
</script>