<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Codes Promo</h1>
        <p class="mt-2 text-gray-600">Créez et gérez les codes de réduction</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Codes Actifs</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
            </div>
            <TicketIcon class="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Utilisations Totales</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalUses }}</p>
            </div>
            <ChartBarIcon class="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Réductions Accordées</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalDiscount) }}</p>
            </div>
            <CurrencyEuroIcon class="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Taux de Conversion</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.conversionRate }}%</p>
            </div>
            <ChartPieIcon class="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Code, description..."
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="debouncedFetch"
            />
          </div>

          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="filters.status"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @change="fetchPromoCodes"
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="expired">Expiré</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="filters.type"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @change="fetchPromoCodes"
            >
              <option value="">Tous</option>
              <option value="percentage">Pourcentage</option>
              <option value="fixed_amount">Montant fixe</option>
            </select>
          </div>

          <button
            @click="showCreateModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon class="h-5 w-5 inline mr-2" />
            Nouveau Code
          </button>
        </div>
      </div>

      <!-- Promo Codes DataTable -->
      <DataTable
        :columns="columns"
        :data="promoCodes"
        :loading="loading"
        :pagination="pagination"
        @sort="handleSort"
        @page-change="goToPage"
        @export="exportData"
      >
        <template #code="{ row }">
          <span class="font-mono text-sm font-bold text-gray-900">{{ row.code }}</span>
        </template>

        <template #description="{ row }">
          <div class="text-sm text-gray-900">{{ row.description }}</div>
          <div v-if="row.Category || row.Product" class="text-xs text-gray-500 mt-1">
            <span v-if="row.Category">Catégorie: {{ row.Category.name }}</span>
            <span v-if="row.Product">Produit: {{ row.Product.name }}</span>
          </div>
        </template>

        <template #type="{ row }">
          <span class="text-sm text-gray-500">
            {{ row.type === 'percentage' ? 'Pourcentage' : 'Montant fixe' }}
          </span>
        </template>

        <template #discount="{ row }">
          <div>
            <span class="text-sm font-medium text-gray-900">
              {{ row.type === 'percentage' ? row.discount + '%' : formatCurrency(row.discount) }}
            </span>
            <div v-if="row.minimumAmount > 0" class="text-xs text-gray-500">
              Min: {{ formatCurrency(row.minimumAmount) }}
            </div>
          </div>
        </template>

        <template #usage="{ row }">
          <span class="text-sm text-gray-500">
            {{ row.usageCount }}
            <span v-if="row.maxUses">/{{ row.maxUses }}</span>
          </span>
        </template>

        <template #validity="{ row }">
          <div class="text-sm text-gray-500">
            <div>Du {{ formatDate(row.validFrom) }}</div>
            <div v-if="row.expiresAt">Au {{ formatDate(row.expiresAt) }}</div>
            <div v-else class="text-green-600">Permanent</div>
          </div>
        </template>

        <template #status="{ row }">
          <span v-if="row.isExpired" class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Expiré
          </span>
          <span v-else-if="!row.isActive" class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Inactif
          </span>
          <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Actif
          </span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center space-x-3">
            <button
              @click="viewPromoDetails(row)"
              class="text-blue-600 hover:text-blue-900"
              title="Voir les détails"
            >
              <ChartBarSquareIcon class="h-5 w-5" />
            </button>
            <button
              @click="editPromo(row)"
              class="text-green-600 hover:text-green-900"
              title="Modifier"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.usageCount === 0"
              @click="deletePromo(row)"
              class="text-red-600 hover:text-red-900"
              title="Supprimer"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModals"></div>
        
        <div class="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            {{ showEditModal ? 'Modifier le Code Promo' : 'Nouveau Code Promo' }}
          </h3>
          
          <form @submit.prevent="savePromo">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  v-model="promoForm.code"
                  type="text"
                  required
                  maxlength="20"
                  :disabled="showEditModal && editingPromo?.usageCount > 0"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
                  placeholder="SUMMER2024"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  v-model="promoForm.type"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed_amount">Montant fixe</option>
                </select>
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  v-model="promoForm.description"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Réduction estivale 2024"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ promoForm.type === 'percentage' ? 'Pourcentage (%)' : 'Montant (€)' }} *
                </label>
                <input
                  v-model.number="promoForm.discount"
                  type="number"
                  required
                  :min="0.01"
                  :max="promoForm.type === 'percentage' ? 100 : undefined"
                  :step="0.01"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum (€)</label>
                <input
                  v-model.number="promoForm.minimumAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Utilisations max</label>
                <input
                  v-model.number="promoForm.maxUses"
                  type="number"
                  min="1"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Illimité"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Utilisations par client</label>
                <input
                  v-model.number="promoForm.maxUsesPerUser"
                  type="number"
                  min="1"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie (optionnel)</label>
                <select
                  v-model="promoForm.categoryId"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Produit (optionnel)</label>
                <select
                  v-model="promoForm.productId"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tous les produits</option>
                  <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                <input
                  v-model="promoForm.validFrom"
                  type="datetime-local"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  v-model="promoForm.expiresAt"
                  type="datetime-local"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div class="col-span-2">
                <label class="flex items-center">
                  <input
                    v-model="promoForm.isActive"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Code actif</span>
                </label>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                @click="closeModals"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Enregistrement...' : showEditModal ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal && selectedPromo" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDetailsModal = false"></div>
        
        <div class="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            Détails du Code Promo - {{ selectedPromo.code }}
          </h3>

          <!-- Analytics Charts -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Utilisation sur 30 jours</h4>
              <canvas ref="usageChart" height="150"></canvas>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Produits les plus vendus</h4>
              <canvas ref="productsChart" height="150"></canvas>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Utilisations totales</p>
              <p class="text-2xl font-bold">{{ selectedPromo.stats?.totalUses || 0 }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Chiffre d'affaires généré</p>
              <p class="text-2xl font-bold">{{ formatCurrency(selectedPromo.stats?.totalRevenue || 0) }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Panier moyen</p>
              <p class="text-2xl font-bold">{{ formatCurrency(selectedPromo.stats?.avgOrderValue || 0) }}</p>
            </div>
          </div>

          <!-- Recent Orders DataTable -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Commandes récentes</h4>
            <DataTable
              :columns="orderColumns"
              :data="selectedPromo.Orders || []"
              :loading="false"
              :show-pagination="false"
            >
              <template #date="{ row }">
                <span class="text-sm text-gray-500">{{ formatDate(row.createdAt) }}</span>
              </template>
              <template #customer="{ row }">
                <span class="text-sm text-gray-900">
                  {{ row.User?.firstName }} {{ row.User?.lastName }}
                </span>
              </template>
              <template #amount="{ row }">
                <span class="text-sm text-gray-900">{{ formatCurrency(row.totalAmount) }}</span>
              </template>
              <template #discount="{ row }">
                <span class="text-sm text-green-600">
                  -{{ calculateDiscountAmount(selectedPromo, row.totalAmount) }}
                </span>
              </template>
            </DataTable>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="showDetailsModal = false"
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
import DataTable from '@/components/DataTable.vue'
import {
  TicketIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  ChartPieIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarSquareIcon
} from '@heroicons/vue/24/outline'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

// DataTable columns
const columns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'description', label: 'Description', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'discount', label: 'Réduction', sortable: true },
  { key: 'usage', label: 'Utilisations', sortable: false },
  { key: 'validity', label: 'Validité', sortable: false },
  { key: 'status', label: 'Statut', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
]

const orderColumns = [
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Client' },
  { key: 'amount', label: 'Montant' },
  { key: 'discount', label: 'Réduction' }
]

// State
const promoCodes = ref([])
const categories = ref([])
const products = ref([])
const loading = ref(false)
const stats = ref({
  active: 0,
  totalUses: 0,
  totalDiscount: 0,
  conversionRate: 0
})
const pagination = ref({
  total: 0,
  pages: 0,
  currentPage: 1,
  perPage: 20
})
const filters = ref({
  search: '',
  status: '',
  type: ''
})
const sortBy = ref('-createdAt')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedPromo = ref(null)
const editingPromo = ref(null)
const isSubmitting = ref(false)

const promoForm = ref({
  code: '',
  description: '',
  type: 'percentage',
  discount: 10,
  minimumAmount: 0,
  maxUses: null,
  maxUsesPerUser: 1,
  categoryId: '',
  productId: '',
  validFrom: new Date().toISOString().slice(0, 16),
  expiresAt: '',
  isActive: true
})

// Chart instances
let usageChart = null
let productsChart = null

// Methods
const fetchPromoCodes = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
      sort: sortBy.value,
      ...filters.value
    }
    
    const response = await api.get('/promo-codes', { params })
    promoCodes.value = response.data.data.promoCodes
    pagination.value = response.data.data.pagination
    
    // Calculate stats
    calculateStats()
  } catch (error) {
    showToast('Erreur lors du chargement des codes promo', 'error')
  } finally {
    loading.value = false
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

const fetchProducts = async () => {
  try {
    const response = await api.get('/products', { params: { limit: 1000 } })
    products.value = response.data.data.products
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const calculateStats = () => {
  const active = promoCodes.value.filter(p => p.isValid).length
  const totalUses = promoCodes.value.reduce((sum, p) => sum + p.usageCount, 0)
  
  // These would need real data from analytics
  stats.value = {
    active,
    totalUses,
    totalDiscount: 5420.50, // Mock value
    conversionRate: 23.5 // Mock value
  }
}

const handleSort = (column) => {
  if (!column.sortable) return
  
  if (sortBy.value === column.key) {
    sortBy.value = `-${column.key}`
  } else if (sortBy.value === `-${column.key}`) {
    sortBy.value = column.key
  } else {
    sortBy.value = column.key
  }
  
  fetchPromoCodes()
}

const savePromo = async () => {
  try {
    isSubmitting.value = true
    
    const data = {
      ...promoForm.value,
      maxUses: promoForm.value.maxUses || null,
      categoryId: promoForm.value.categoryId || null,
      productId: promoForm.value.productId || null,
      expiresAt: promoForm.value.expiresAt || null
    }
    
    if (showEditModal.value) {
      await api.put(`/promo-codes/${editingPromo.value.id}`, data)
      showToast('Code promo modifié avec succès', 'success')
    } else {
      await api.post('/promo-codes', data)
      showToast('Code promo créé avec succès', 'success')
    }
    
    closeModals()
    fetchPromoCodes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const editPromo = (promo) => {
  editingPromo.value = promo
  promoForm.value = {
    code: promo.code,
    description: promo.description,
    type: promo.type,
    discount: promo.discount,
    minimumAmount: promo.minimumAmount || 0,
    maxUses: promo.maxUses,
    maxUsesPerUser: promo.maxUsesPerUser || 1,
    categoryId: promo.categoryId || '',
    productId: promo.productId || '',
    validFrom: new Date(promo.validFrom).toISOString().slice(0, 16),
    expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : '',
    isActive: promo.isActive
  }
  showEditModal.value = true
}

const deletePromo = async (promo) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le code ${promo.code} ?`)) {
    return
  }
  
  try {
    await api.delete(`/promo-codes/${promo.id}`)
    showToast('Code promo supprimé avec succès', 'success')
    fetchPromoCodes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error')
  }
}

const viewPromoDetails = async (promo) => {
  try {
    const [promoResponse, analyticsResponse] = await Promise.all([
      api.get(`/promo-codes/${promo.id}`),
      api.get(`/promo-codes/${promo.id}/analytics`, { params: { period: '30d' } })
    ])
    
    selectedPromo.value = {
      ...promoResponse.data.data.promoCode,
      analytics: analyticsResponse.data.data.analytics
    }
    showDetailsModal.value = true
    
    // Update charts
    setTimeout(() => {
      updateDetailCharts()
    }, 100)
  } catch (error) {
    showToast('Erreur lors du chargement des détails', 'error')
  }
}

const updateDetailCharts = () => {
  if (!selectedPromo.value?.analytics) return
  
  // Usage chart
  if (usageChart) usageChart.destroy()
  
  const usageCtx = document.querySelector('[ref="usageChart"]')
  if (usageCtx) {
    const usageData = selectedPromo.value.analytics.usageByDay || []
    
    usageChart = new Chart(usageCtx, {
      type: 'line',
      data: {
        labels: usageData.map(d => formatDate(d.date)),
        datasets: [{
          label: 'Utilisations',
          data: usageData.map(d => d.uses),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })
  }
  
  // Products chart
  if (productsChart) productsChart.destroy()
  
  const productsCtx = document.querySelector('[ref="productsChart"]')
  if (productsCtx) {
    const productData = selectedPromo.value.analytics.productPerformance || []
    
    productsChart = new Chart(productsCtx, {
      type: 'bar',
      data: {
        labels: productData.slice(0, 5).map(p => p.name.substring(0, 20) + '...'),
        datasets: [{
          label: 'Chiffre d\'affaires',
          data: productData.slice(0, 5).map(p => p.revenue),
          backgroundColor: 'rgba(34, 197, 94, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

const exportData = () => {
  // Create CSV content
  const headers = ['Code', 'Description', 'Type', 'Réduction', 'Utilisations', 'Validité', 'Statut']
  const rows = promoCodes.value.map(p => [
    p.code,
    p.description,
    p.type === 'percentage' ? 'Pourcentage' : 'Montant fixe',
    p.type === 'percentage' ? p.discount + '%' : p.discount,
    p.usageCount + (p.maxUses ? '/' + p.maxUses : ''),
    formatDate(p.validFrom) + (p.expiresAt ? ' - ' + formatDate(p.expiresAt) : ' - Permanent'),
    p.isExpired ? 'Expiré' : (!p.isActive ? 'Inactif' : 'Actif')
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
  a.download = `promo_codes_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingPromo.value = null
  promoForm.value = {
    code: '',
    description: '',
    type: 'percentage',
    discount: 10,
    minimumAmount: 0,
    maxUses: null,
    maxUsesPerUser: 1,
    categoryId: '',
    productId: '',
    validFrom: new Date().toISOString().slice(0, 16),
    expiresAt: '',
    isActive: true
  }
}

const goToPage = (page) => {
  pagination.value.currentPage = page
  fetchPromoCodes()
}

const calculateDiscountAmount = (promo, orderAmount) => {
  if (promo.type === 'percentage') {
    return formatCurrency(orderAmount * (promo.discount / 100))
  }
  return formatCurrency(promo.discount)
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

// Debounced search
let searchTimeout = null
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    fetchPromoCodes()
  }, 300)
}

// Lifecycle
onMounted(() => {
  fetchPromoCodes()
  fetchCategories()
  fetchProducts()
})

// Cleanup
watch(() => showDetailsModal.value, (newVal) => {
  if (!newVal) {
    if (usageChart) {
      usageChart.destroy()
      usageChart = null
    }
    if (productsChart) {
      productsChart.destroy()
      productsChart = null
    }
  }
})
</script>