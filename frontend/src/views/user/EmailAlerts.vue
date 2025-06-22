<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Mes Alertes Email</h2>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nouvelle Alerte
        </button>
      </div>
    </div>

    <div class="p-6">
      <LoadingSpinner v-if="loading" />
      
      <div v-else-if="alerts.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <p class="text-gray-500 mb-4">Aucune alerte configurée</p>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          Créer votre première alerte
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="border border-gray-200 rounded-lg p-6"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ getAlertTitle(alert) }}
                </h3>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ alert.enabled ? 'Activée' : 'Désactivée' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ getAlertDescription(alert) }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Créée le {{ formatDate(alert.createdAt) }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleAlert(alert)"
                :class="[
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  alert.enabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                    alert.enabled ? 'translate-x-5' : 'translate-x-0'
                  ]"
                />
              </button>
              <button
                @click="editAlert(alert)"
                class="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Modifier
              </button>
              <button
                @click="deleteAlert(alert)"
                class="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Alert Modal -->
  <div
    v-if="showCreateModal || editingAlert"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ editingAlert ? 'Modifier l\'alerte' : 'Créer une nouvelle alerte' }}
        </h3>
        
        <form @submit.prevent="saveAlert" class="mt-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Type d'alerte</label>
            <select
              v-model="alertForm.type"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="stock">Alerte stock</option>
              <option value="price">Alerte prix</option>
              <option value="new_product">Nouveau produit</option>
            </select>
          </div>

          <div v-if="alertForm.type === 'stock' || alertForm.type === 'price'">
            <label class="block text-sm font-medium text-gray-700">Produit</label>
            <select
              v-model="alertForm.productId"
              :required="alertForm.type === 'stock' || alertForm.type === 'price'"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un produit</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>

          <div v-if="alertForm.type === 'new_product'">
            <label class="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              v-model="alertForm.categoryId"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="flex items-center">
            <input
              v-model="alertForm.enabled"
              type="checkbox"
              id="alert-enabled"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="alert-enabled" class="ml-2 block text-sm text-gray-900">
              Activer l'alerte
            </label>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import api from '@/services/api'

interface EmailAlert {
  id: number
  type: string
  enabled: boolean
  categoryId?: number
  productId?: number
  createdAt: string
  Category?: { name: string }
  Product?: { name: string }
}

interface Product {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

// State
const alerts = ref<EmailAlert[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const saving = ref(false)
const showCreateModal = ref(false)
const editingAlert = ref<EmailAlert | null>(null)

const alertForm = reactive({
  type: '',
  categoryId: null as number | null,
  productId: null as number | null,
  enabled: true
})

// Methods
const loadAlerts = async () => {
  loading.value = true
  try {
    const response = await api.getEmailAlerts()
    alerts.value = response || []
  } catch (error) {
    console.error('Error loading alerts:', error)
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const response = await api.getProducts({ limit: 1000 })
    products.value = response.data || []
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await api.getCategories()
    categories.value = response || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const getAlertTitle = (alert: EmailAlert) => {
  switch (alert.type) {
    case 'stock':
      return `Alerte stock - ${alert.Product?.name || 'Produit supprimé'}`
    case 'price':
      return `Alerte prix - ${alert.Product?.name || 'Produit supprimé'}`
    case 'new_product':
      return `Nouveaux produits${alert.Category ? ` - ${alert.Category.name}` : ''}`
    default:
      return 'Alerte inconnue'
  }
}

const getAlertDescription = (alert: EmailAlert) => {
  switch (alert.type) {
    case 'stock':
      return 'Vous serez notifié quand ce produit sera de nouveau en stock'
    case 'price':
      return 'Vous serez notifié en cas de baisse de prix'
    case 'new_product':
      return 'Vous serez notifié des nouveaux produits dans cette catégorie'
    default:
      return ''
  }
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

const toggleAlert = async (alert: EmailAlert) => {
  try {
    await api.updateEmailAlert(alert.id.toString(), {
      enabled: !alert.enabled
    })
    alert.enabled = !alert.enabled
  } catch (error) {
    console.error('Error toggling alert:', error)
    window.alert('Erreur lors de la modification de l\'alerte')
  }
}

const editAlert = (alert: EmailAlert) => {
  editingAlert.value = alert
  alertForm.type = alert.type
  alertForm.categoryId = alert.categoryId || null
  alertForm.productId = alert.productId || null
  alertForm.enabled = alert.enabled
}

const deleteAlert = async (alert: EmailAlert) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
    return
  }
  
  try {
    await api.deleteEmailAlert(alert.id.toString())
    await loadAlerts()
  } catch (error) {
    console.error('Error deleting alert:', error)
    window.alert('Erreur lors de la suppression de l\'alerte')
  }
}

const saveAlert = async () => {
  saving.value = true
  try {
    const data = {
      type: alertForm.type,
      categoryId: alertForm.categoryId,
      productId: alertForm.productId,
      enabled: alertForm.enabled
    }

    if (editingAlert.value) {
      await api.updateEmailAlert(editingAlert.value.id.toString(), data)
    } else {
      await api.createEmailAlert(data)
    }

    await loadAlerts()
    closeModal()
  } catch (error) {
    console.error('Error saving alert:', error)
    window.alert('Erreur lors de l\'enregistrement de l\'alerte')
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingAlert.value = null
  alertForm.type = ''
  alertForm.categoryId = null
  alertForm.productId = null
  alertForm.enabled = true
}

// Lifecycle
onMounted(() => {
  loadAlerts()
  loadProducts()
  loadCategories()
})
</script>