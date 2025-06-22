<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
        <p class="mt-2 text-gray-600">Gérez votre compte et vos commandes</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <nav class="bg-white rounded-lg shadow p-6">
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/dashboard"
                  class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  :class="$route.name === 'Dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"/>
                  </svg>
                  Vue d'ensemble
                </router-link>
              </li>
              <li>
                <router-link
                  to="/orders"
                  class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  :class="typeof $route.name === 'string' && $route.name.includes('Order') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Mes Commandes
                </router-link>
              </li>
              <li>
                <router-link
                  to="/alerts"
                  class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  :class="$route.name === 'EmailAlerts' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  Alertes Email
                </router-link>
              </li>
              <li>
                <router-link
                  to="/profile"
                  class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  :class="$route.name === 'Profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Mon Profil
                </router-link>
              </li>
            </ul>

            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Données Personnelles</h3>
              <ul class="space-y-2">
                <li>
                  <button
                    @click="exportData"
                    :disabled="exportLoading"
                    class="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    </svg>
                    {{ exportLoading ? 'Export...' : 'Exporter mes données' }}
                  </button>
                </li>
                <li>
                  <button
                    @click="confirmDeleteAccount"
                    class="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Supprimer mon compte
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Overview Dashboard (shown only on /dashboard route) -->
          <div v-if="$route.name === 'Dashboard'" class="space-y-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Commandes</p>
                    <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Dépensé</p>
                    <p class="text-2xl font-bold text-gray-900">{{ formatPrice(stats.totalSpent) }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Alertes Actives</p>
                    <p class="text-2xl font-bold text-gray-900">{{ stats.activeAlerts }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Orders -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-medium text-gray-900">Commandes Récentes</h2>
                  <router-link
                    to="/orders"
                    class="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Voir toutes
                  </router-link>
                </div>
              </div>
              <div class="p-6">
                <div v-if="recentOrders.length === 0" class="text-center py-8">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <p class="text-gray-500">Aucune commande pour le moment</p>
                  <router-link to="/" class="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                    Commencer vos achats
                  </router-link>
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="order in recentOrders"
                    :key="order.id"
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <p class="font-medium text-gray-900">Commande #{{ order.id }}</p>
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(order.status)"
                        >
                          {{ getStatusText(order.status) }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ formatDate(order.createdAt) }} • {{ formatPrice(order.totalAmount) }}
                      </p>
                    </div>
                    <router-link
                      :to="`/orders/${order.id}`"
                      class="ml-4 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Détails
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Router view for sub-pages -->
          <router-view v-else />
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showDeleteModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Supprimer votre compte</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500 mb-3">
              <strong>Attention :</strong> Cette action est irréversible. En supprimant votre compte :
            </p>
            <ul class="text-sm text-gray-500 list-disc list-inside space-y-1 text-left">
              <li>Toutes vos données personnelles seront définitivement supprimées</li>
              <li>Votre historique de commandes sera anonymisé</li>
              <li>Vos alertes email seront désactivées</li>
              <li>Vous ne pourrez plus accéder à votre compte</li>
            </ul>
            <p class="text-sm text-gray-500 mt-3">
              Si vous souhaitez conserver vos données, utilisez d'abord la fonction "Exporter mes données" avant de supprimer votre compte.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="deleteAccount"
              :disabled="deleteLoading"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 mb-2"
            >
              {{ deleteLoading ? 'Suppression...' : 'Confirmer la suppression' }}
            </button>
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

interface Order {
  id: number
  status: string
  totalAmount: number
  createdAt: string
}

interface Stats {
  totalOrders: number
  totalSpent: number
  activeAlerts: number
}

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<Stats>({
  totalOrders: 0,
  totalSpent: 0,
  activeAlerts: 0
})
const recentOrders = ref<Order[]>([])
const exportLoading = ref(false)
const deleteLoading = ref(false)
const showDeleteModal = ref(false)

const loadDashboardData = async () => {
  try {
    // Load recent orders
    const ordersResponse = await api.getOrders({ limit: 5 })
    recentOrders.value = ordersResponse.data || []

    // Calculate stats
    const allOrdersResponse = await api.getOrders()
    const allOrders = allOrdersResponse.data || []
    
    stats.value.totalOrders = allOrders.length
    stats.value.totalSpent = allOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0)

    // Load active alerts count
    const alertsResponse = await api.getEmailAlerts()
    const alerts = alertsResponse || []
    stats.value.activeAlerts = alerts.filter((alert: any) => alert.enabled).length
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const exportData = async () => {
  if (!confirm('Voulez-vous télécharger une archive de toutes vos données personnelles ?')) {
    return
  }
  
  exportLoading.value = true
  try {
    const response = await api.exportUserData()
    
    const blob = new Blob([response], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kitchenly-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    window.URL.revokeObjectURL(url)
    
    window.alert('Export réussi ! Le fichier contient toutes vos données personnelles conformément au RGPD.')
  } catch (error) {
    console.error('Error exporting data:', error)
    window.alert('Erreur lors de l\'export des données')
  } finally {
    exportLoading.value = false
  }
}

const confirmDeleteAccount = () => {
  showDeleteModal.value = true
}

const deleteAccount = async () => {
  deleteLoading.value = true
  try {
    await api.deleteAccount()
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Error deleting account:', error)
    window.alert('Erreur lors de la suppression du compte')
  } finally {
    deleteLoading.value = false
    showDeleteModal.value = false
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
    day: 'numeric'
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

onMounted(() => {
  if (router.currentRoute.value.name === 'Dashboard') {
    loadDashboardData()
  }
})
</script>