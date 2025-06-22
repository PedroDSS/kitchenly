<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Points Relais</h1>
        <p class="mt-2 text-gray-600">Gérez les points de retrait et livraison</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Points Actifs</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
            </div>
            <MapPinIcon class="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Commandes ce mois</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.monthlyOrders }}</p>
            </div>
            <TruckIcon class="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Capacité Moyenne</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.avgCapacity }}%</p>
            </div>
            <ChartBarIcon class="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Note Moyenne</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.avgRating.toFixed(1) }}/5</p>
            </div>
            <StarIcon class="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <!-- Map View Toggle -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <QueueListIcon class="h-5 w-5 inline mr-2" />
              Liste
            </button>
            <button
              @click="viewMode = 'map'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <MapIcon class="h-5 w-5 inline mr-2" />
              Carte
            </button>
          </div>
          
          <button
            @click="showCreateModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon class="h-5 w-5 inline mr-2" />
            Nouveau Point Relais
          </button>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Nom, ID externe..."
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @input="debouncedFetch"
              />
            </div>

            <div class="w-48">
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                v-model="filters.type"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @change="fetchRelayPoints"
              >
                <option value="">Tous</option>
                <option value="post_office">Bureau de poste</option>
                <option value="partner_shop">Commerce partenaire</option>
                <option value="locker">Consigne automatique</option>
              </select>
            </div>

            <div class="w-48">
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                v-model="filters.city"
                type="text"
                placeholder="Ville..."
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @input="debouncedFetch"
              />
            </div>

            <div class="w-32">
              <label class="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
              <input
                v-model="filters.postalCode"
                type="text"
                placeholder="75000"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @input="debouncedFetch"
              />
            </div>

            <div class="w-32">
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="filters.isActive"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @change="fetchRelayPoints"
              >
                <option value="">Tous</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        <!-- DataTable -->
        <DataTable
          :columns="columns"
          :data="relayPoints"
          :loading="loading"
          :pagination="pagination"
          @sort="handleSort"
          @page-change="goToPage"
          @export="exportData"
        >
          <template #name="{ row }">
            <div>
              <div class="text-sm font-medium text-gray-900">{{ row.name }}</div>
              <div class="text-xs text-gray-500">ID: {{ row.externalId }}</div>
            </div>
          </template>

          <template #type="{ row }">
            <span class="text-sm text-gray-500">
              {{ getTypeLabel(row.type) }}
            </span>
          </template>

          <template #address="{ row }">
            <div class="text-sm">
              <div class="text-gray-900">{{ row.address.street }}</div>
              <div class="text-gray-500">{{ row.postalCode }} {{ row.city }}</div>
            </div>
          </template>

          <template #capacity="{ row }">
            <div v-if="row.capacity" class="text-sm">
              <div class="flex items-center">
                <span class="text-gray-700">{{ row.capacity.currentPackages }}/{{ row.capacity.maxPackagesPerDay }}</span>
                <div class="ml-2 w-24 bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    :class="getCapacityClass(row.capacity)"
                    :style="`width: ${(row.capacity.currentPackages / row.capacity.maxPackagesPerDay) * 100}%`"
                  ></div>
                </div>
              </div>
            </div>
            <span v-else class="text-sm text-gray-400">-</span>
          </template>

          <template #rating="{ row }">
            <div v-if="row.ratings?.average" class="flex items-center text-sm">
              <StarIcon class="h-4 w-4 text-yellow-400 mr-1" />
              <span>{{ row.ratings.average.toFixed(1) }}</span>
              <span class="text-gray-500 ml-1">({{ row.ratings.count }})</span>
            </div>
            <span v-else class="text-sm text-gray-400">-</span>
          </template>

          <template #status="{ row }">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  row.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ row.isActive ? 'Actif' : 'Inactif' }}
              </span>
              <span
                v-if="row.temporarilyClosed"
                class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800"
              >
                Fermé temp.
              </span>
            </div>
          </template>

          <template #actions="{ row }">
            <div class="flex items-center space-x-3">
              <button
                @click="viewRelayPointDetails(row)"
                class="text-blue-600 hover:text-blue-900"
                title="Voir les détails"
              >
                <EyeIcon class="h-5 w-5" />
              </button>
              <button
                @click="editRelayPoint(row)"
                class="text-green-600 hover:text-green-900"
                title="Modifier"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                v-if="row.orderCount === 0"
                @click="deleteRelayPoint(row)"
                class="text-red-600 hover:text-red-900"
                title="Supprimer"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Map View -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <div ref="mapContainer" class="w-full h-[600px] rounded-lg"></div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModals"></div>
        
        <div class="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            {{ showEditModal ? 'Modifier le Point Relais' : 'Nouveau Point Relais' }}
          </h3>
          
          <form @submit.prevent="saveRelayPoint">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  v-model="relayForm.name"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID Externe</label>
                <input
                  v-model="relayForm.externalId"
                  type="text"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ID La Poste..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  v-model="relayForm.type"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="post_office">Bureau de poste</option>
                  <option value="partner_shop">Commerce partenaire</option>
                  <option value="locker">Consigne automatique</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Transporteur</label>
                <select
                  v-model="relayForm.carrier"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="La Poste">La Poste</option>
                  <option value="Chronopost">Chronopost</option>
                  <option value="DHL">DHL</option>
                  <option value="UPS">UPS</option>
                </select>
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input
                  v-model="relayForm.address.street"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code Postal *</label>
                <input
                  v-model="relayForm.postalCode"
                  type="text"
                  required
                  pattern="[0-9]{5}"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input
                  v-model="relayForm.city"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  v-model="relayForm.phone"
                  type="tel"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="relayForm.email"
                  type="email"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Coordonnées GPS *</label>
                <div class="grid grid-cols-2 gap-4">
                  <input
                    v-model.number="relayForm.coordinates.lat"
                    type="number"
                    step="0.000001"
                    required
                    placeholder="Latitude"
                    class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    v-model.number="relayForm.coordinates.lng"
                    type="number"
                    step="0.000001"
                    required
                    placeholder="Longitude"
                    class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Ou cliquez sur la carte ci-dessous pour sélectionner l'emplacement
                </p>
              </div>

              <div class="col-span-2">
                <div ref="modalMapContainer" class="w-full h-64 rounded-lg border border-gray-300"></div>
              </div>

              <div v-if="relayForm.type === 'locker'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de casiers</label>
                <input
                  v-model.number="relayForm.lockerCount"
                  type="number"
                  min="1"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Poids max (kg)</label>
                <input
                  v-model.number="relayForm.maxPackageWeight"
                  type="number"
                  min="1"
                  step="0.1"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Services disponibles</label>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="service in availableServices"
                    :key="service"
                    class="flex items-center"
                  >
                    <input
                      v-model="relayForm.services"
                      :value="service"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ service }}</span>
                  </label>
                </div>
              </div>

              <div class="col-span-2">
                <label class="flex items-center">
                  <input
                    v-model="relayForm.parkingAvailable"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Parking disponible</span>
                </label>
              </div>

              <div class="col-span-2">
                <label class="flex items-center">
                  <input
                    v-model="relayForm.wheelchairAccessible"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Accessible PMR</span>
                </label>
              </div>

              <div class="col-span-2">
                <label class="flex items-center">
                  <input
                    v-model="relayForm.isActive"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Point relais actif</span>
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
    <div v-if="showDetailsModal && selectedRelayPoint" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDetailsModal = false"></div>
        
        <div class="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            Détails du Point Relais - {{ selectedRelayPoint.name }}
          </h3>

          <!-- Analytics Chart -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Commandes sur 30 jours</h4>
            <canvas ref="ordersChart" height="150"></canvas>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Commandes totales</p>
              <p class="text-2xl font-bold">{{ selectedRelayPoint.orderCount || 0 }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Capacité actuelle</p>
              <p class="text-2xl font-bold">
                {{ selectedRelayPoint.mongoData?.capacity?.currentPackages || 0 }}/{{ selectedRelayPoint.mongoData?.capacity?.maxPackagesPerDay || 100 }}
              </p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Note moyenne</p>
              <p class="text-2xl font-bold">
                {{ selectedRelayPoint.mongoData?.ratings?.average?.toFixed(1) || '-' }}/5
              </p>
            </div>
          </div>

          <!-- Information -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Informations générales</h4>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm text-gray-500">Type</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ getTypeLabel(selectedRelayPoint.type) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">Transporteur</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ selectedRelayPoint.carrier }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">Adresse</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ selectedRelayPoint.address.street }}<br>
                    {{ selectedRelayPoint.postalCode }} {{ selectedRelayPoint.city }}
                  </dd>
                </div>
                <div v-if="selectedRelayPoint.phone">
                  <dt class="text-sm text-gray-500">Téléphone</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ selectedRelayPoint.phone }}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Services et accessibilité</h4>
              <div v-if="selectedRelayPoint.services?.length" class="mb-3">
                <p class="text-sm text-gray-500 mb-1">Services disponibles:</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="service in selectedRelayPoint.services"
                    :key="service"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {{ service }}
                  </span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <CheckCircleIcon v-if="selectedRelayPoint.parkingAvailable" class="h-4 w-4 text-green-500 mr-2" />
                  <XCircleIcon v-else class="h-4 w-4 text-red-500 mr-2" />
                  <span>Parking disponible</span>
                </div>
                <div class="flex items-center text-sm">
                  <CheckCircleIcon v-if="selectedRelayPoint.wheelchairAccessible" class="h-4 w-4 text-green-500 mr-2" />
                  <XCircleIcon v-else class="h-4 w-4 text-red-500 mr-2" />
                  <span>Accessible PMR</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Commandes récentes</h4>
            <DataTable
              :columns="orderColumns"
              :data="selectedRelayPoint.Orders || []"
              :loading="false"
              :show-pagination="false"
            >
              <template #date="{ row }">
                <span class="text-sm text-gray-500">{{ formatDate(row.createdAt) }}</span>
              </template>
              <template #orderId="{ row }">
                <span class="text-sm font-mono text-gray-900">#{{ row.id.substring(0, 8) }}</span>
              </template>
              <template #amount="{ row }">
                <span class="text-sm text-gray-900">{{ formatCurrency(row.totalAmount) }}</span>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import DataTable from '@/components/DataTable.vue'
import {
  MapPinIcon,
  TruckIcon,
  ChartBarIcon,
  StarIcon,
  QueueListIcon,
  MapIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Google Maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

// DataTable columns
const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'address', label: 'Adresse', sortable: true },
  { key: 'capacity', label: 'Capacité', sortable: false },
  { key: 'rating', label: 'Note', sortable: false },
  { key: 'status', label: 'Statut', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
]

const orderColumns = [
  { key: 'date', label: 'Date' },
  { key: 'orderId', label: 'Commande' },
  { key: 'amount', label: 'Montant' }
]

// State
const relayPoints = ref([])
const loading = ref(false)
const viewMode = ref<'list' | 'map'>('list')
const stats = ref({
  active: 0,
  monthlyOrders: 0,
  avgCapacity: 0,
  avgRating: 0
})
const pagination = ref({
  total: 0,
  pages: 0,
  currentPage: 1,
  perPage: 20
})
const filters = ref({
  search: '',
  type: '',
  city: '',
  postalCode: '',
  isActive: ''
})
const sortBy = ref('name')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedRelayPoint = ref(null)
const editingRelayPoint = ref(null)
const isSubmitting = ref(false)

const relayForm = ref({
  name: '',
  externalId: '',
  type: 'post_office',
  carrier: 'La Poste',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'France'
  },
  postalCode: '',
  city: '',
  country: 'France',
  coordinates: {
    lat: 48.8566,
    lng: 2.3522
  },
  phone: '',
  email: '',
  services: [],
  maxPackageWeight: 30,
  parkingAvailable: false,
  wheelchairAccessible: false,
  lockerCount: null,
  isActive: true
})

const availableServices = [
  'Retrait colis',
  'Dépôt colis',
  'Affranchissement',
  'Vente emballages',
  'Retour e-commerce',
  'Click & Collect'
]

// Map instances
let map = null
let modalMap = null
let markers = []
let modalMarker = null
let ordersChart = null

// Refs
const mapContainer = ref(null)
const modalMapContainer = ref(null)

// Methods
const fetchRelayPoints = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
      sort: sortBy.value,
      ...filters.value
    }
    
    const response = await api.get('/relay-points', { params })
    relayPoints.value = response.data.data.relayPoints
    pagination.value = response.data.data.pagination
    
    // Calculate stats
    calculateStats()
    
    // Update map markers if in map view
    if (viewMode.value === 'map' && map) {
      updateMapMarkers()
    }
  } catch (error) {
    showToast('Erreur lors du chargement des points relais', 'error')
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const active = relayPoints.value.filter(rp => rp.isActive).length
  const monthlyOrders = relayPoints.value.reduce((sum, rp) => sum + (rp.orderCount || 0), 0)
  
  let totalCapacity = 0
  let capacityCount = 0
  let totalRating = 0
  let ratingCount = 0
  
  relayPoints.value.forEach(rp => {
    if (rp.capacity) {
      totalCapacity += (rp.capacity.currentPackages / rp.capacity.maxPackagesPerDay) * 100
      capacityCount++
    }
    if (rp.ratings?.average) {
      totalRating += rp.ratings.average
      ratingCount++
    }
  })
  
  stats.value = {
    active,
    monthlyOrders,
    avgCapacity: capacityCount > 0 ? Math.round(totalCapacity / capacityCount) : 0,
    avgRating: ratingCount > 0 ? totalRating / ratingCount : 0
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
  
  fetchRelayPoints()
}

const initGoogleMaps = () => {
  if (!window.google) {
    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    
    window.initMap = () => {
      initMaps()
    }
  } else {
    initMaps()
  }
}

const initMaps = () => {
  // Main map
  if (mapContainer.value && viewMode.value === 'map') {
    map = new window.google.maps.Map(mapContainer.value, {
      center: { lat: 46.2276, lng: 2.2137 }, // Center of France
      zoom: 6
    })
    
    updateMapMarkers()
  }
}

const initModalMap = () => {
  if (!modalMapContainer.value || !window.google) return
  
  modalMap = new window.google.maps.Map(modalMapContainer.value, {
    center: relayForm.value.coordinates,
    zoom: 15
  })
  
  modalMarker = new window.google.maps.Marker({
    position: relayForm.value.coordinates,
    map: modalMap,
    draggable: true
  })
  
  modalMarker.addListener('dragend', (event) => {
    relayForm.value.coordinates = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }
  })
  
  modalMap.addListener('click', (event) => {
    relayForm.value.coordinates = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }
    modalMarker.setPosition(event.latLng)
  })
}

const updateMapMarkers = () => {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null))
  markers = []
  
  // Add new markers
  relayPoints.value.forEach(rp => {
    if (rp.coordinates) {
      const marker = new window.google.maps.Marker({
        position: {
          lat: rp.coordinates.coordinates[1],
          lng: rp.coordinates.coordinates[0]
        },
        map,
        title: rp.name,
        icon: {
          url: rp.isActive
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })
      
      marker.addListener('click', () => {
        viewRelayPointDetails(rp)
      })
      
      markers.push(marker)
    }
  })
}

const saveRelayPoint = async () => {
  try {
    isSubmitting.value = true
    
    const data = {
      ...relayForm.value,
      lockerCount: relayForm.value.type === 'locker' ? relayForm.value.lockerCount : null
    }
    
    if (showEditModal.value) {
      await api.put(`/relay-points/${editingRelayPoint.value.id}`, data)
      showToast('Point relais modifié avec succès', 'success')
    } else {
      await api.post('/relay-points', data)
      showToast('Point relais créé avec succès', 'success')
    }
    
    closeModals()
    fetchRelayPoints()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const editRelayPoint = (relayPoint) => {
  editingRelayPoint.value = relayPoint
  relayForm.value = {
    name: relayPoint.name,
    externalId: relayPoint.externalId || '',
    type: relayPoint.type,
    carrier: relayPoint.carrier,
    address: { ...relayPoint.address },
    postalCode: relayPoint.postalCode,
    city: relayPoint.city,
    country: relayPoint.country || 'France',
    coordinates: {
      lat: relayPoint.coordinates?.coordinates[1] || 48.8566,
      lng: relayPoint.coordinates?.coordinates[0] || 2.3522
    },
    phone: relayPoint.phone || '',
    email: relayPoint.email || '',
    services: relayPoint.services || [],
    maxPackageWeight: relayPoint.maxPackageWeight || 30,
    parkingAvailable: relayPoint.parkingAvailable || false,
    wheelchairAccessible: relayPoint.wheelchairAccessible || false,
    lockerCount: relayPoint.lockerCount,
    isActive: relayPoint.isActive
  }
  showEditModal.value = true
  
  nextTick(() => {
    initModalMap()
  })
}

const deleteRelayPoint = async (relayPoint) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le point relais ${relayPoint.name} ?`)) {
    return
  }
  
  try {
    await api.delete(`/relay-points/${relayPoint.id}`)
    showToast('Point relais supprimé avec succès', 'success')
    fetchRelayPoints()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error')
  }
}

const viewRelayPointDetails = async (relayPoint) => {
  try {
    const [detailsResponse, analyticsResponse] = await Promise.all([
      api.get(`/relay-points/${relayPoint.id}`),
      api.get(`/relay-points/${relayPoint.id}/analytics`, { params: { period: '30d' } })
    ])
    
    selectedRelayPoint.value = {
      ...detailsResponse.data.data.relayPoint,
      analytics: analyticsResponse.data.data.analytics
    }
    showDetailsModal.value = true
    
    // Update chart
    setTimeout(() => {
      updateOrdersChart()
    }, 100)
  } catch (error) {
    showToast('Erreur lors du chargement des détails', 'error')
  }
}

const updateOrdersChart = () => {
  if (!selectedRelayPoint.value?.analytics) return
  
  if (ordersChart) ordersChart.destroy()
  
  const ctx = document.querySelector('[ref="ordersChart"]')
  if (ctx) {
    const orderData = selectedRelayPoint.value.analytics.orderStats || []
    
    ordersChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: orderData.map(d => formatDate(d.date)),
        datasets: [{
          label: 'Commandes',
          data: orderData.map(d => d.orderCount),
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
}

const exportData = () => {
  // Create CSV content
  const headers = ['Nom', 'Type', 'Transporteur', 'Adresse', 'Code Postal', 'Ville', 'Statut', 'Capacité', 'Note']
  const rows = relayPoints.value.map(rp => [
    rp.name,
    getTypeLabel(rp.type),
    rp.carrier,
    rp.address.street,
    rp.postalCode,
    rp.city,
    rp.isActive ? 'Actif' : 'Inactif',
    rp.capacity ? `${rp.capacity.currentPackages}/${rp.capacity.maxPackagesPerDay}` : '-',
    rp.ratings?.average ? rp.ratings.average.toFixed(1) : '-'
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
  a.download = `relay_points_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingRelayPoint.value = null
  relayForm.value = {
    name: '',
    externalId: '',
    type: 'post_office',
    carrier: 'La Poste',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    postalCode: '',
    city: '',
    country: 'France',
    coordinates: {
      lat: 48.8566,
      lng: 2.3522
    },
    phone: '',
    email: '',
    services: [],
    maxPackageWeight: 30,
    parkingAvailable: false,
    wheelchairAccessible: false,
    lockerCount: null,
    isActive: true
  }
}

const goToPage = (page) => {
  pagination.value.currentPage = page
  fetchRelayPoints()
}

// Utility functions
const getTypeLabel = (type) => {
  const labels = {
    post_office: 'Bureau de poste',
    partner_shop: 'Commerce partenaire',
    locker: 'Consigne automatique'
  }
  return labels[type] || type
}

const getCapacityClass = (capacity) => {
  const percentage = (capacity.currentPackages / capacity.maxPackagesPerDay) * 100
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-orange-500'
  return 'bg-green-500'
}

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
    fetchRelayPoints()
  }, 300)
}

// Lifecycle
onMounted(() => {
  fetchRelayPoints()
})

// Watchers
watch(viewMode, (newMode) => {
  if (newMode === 'map') {
    nextTick(() => {
      initGoogleMaps()
    })
  }
})

watch([showCreateModal, showEditModal], ([create, edit]) => {
  if (create || edit) {
    nextTick(() => {
      initModalMap()
    })
  }
})

// Cleanup
watch(showDetailsModal, (newVal) => {
  if (!newVal && ordersChart) {
    ordersChart.destroy()
    ordersChart = null
  }
})
</script>