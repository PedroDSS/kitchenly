<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestion des produits</h1>
            <p class="mt-1 text-sm text-gray-500">Gérez votre catalogue de produits</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau produit
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Filters -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Recherche</label>
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Nom du produit..."
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Catégorie</label>
              <select
                v-model="filters.categoryId"
                @change="applyFilters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Marque</label>
              <select
                v-model="filters.brandId"
                @change="applyFilters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Toutes les marques</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Stock</label>
              <select
                v-model="filters.stockStatus"
                @change="applyFilters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Tous</option>
                <option value="low">Stock faible (< 10)</option>
                <option value="out">Rupture de stock</option>
                <option value="available">En stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <DataTable
            :data="products"
            :columns="columns"
            :loading="isLoading"
            :total-items="totalProducts"
            :current-page="currentPage"
            :page-size="pageSize"
            @page-change="handlePageChange"
            @sort="handleSort"
            show-actions
          >
            <template #image="{ item }">
              <img 
                v-if="item.images?.[0]"
                :src="item.images[0]"
                :alt="item.name"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <div v-else class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </template>

            <template #name="{ item }">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                <div class="text-sm text-gray-500">{{ getBrandName(item.brandId) }}</div>
              </div>
            </template>

            <template #category="{ item }">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ getCategoryName(item.categoryId) }}
              </span>
            </template>

            <template #price="{ item }">
              <div class="text-sm font-medium text-gray-900">
                {{ formatCurrency(item.price) }}
              </div>
            </template>

            <template #stock="{ item }">
              <span 
                :class="getStockBadgeClass(item.stock)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ item.stock }} unités
              </span>
            </template>

            <template #actions="{ item }">
              <div class="flex items-center space-x-2">
                <button
                  @click="editProduct(item)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Modifier
                </button>
                <ConfirmButton
                  @confirm="deleteProduct(item.id)"
                  button-text="Supprimer"
                  confirm-title="Confirmer la suppression"
                  :confirm-message="`Êtes-vous sûr de vouloir supprimer le produit '${item.name}' ?`"
                  button-class="text-red-600 hover:text-red-900 text-sm font-medium"
                  :loading="isDeleting === item.id"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="submitProduct">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="w-full mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ showCreateModal ? 'Nouveau produit' : 'Modifier le produit' }}
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Nom *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        v-model="form.description"
                        rows="3"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Prix (€) *</label>
                        <input
                          v-model.number="form.price"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700">Stock *</label>
                        <input
                          v-model.number="form.stock"
                          type="number"
                          min="0"
                          required
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Catégorie *</label>
                        <select
                          v-model="form.categoryId"
                          required
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Sélectionner une catégorie</option>
                          <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700">Marque *</label>
                        <select
                          v-model="form.brandId"
                          required
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Sélectionner une marque</option>
                          <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                            {{ brand.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Images (URLs, une par ligne)</label>
                      <textarea
                        v-model="imageUrls"
                        rows="3"
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>

                    <div class="flex items-center">
                      <input
                        v-model="form.active"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label class="ml-2 block text-sm text-gray-900">
                        Produit actif
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                <LoadingSpinner v-if="isSubmitting" class="w-4 h-4 mr-2" />
                {{ showCreateModal ? 'Créer' : 'Modifier' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useAdminStore } from '@/stores/admin'
import { useToast } from '@/composables/useToast'
import DataTable from '@/components/DataTable.vue'
import ConfirmButton from '@/components/ConfirmButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Product } from '@/types'

const productsStore = useProductsStore()
const adminStore = useAdminStore()
const { showToast } = useToast()

// State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref<string | null>(null)
const searchQuery = ref('')
const filters = ref({
  categoryId: '',
  brandId: '',
  stockStatus: ''
})

// Form
const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  brandId: '',
  active: true
})

const imageUrls = ref('')
const editingProduct = ref<Product | null>(null)

// Computed
const { products, categories, brands, isLoading, totalProducts, currentPage, pageSize } = productsStore
const { getCategoryName, getBrandName } = productsStore

const columns = [
  { key: 'image', label: 'Image', sortable: false },
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: false },
  { key: 'price', label: 'Prix', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true },
  { key: 'active', label: 'Statut', sortable: true }
]

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const getStockBadgeClass = (stock: number) => {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock < 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      applyFilters()
    }, 500)
  }
})()

const applyFilters = async () => {
  const filterParams = {
    ...filters.value,
    search: searchQuery.value
  }
  
  // Convert stock status to appropriate filter
  if (filters.value.stockStatus === 'low') {
    filterParams.maxStock = 9
  } else if (filters.value.stockStatus === 'out') {
    filterParams.maxStock = 0
  } else if (filters.value.stockStatus === 'available') {
    filterParams.minStock = 1
  }
  
  delete filterParams.stockStatus
  
  await productsStore.fetchProducts(filterParams)
}

const handlePageChange = (page: number) => {
  productsStore.goToPage(page)
}

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  const sortFilters = {
    ...filters.value,
    search: searchQuery.value,
    sortBy: column,
    sortOrder: direction
  }
  productsStore.fetchProducts(sortFilters)
}

const editProduct = (product: Product) => {
  editingProduct.value = product
  form.value = {
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    brandId: product.brandId,
    active: product.active
  }
  imageUrls.value = product.images?.join('\n') || ''
  showEditModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingProduct.value = null
  form.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    brandId: '',
    active: true
  }
  imageUrls.value = ''
}

const submitProduct = async () => {
  try {
    isSubmitting.value = true
    
    const productData = {
      ...form.value,
      images: imageUrls.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
    }

    if (showEditModal.value && editingProduct.value) {
      await adminStore.updateProduct(editingProduct.value.id, productData)
      showToast('Produit modifié avec succès', 'success')
    } else {
      await adminStore.createProduct(productData)
      showToast('Produit créé avec succès', 'success')
    }

    closeModal()
    await applyFilters()
  } catch (error: any) {
    showToast(error.message || 'Une erreur est survenue', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const deleteProduct = async (productId: string) => {
  try {
    isDeleting.value = productId
    await adminStore.deleteProduct(productId)
    showToast('Produit supprimé avec succès', 'success')
    await applyFilters()
  } catch (error: any) {
    showToast(error.message || 'Erreur lors de la suppression', 'error')
  } finally {
    isDeleting.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    productsStore.fetchCategories(),
    productsStore.fetchBrands()
  ])
})
</script>