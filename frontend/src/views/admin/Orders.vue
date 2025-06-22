<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
            <p class="mt-1 text-sm text-gray-500">Gérez et suivez toutes les commandes</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="exportOrders"
              :disabled="isExporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ isExporting ? 'Export...' : 'Exporter CSV' }}
            </button>
            <button
              @click="refreshOrders"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Filters -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div>
              <label class="block text-sm font-medium text-gray-700">Recherche</label>
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="N° commande, email..."
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Statut</label>
              <select
                v-model="filters.status"
                @change="applyFilters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
                <option value="returned">Retournée</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date début</label>
              <input
                v-model="filters.startDate"
                @change="applyFilters"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date fin</label>
              <input
                v-model="filters.endDate"
                @change="applyFilters"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Montant minimum</label>
              <input
                v-model.number="filters.minAmount"
                @input="debouncedSearch"
                type="number"
                step="0.01"
                min="0"
                placeholder="€"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <DataTable
            :data="orders"
            :columns="columns"
            :loading="isLoading"
            :total-items="totalItems"
            :current-page="currentPage"
            :page-size="pageSize"
            @page-change="handlePageChange"
            @sort="handleSort"
            show-actions
          >
            <template #id="{ item }">
              <div class="text-sm font-medium text-gray-900">
                #{{ item.id.slice(-8) }}
              </div>
            </template>

            <template #customer="{ item }">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ item.User?.firstName }} {{ item.User?.lastName }}</div>
                <div class="text-sm text-gray-500">{{ item.User?.email }}</div>
              </div>
            </template>

            <template #amount="{ item }">
              <div class="text-sm font-medium text-gray-900">
                {{ formatCurrency(item.totalAmount) }}
              </div>
            </template>

            <template #status="{ item }">
              <span 
                :class="getStatusBadgeClass(item.status)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ getStatusLabel(item.status) }}
              </span>
            </template>

            <template #date="{ item }">
              <div class="text-sm text-gray-900">
                {{ formatDate(item.createdAt) }}
              </div>
            </template>

            <template #payment="{ item }">
              <span 
                :class="getPaymentBadgeClass(item.paymentStatus)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ getPaymentLabel(item.paymentStatus) }}
              </span>
            </template>

            <template #actions="{ item }">
              <div class="flex items-center space-x-2">
                <button
                  @click="viewOrder(item)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Voir
                </button>
                <div class="relative">
                  <button
                    @click="toggleStatusDropdown(item.id)"
                    class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Statut
                    <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div 
                    v-if="showStatusDropdown === item.id"
                    class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                  >
                    <div class="py-1">
                      <button
                        v-for="status in availableStatuses"
                        :key="status.value"
                        @click="updateStatus(item.id, status.value)"
                        :disabled="item.status === status.value"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ status.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="showOrderModal && selectedOrder" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeOrderModal"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Commande #{{ selectedOrder.id.slice(-8) }}
                </h3>
                
                <div class="space-y-4">
                  <!-- Customer Info -->
                  <div class="bg-gray-50 p-4 rounded-md">
                    <h4 class="font-medium text-gray-900 mb-2">Client</h4>
                    <p>{{ selectedOrder.User?.firstName }} {{ selectedOrder.User?.lastName }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.User?.email }}</p>
                  </div>

                  <!-- Order Status -->
                  <div class="flex space-x-4">
                    <div>
                      <span class="text-sm font-medium text-gray-500">Statut:</span>
                      <span :class="getStatusBadgeClass(selectedOrder.status)" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getStatusLabel(selectedOrder.status) }}
                      </span>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-500">Paiement:</span>
                      <span :class="getPaymentBadgeClass(selectedOrder.paymentStatus)" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getPaymentLabel(selectedOrder.paymentStatus) }}
                      </span>
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Articles commandés</h4>
                    <div class="border border-gray-200 rounded-md">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          <tr v-for="item in selectedOrder.OrderItems" :key="item.id">
                            <td class="px-4 py-2 text-sm text-gray-900">{{ item.Product?.name }}</td>
                            <td class="px-4 py-2 text-sm text-gray-900">{{ item.quantity }}</td>
                            <td class="px-4 py-2 text-sm text-gray-900">{{ formatCurrency(item.unitPrice) }}</td>
                            <td class="px-4 py-2 text-sm text-gray-900">{{ formatCurrency(item.quantity * item.unitPrice) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Delivery Address -->
                  <div v-if="selectedOrder.deliveryAddress" class="bg-gray-50 p-4 rounded-md">
                    <h4 class="font-medium text-gray-900 mb-2">Adresse de livraison</h4>
                    <div class="text-sm text-gray-600">
                      <p>{{ selectedOrder.deliveryAddress.firstName }} {{ selectedOrder.deliveryAddress.lastName }}</p>
                      <p>{{ selectedOrder.deliveryAddress.street }}</p>
                      <p>{{ selectedOrder.deliveryAddress.postalCode }} {{ selectedOrder.deliveryAddress.city }}</p>
                      <p>{{ selectedOrder.deliveryAddress.country }}</p>
                    </div>
                  </div>

                  <!-- Order Total -->
                  <div class="border-t pt-4">
                    <div class="flex justify-between text-lg font-medium text-gray-900">
                      <span>Total</span>
                      <span>{{ formatCurrency(selectedOrder.totalAmount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeOrderModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToast } from '@/composables/useToast'
import DataTable from '@/components/DataTable.vue'
import type { Order } from '@/types'

const adminStore = useAdminStore()
const { showToast } = useToast()

// State
const searchQuery = ref('')
const filters = ref({
  status: '',
  startDate: '',
  endDate: '',
  minAmount: ''
})
const showOrderModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const showStatusDropdown = ref<string | null>(null)
const isExporting = ref(false)

// Computed
const { orders, isLoading, totalItems, currentPage, pageSize } = adminStore

const columns = [
  { key: 'id', label: 'N° Commande', sortable: true },
  { key: 'customer', label: 'Client', sortable: false },
  { key: 'amount', label: 'Montant', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'payment', label: 'Paiement', sortable: false },
  { key: 'date', label: 'Date', sortable: true }
]

const availableStatuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'processing', label: 'En traitement' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'returned', label: 'Retournée' }
]

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getStatusLabel = (status: string) => {
  const statusObj = availableStatuses.find(s => s.value === status)
  return statusObj?.label || status
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-green-100 text-green-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    processing: 'En cours',
    paid: 'Payé',
    failed: 'Échoué',
    refunded: 'Remboursé'
  }
  return labels[status] || status
}

const getPaymentBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
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
  
  await adminStore.fetchOrders(1, filterParams)
}

const handlePageChange = (page: number) => {
  adminStore.fetchOrders(page, {
    ...filters.value,
    search: searchQuery.value
  })
}

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  const sortFilters = {
    ...filters.value,
    search: searchQuery.value,
    sortBy: column,
    sortOrder: direction
  }
  adminStore.fetchOrders(1, sortFilters)
}

const refreshOrders = async () => {
  await applyFilters()
}

const viewOrder = (order: Order) => {
  selectedOrder.value = order
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedOrder.value = null
}

const toggleStatusDropdown = (orderId: string) => {
  showStatusDropdown.value = showStatusDropdown.value === orderId ? null : orderId
}

const updateStatus = async (orderId: string, newStatus: string) => {
  try {
    await adminStore.updateOrderStatus(orderId, newStatus)
    showToast('Statut mis à jour avec succès', 'success')
    showStatusDropdown.value = null
  } catch (error: any) {
    showToast(error.message || 'Erreur lors de la mise à jour', 'error')
  }
}

const exportOrders = async () => {
  try {
    isExporting.value = true
    
    // Get all orders with current filters
    const response = await adminStore.fetchOrders(1, {
      ...filters.value,
      search: searchQuery.value,
      limit: 1000 // Get many orders for export
    })
    
    // Prepare CSV data
    const csvHeaders = ['N° Commande', 'Client', 'Email', 'Montant', 'Statut', 'Paiement', 'Date']
    const csvData = orders.value.map(order => [
      `#${order.id.slice(-8)}`,
      `${order.User?.firstName} ${order.User?.lastName}`,
      order.User?.email,
      order.totalAmount,
      getStatusLabel(order.status),
      getPaymentLabel(order.paymentStatus),
      formatDate(order.createdAt)
    ])
    
    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    showToast('Export terminé avec succès', 'success')
  } catch (error: any) {
    showToast(error.message || 'Erreur lors de l\'export', 'error')
  } finally {
    isExporting.value = false
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (showStatusDropdown.value && !(event.target as Element).closest('.relative')) {
    showStatusDropdown.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await adminStore.fetchOrders()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>