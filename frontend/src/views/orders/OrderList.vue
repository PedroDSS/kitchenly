<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Mes Commandes</h2>
        <div class="flex items-center space-x-4">
          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>

          <!-- Date Range Filter -->
          <div class="flex items-center space-x-2">
            <input
              v-model="dateFrom"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span class="text-gray-500">à</span>
            <input
              v-model="dateTo"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <LoadingSpinner v-if="loading" />
      
      <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-gray-500 mb-4">Aucune commande trouvée</p>
        <router-link to="/" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
          Commencer vos achats
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in paginatedOrders"
          :key="order.id"
          class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-semibold text-gray-900">Commande #{{ order.id }}</h3>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-gray-900">{{ formatPrice(order.totalAmount) }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Adresse de livraison</h4>
              <p class="text-sm text-gray-600">{{ order.deliveryAddress }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Mode de paiement</h4>
              <p class="text-sm text-gray-600">{{ order.paymentMethod }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Articles ({{ order.OrderItems?.length || 0 }})</h4>
            <div class="space-y-2">
              <div
                v-for="item in order.OrderItems?.slice(0, 3)"
                :key="item.id"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">{{ item.Product?.name || 'Produit supprimé' }}</span>
                <span class="text-gray-900">{{ item.quantity }} × {{ formatPrice(item.unitPrice) }}</span>
              </div>
              <div
                v-if="(order.OrderItems?.length || 0) > 3"
                class="text-sm text-gray-500"
              >
                ... et {{ (order.OrderItems?.length || 0) - 3 }} autre(s) article(s)
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center space-x-3">
              <router-link
                :to="`/orders/${order.id}`"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voir les détails
              </router-link>
              
              <button
                v-if="order.status === 'delivered' && canReturn(order)"
                @click="initiateReturn(order)"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Retourner
              </button>
              
              <button
                v-if="order.status !== 'cancelled' && order.status !== 'delivered'"
                @click="cancelOrder(order)"
                class="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Annuler
              </button>
            </div>
            
            <button
              @click="reorder(order)"
              class="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Commander à nouveau
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center">
        <nav class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-3 py-2 text-sm font-medium border rounded-md',
                page === currentPage ? 
                  'text-blue-600 bg-blue-50 border-blue-500' : 
                  'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import api from '@/services/api'

interface OrderItem {
  id: number
  quantity: number
  unitPrice: number
  Product?: {
    name: string
  }
}

interface Order {
  id: number
  status: string
  totalAmount: number
  createdAt: string
  deliveryAddress: string
  paymentMethod: string
  OrderItems?: OrderItem[]
}

const router = useRouter()

// State
const orders = ref<Order[]>([])
const loading = ref(true)
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const pageSize = 10

// Computed
const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  // Status filter
  if (statusFilter.value) {
    result = result.filter(order => order.status === statusFilter.value)
  }
  
  // Date range filter
  if (dateFrom.value) {
    result = result.filter(order => new Date(order.createdAt) >= new Date(dateFrom.value))
  }
  if (dateTo.value) {
    result = result.filter(order => new Date(order.createdAt) <= new Date(dateTo.value + 'T23:59:59'))
  }
  
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredOrders.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const loadOrders = async () => {
  loading.value = true
  try {
    const response = await api.getOrders()
    orders.value = response.data || []
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price / 100)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getStatusClass = (status: string) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  }
  return texts[status as keyof typeof texts] || status
}

const canReturn = (order: Order) => {
  const deliveryDate = new Date(order.createdAt)
  const returnDeadline = new Date(deliveryDate.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days
  return new Date() <= returnDeadline
}

const cancelOrder = async (order: Order) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    return
  }
  
  try {
    await api.cancelOrder(order.id.toString())
    await loadOrders()
  } catch (error) {
    console.error('Error cancelling order:', error)
    window.alert('Erreur lors de l\'annulation de la commande')
  }
}

const initiateReturn = async (order: Order) => {
  if (!confirm('Êtes-vous sûr de vouloir retourner cette commande ?')) {
    return
  }
  
  try {
    await api.returnOrder(order.id.toString(), 'User requested return')
    await loadOrders()
    window.alert('Demande de retour enregistrée. Vous recevrez un email avec les instructions.')
  } catch (error) {
    console.error('Error initiating return:', error)
    window.alert('Erreur lors de la demande de retour')
  }
}

const reorder = async (order: Order) => {
  try {
    await api.reorder(order.id.toString())
    router.push('/cart')
  } catch (error) {
    console.error('Error reordering:', error)
    window.alert('Erreur lors de la nouvelle commande')
  }
}

// Watchers
watch([statusFilter, dateFrom, dateTo], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadOrders()
})
</script>