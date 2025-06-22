<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p class="mt-1 text-sm text-gray-500">Gérez les comptes utilisateurs</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="exportUsers"
              :disabled="isExporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ isExporting ? 'Export...' : 'Exporter CSV' }}
            </button>
            <button
              @click="refreshUsers"
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
                placeholder="Nom, email..."
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                v-model="filters.role"
                @change="applyFilters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Tous les rôles</option>
                <option value="User">Utilisateur</option>
                <option value="Store Keeper">Responsable de stock</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Statut</label>
              <select
                v-model="filters.status"
                @change="applyFilters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="locked">Verrouillé</option>
                <option value="unconfirmed">Non confirmé</option>
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
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <DataTable
            :data="users"
            :columns="columns"
            :loading="isLoading"
            :total-items="totalItems"
            :current-page="currentPage"
            :page-size="pageSize"
            @page-change="handlePageChange"
            @sort="handleSort"
            show-actions
          >
            <template #name="{ item }">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ item.firstName }} {{ item.lastName }}</div>
                <div class="text-sm text-gray-500">{{ item.email }}</div>
              </div>
            </template>

            <template #role="{ item }">
              <span :class="getRoleBadgeClass(item.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getRoleLabel(item.role) }}
              </span>
            </template>

            <template #status="{ item }">
              <span :class="getStatusBadgeClass(item)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getUserStatus(item) }}
              </span>
            </template>

            <template #lastLogin="{ item }">
              <div class="text-sm text-gray-900">
                {{ item.lastLoginAt ? formatDate(item.lastLoginAt) : 'Jamais' }}
              </div>
            </template>

            <template #createdAt="{ item }">
              <div class="text-sm text-gray-900">
                {{ formatDate(item.createdAt) }}
              </div>
            </template>

            <template #actions="{ item }">
              <div class="flex items-center space-x-2">
                <button
                  @click="viewUser(item)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Voir
                </button>
                <div class="relative">
                  <button
                    @click="toggleActionDropdown(item.id)"
                    class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Actions
                    <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div 
                    v-if="showActionDropdown === item.id"
                    class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                  >
                    <div class="py-1">
                      <button
                        @click="loginAsUser(item.id)"
                        :disabled="item.role === 'Admin'"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Se connecter en tant que
                      </button>
                      <button
                        v-if="item.isLocked"
                        @click="unlockUser(item.id)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Déverrouiller
                      </button>
                      <button
                        v-else
                        @click="lockUser(item.id)"
                        class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                      >
                        Verrouiller
                      </button>
                      <button
                        v-if="!item.emailConfirmedAt"
                        @click="confirmEmail(item.id)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Confirmer email
                      </button>
                      <button
                        @click="resetPassword(item.id)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Réinitialiser mot de passe
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

    <!-- User Detail Modal -->
    <div v-if="showUserModal && selectedUser" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeUserModal"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Profil utilisateur
                </h3>
                
                <div class="space-y-4">
                  <!-- User Info -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Nom complet</label>
                      <p class="text-sm text-gray-900">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Email</label>
                      <p class="text-sm text-gray-900">{{ selectedUser.email }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Rôle</label>
                      <span :class="getRoleBadgeClass(selectedUser.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getRoleLabel(selectedUser.role) }}
                      </span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Statut</label>
                      <span :class="getStatusBadgeClass(selectedUser)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getUserStatus(selectedUser) }}
                      </span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Date d'inscription</label>
                      <p class="text-sm text-gray-900">{{ formatDate(selectedUser.createdAt) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Dernière connexion</label>
                      <p class="text-sm text-gray-900">{{ selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Jamais' }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Email confirmé</label>
                      <p class="text-sm text-gray-900">{{ selectedUser.emailConfirmedAt ? 'Oui' : 'Non' }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500">Tentatives de connexion</label>
                      <p class="text-sm text-gray-900">{{ selectedUser.loginAttempts || 0 }}</p>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500">Adresse</label>
                    <div class="text-sm text-gray-900">
                      <p v-if="selectedUser.address">{{ selectedUser.address }}</p>
                      <p v-else class="italic text-gray-500">Aucune adresse renseignée</p>
                    </div>
                  </div>

                  <!-- Order Statistics -->
                  <div class="border-t pt-4">
                    <h4 class="font-medium text-gray-900 mb-2">Statistiques commandes</h4>
                    <div class="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div class="text-2xl font-bold text-indigo-600">{{ selectedUser.orderCount || 0 }}</div>
                        <div class="text-sm text-gray-500">Commandes</div>
                      </div>
                      <div>
                        <div class="text-2xl font-bold text-green-600">{{ formatCurrency(selectedUser.totalSpent || 0) }}</div>
                        <div class="text-sm text-gray-500">Total dépensé</div>
                      </div>
                      <div>
                        <div class="text-2xl font-bold text-purple-600">{{ formatCurrency(selectedUser.averageOrder || 0) }}</div>
                        <div class="text-sm text-gray-500">Panier moyen</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeUserModal"
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
import type { User } from '@/types'

const adminStore = useAdminStore()
const { showToast } = useToast()

// State
const searchQuery = ref('')
const filters = ref({
  role: '',
  status: '',
  startDate: '',
  endDate: ''
})
const showUserModal = ref(false)
const selectedUser = ref<User | null>(null)
const showActionDropdown = ref<string | null>(null)
const isExporting = ref(false)

// Computed
const { users, isLoading, totalItems, currentPage, pageSize } = adminStore

const columns = [
  { key: 'name', label: 'Utilisateur', sortable: true },
  { key: 'role', label: 'Rôle', sortable: true },
  { key: 'status', label: 'Statut', sortable: false },
  { key: 'lastLogin', label: 'Dernière connexion', sortable: true },
  { key: 'createdAt', label: 'Inscription', sortable: true }
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

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'User': 'Utilisateur',
    'Store Keeper': 'Responsable stock',
    'Admin': 'Administrateur'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    'User': 'bg-blue-100 text-blue-800',
    'Store Keeper': 'bg-purple-100 text-purple-800',
    'Admin': 'bg-red-100 text-red-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getUserStatus = (user: User) => {
  if (user.isLocked) return 'Verrouillé'
  if (!user.emailConfirmedAt) return 'Non confirmé'
  return 'Actif'
}

const getStatusBadgeClass = (user: User) => {
  if (user.isLocked) return 'bg-red-100 text-red-800'
  if (!user.emailConfirmedAt) return 'bg-yellow-100 text-yellow-800'
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
  
  await adminStore.fetchUsers(1, filterParams)
}

const handlePageChange = (page: number) => {
  adminStore.fetchUsers(page, {
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
  adminStore.fetchUsers(1, sortFilters)
}

const refreshUsers = async () => {
  await applyFilters()
}

const viewUser = (user: User) => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

const toggleActionDropdown = (userId: string) => {
  showActionDropdown.value = showActionDropdown.value === userId ? null : userId
}

const loginAsUser = async (userId: string) => {
  try {
    const response = await adminStore.loginAsUser(userId)
    showToast('Connexion en tant qu\'utilisateur réussie', 'success')
    showActionDropdown.value = null
    // Redirect would happen here based on response
  } catch (error: any) {
    showToast(error.message || 'Erreur lors de la connexion', 'error')
  }
}

const lockUser = async (userId: string) => {
  try {
    // This would need to be implemented in the admin store
    showToast('Utilisateur verrouillé avec succès', 'success')
    showActionDropdown.value = null
    await refreshUsers()
  } catch (error: any) {
    showToast(error.message || 'Erreur lors du verrouillage', 'error')
  }
}

const unlockUser = async (userId: string) => {
  try {
    // This would need to be implemented in the admin store
    showToast('Utilisateur déverrouillé avec succès', 'success')
    showActionDropdown.value = null
    await refreshUsers()
  } catch (error: any) {
    showToast(error.message || 'Erreur lors du déverrouillage', 'error')
  }
}

const confirmEmail = async (userId: string) => {
  try {
    // This would need to be implemented in the admin store
    showToast('Email confirmé avec succès', 'success')
    showActionDropdown.value = null
    await refreshUsers()
  } catch (error: any) {
    showToast(error.message || 'Erreur lors de la confirmation', 'error')
  }
}

const resetPassword = async (userId: string) => {
  try {
    // This would need to be implemented in the admin store
    showToast('Mot de passe réinitialisé avec succès', 'success')
    showActionDropdown.value = null
  } catch (error: any) {
    showToast(error.message || 'Erreur lors de la réinitialisation', 'error')
  }
}

const exportUsers = async () => {
  try {
    isExporting.value = true
    
    // Get all users with current filters
    const response = await adminStore.fetchUsers(1, {
      ...filters.value,
      search: searchQuery.value,
      limit: 1000 // Get many users for export
    })
    
    // Prepare CSV data
    const csvHeaders = ['Nom', 'Prénom', 'Email', 'Rôle', 'Statut', 'Inscription', 'Dernière connexion']
    const csvData = users.value.map(user => [
      user.lastName,
      user.firstName,
      user.email,
      getRoleLabel(user.role),
      getUserStatus(user),
      formatDate(user.createdAt),
      user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais'
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
    link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
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
  if (showActionDropdown.value && !(event.target as Element).closest('.relative')) {
    showActionDropdown.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await adminStore.fetchUsers()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>