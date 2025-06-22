<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion du Stock</h1>
        <p class="mt-2 text-gray-600">Gérez les stocks, mouvements et alertes</p>
      </div>

      <!-- Stock Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ stockStats.totalProducts }}</p>
            </div>
            <CubeIcon class="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Rupture de Stock</p>
              <p class="text-2xl font-bold text-red-600">{{ stockStats.outOfStock }}</p>
            </div>
            <ExclamationTriangleIcon class="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Faible</p>
              <p class="text-2xl font-bold text-orange-600">{{ stockStats.lowStock }}</p>
            </div>
            <ExclamationCircleIcon class="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Valeur Totale</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stockStats.totalValue) }}</p>
            </div>
            <CurrencyEuroIcon class="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <!-- Stock Evolution Chart -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Évolution du Stock (30 derniers jours)</h2>
        <canvas ref="stockChart" height="100"></canvas>
      </div>

      <!-- Filters and Actions -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nom, SKU..."
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="debouncedFetch"
            />
          </div>

          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              v-model="filters.category"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @change="fetchStockData"
            >
              <option value="">Toutes</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">État du Stock</label>
            <select
              v-model="filters.stockStatus"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @change="fetchStockData"
            >
              <option value="">Tous</option>
              <option value="out">Rupture</option>
              <option value="low">Faible</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <button
            @click="showMovementModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon class="h-5 w-5 inline mr-2" />
            Nouveau Mouvement
          </button>

          <button
            @click="exportStock"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon class="h-5 w-5 inline mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seuil d'Alerte
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix Unitaire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière MAJ
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id" :class="getRowClass(product)">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.sku }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStockClass(product.stock)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                  v-model.number="product.alertThreshold"
                  type="number"
                  min="0"
                  class="w-16 rounded-md border-gray-300 text-sm"
                  @change="updateAlertThreshold(product)"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatCurrency(product.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatCurrency(product.stock * product.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(product.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="showProductHistory(product)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <ClockIcon class="h-5 w-5" />
                </button>
                <button
                  @click="adjustStock(product)"
                  class="text-green-600 hover:text-green-900"
                >
                  <AdjustmentsHorizontalIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Affichage de {{ (pagination.currentPage - 1) * pagination.perPage + 1 }} à 
            {{ Math.min(pagination.currentPage * pagination.perPage, pagination.total) }} sur 
            {{ pagination.total }} résultats
          </div>
          <div class="flex gap-2">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-md text-sm',
                page === pagination.currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Movements -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Mouvements Récents</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movement in recentMovements" :key="movement.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(movement.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.Product?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getMovementTypeClass(movement.type)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getMovementTypeLabel(movement.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.reason }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.User?.firstName }} {{ movement.User?.lastName }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Stock Movement Modal -->
    <div v-if="showMovementModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeMovementModal"></div>
        
        <div class="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">Nouveau Mouvement de Stock</h3>
          
          <form @submit.prevent="submitMovement">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                <select
                  v-model="movementForm.productId"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un produit</option>
                  <option v-for="product in allProducts" :key="product.id" :value="product.id">
                    {{ product.name }} (Stock: {{ product.stock }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type de Mouvement</label>
                <select
                  v-model="movementForm.type"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="purchase">Achat/Réception</option>
                  <option value="sale">Vente</option>
                  <option value="return">Retour Client</option>
                  <option value="adjustment">Ajustement</option>
                  <option value="damage">Dommage</option>
                  <option value="loss">Perte/Vol</option>
                  <option value="transfer">Transfert</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  v-model.number="movementForm.quantity"
                  type="number"
                  required
                  min="1"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p class="mt-1 text-sm text-gray-500">
                  {{ movementForm.type === 'sale' || movementForm.type === 'damage' || movementForm.type === 'loss' ? 'Sera soustrait du stock' : 'Sera ajouté au stock' }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                <textarea
                  v-model="movementForm.reason"
                  required
                  rows="3"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Expliquez la raison de ce mouvement..."
                ></textarea>
              </div>

              <div v-if="movementForm.type === 'purchase'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <input
                  v-model="movementForm.supplier"
                  type="text"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div v-if="movementForm.type === 'purchase'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Numéro de Lot</label>
                <input
                  v-model="movementForm.batchNumber"
                  type="text"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                @click="closeMovementModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Product History Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showHistoryModal = false"></div>
        
        <div class="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            Historique des Mouvements - {{ selectedProduct?.name }}
          </h3>
          
          <div class="mb-4">
            <canvas ref="historyChart" height="80"></canvas>
          </div>

          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Avant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Après
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movement in productHistory" :key="movement.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(movement.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getMovementTypeClass(movement.type)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getMovementTypeLabel(movement.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.previousStock }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {{ movement.newStock }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.reason }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="mt-6 flex justify-end">
            <button
              @click="showHistoryModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CurrencyEuroIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

// State
const products = ref([])
const allProducts = ref([])
const categories = ref([])
const recentMovements = ref([])
const stockStats = ref({
  totalProducts: 0,
  outOfStock: 0,
  lowStock: 0,
  totalValue: 0
})
const pagination = ref({
  total: 0,
  pages: 0,
  currentPage: 1,
  perPage: 20
})
const filters = ref({
  search: '',
  category: '',
  stockStatus: ''
})

const showMovementModal = ref(false)
const showHistoryModal = ref(false)
const selectedProduct = ref(null)
const productHistory = ref([])
const isSubmitting = ref(false)

const movementForm = ref({
  productId: '',
  type: '',
  quantity: 1,
  reason: '',
  supplier: '',
  batchNumber: ''
})

// Chart instances
let stockChart = null
let historyChart = null

// Computed
const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.pages
  const current = pagination.value.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages
})

// Methods
const fetchStockData = async () => {
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
      ...filters.value
    }
    
    const response = await api.get('/admin/stock', { params })
    products.value = response.data.data.products
    recentMovements.value = response.data.data.recentMovements
    pagination.value = response.data.data.pagination
    
    // Calculate stats
    calculateStats()
    
    // Update stock chart
    updateStockChart()
  } catch (error) {
    showToast('Erreur lors du chargement des données de stock', 'error')
  }
}

const fetchAllProducts = async () => {
  try {
    const response = await api.get('/products', { params: { limit: 1000 } })
    allProducts.value = response.data.data.products
  } catch (error) {
    console.error('Error fetching all products:', error)
  }
}

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const calculateStats = () => {
  let totalValue = 0
  let outOfStock = 0
  let lowStock = 0
  
  products.value.forEach(product => {
    totalValue += product.stock * product.price
    if (product.stock === 0) outOfStock++
    else if (product.stock <= (product.alertThreshold || 10)) lowStock++
  })
  
  stockStats.value = {
    totalProducts: pagination.value.total,
    outOfStock,
    lowStock,
    totalValue
  }
}

const updateStockChart = async () => {
  try {
    // Fetch stock evolution data for the last 30 days
    const response = await api.get('/admin/analytics/stock', {
      params: { type: 'stock-evolution', days: 30 }
    })
    
    const data = response.data.data
    
    if (stockChart) {
      stockChart.destroy()
    }
    
    const ctx = document.querySelector('[ref="stockChart"]')
    if (ctx) {
      stockChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Stock Total',
            data: data.totalStock,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }, {
            label: 'Valeur du Stock (€)',
            data: data.stockValue,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.1,
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
              title: {
                display: true,
                text: 'Quantité'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              title: {
                display: true,
                text: 'Valeur (€)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Error updating stock chart:', error)
  }
}

const submitMovement = async () => {
  try {
    isSubmitting.value = true
    
    // Adjust quantity based on movement type
    const outMovements = ['sale', 'damage', 'loss', 'transfer']
    const quantity = outMovements.includes(movementForm.value.type) 
      ? -Math.abs(movementForm.value.quantity)
      : Math.abs(movementForm.value.quantity)
    
    await api.post('/admin/stock/movements', {
      ...movementForm.value,
      quantity
    })
    
    showToast('Mouvement de stock enregistré avec succès', 'success')
    closeMovementModal()
    fetchStockData()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const updateAlertThreshold = async (product) => {
  try {
    await api.put(`/products/${product.id}/alert-threshold`, {
      threshold: product.alertThreshold
    })
    showToast('Seuil d\'alerte mis à jour', 'success')
  } catch (error) {
    showToast('Erreur lors de la mise à jour du seuil', 'error')
  }
}

const showProductHistory = async (product) => {
  try {
    selectedProduct.value = product
    const response = await api.get(`/admin/stock/movements/${product.id}`)
    productHistory.value = response.data.data
    showHistoryModal.value = true
    
    // Update history chart
    setTimeout(() => {
      updateHistoryChart()
    }, 100)
  } catch (error) {
    showToast('Erreur lors du chargement de l\'historique', 'error')
  }
}

const updateHistoryChart = () => {
  if (historyChart) {
    historyChart.destroy()
  }
  
  const ctx = document.querySelector('[ref="historyChart"]')
  if (ctx && productHistory.value.length > 0) {
    const labels = productHistory.value.map(m => formatDate(m.createdAt)).reverse()
    const stockLevels = productHistory.value.map(m => m.newStock).reverse()
    
    historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Niveau de Stock',
          data: stockLevels,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          stepped: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantité en Stock'
            }
          }
        }
      }
    })
  }
}

const adjustStock = (product) => {
  movementForm.value.productId = product.id
  movementForm.value.type = 'adjustment'
  showMovementModal.value = true
}

const exportStock = () => {
  // Create CSV content
  const headers = ['Produit', 'SKU', 'Stock', 'Seuil Alerte', 'Prix', 'Valeur', 'Dernière MAJ']
  const rows = products.value.map(p => [
    p.name,
    p.sku,
    p.stock,
    p.alertThreshold || 10,
    p.price,
    p.stock * p.price,
    formatDate(p.updatedAt)
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stock_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  
  showToast('Export CSV généré', 'success')
}

const closeMovementModal = () => {
  showMovementModal.value = false
  movementForm.value = {
    productId: '',
    type: '',
    quantity: 1,
    reason: '',
    supplier: '',
    batchNumber: ''
  }
}

const goToPage = (page) => {
  if (page !== '...' && page !== pagination.value.currentPage) {
    pagination.value.currentPage = page
    fetchStockData()
  }
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('fr-FR')
}

const getRowClass = (product) => {
  if (product.stock === 0) return 'bg-red-50'
  if (product.stock <= (product.alertThreshold || 10)) return 'bg-orange-50'
  return ''
}

const getStockClass = (stock) => {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock <= 10) return 'bg-orange-100 text-orange-800'
  return 'bg-green-100 text-green-800'
}

const getMovementTypeClass = (type) => {
  const classes = {
    purchase: 'bg-blue-100 text-blue-800',
    sale: 'bg-green-100 text-green-800',
    return: 'bg-purple-100 text-purple-800',
    adjustment: 'bg-gray-100 text-gray-800',
    damage: 'bg-red-100 text-red-800',
    loss: 'bg-red-100 text-red-800',
    transfer: 'bg-indigo-100 text-indigo-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getMovementTypeLabel = (type) => {
  const labels = {
    purchase: 'Achat',
    sale: 'Vente',
    return: 'Retour',
    adjustment: 'Ajustement',
    damage: 'Dommage',
    loss: 'Perte',
    transfer: 'Transfert'
  }
  return labels[type] || type
}

// Debounced search
let searchTimeout = null
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    fetchStockData()
  }, 300)
}

// Lifecycle
onMounted(() => {
  // Check if user has the right role
  const userRole = authStore.user?.role
  if (!['ROLE_ADMIN', 'ROLE_STORE_KEEPER'].includes(userRole)) {
    router.push('/admin/dashboard')
    return
  }
  
  fetchStockData()
  fetchAllProducts()
  fetchCategories()
})

// Cleanup
watch(() => showHistoryModal.value, (newVal) => {
  if (!newVal && historyChart) {
    historyChart.destroy()
    historyChart = null
  }
})
</script>