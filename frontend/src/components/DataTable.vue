<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header with actions -->
    <div class="px-4 py-3 border-b border-gray-200 sm:px-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <div v-if="selectedRows.length > 0" class="text-sm text-gray-500">
            {{ selectedRows.length }} selected
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Search -->
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- Bulk actions -->
          <div v-if="selectedRows.length > 0 && bulkActions.length > 0" class="relative">
            <button
              @click="showBulkActions = !showBulkActions"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Actions
              <ChevronDownIcon class="ml-2 w-4 h-4" />
            </button>
            <div
              v-if="showBulkActions"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
            >
              <div class="py-1">
                <button
                  v-for="action in bulkActions"
                  :key="action.key"
                  @click="handleBulkAction(action)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Export CSV -->
          <button
            v-if="enableExport"
            @click="exportToCsv"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- Select all checkbox -->
            <th v-if="enableMultiSelect" class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            
            <!-- Column headers -->
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              ]"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUpIcon
                    :class="[
                      'w-3 h-3',
                      sortKey === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'
                    ]"
                  />
                  <ChevronDownIcon
                    :class="[
                      'w-3 h-3 -mt-1',
                      sortKey === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'
                    ]"
                  />
                </div>
              </div>
            </th>
            
            <!-- Actions column -->
            <th v-if="actions.length > 0" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            :class="selectedRows.includes(getRowKey(item, index)) ? 'bg-blue-50' : 'hover:bg-gray-50'"
          >
            <!-- Select checkbox -->
            <td v-if="enableMultiSelect" class="px-6 py-4">
              <input
                type="checkbox"
                :checked="selectedRows.includes(getRowKey(item, index))"
                @change="toggleRowSelection(getRowKey(item, index))"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </td>
            
            <!-- Data cells -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getValue(item, column.key)"
                :column="column"
              >
                {{ getValue(item, column.key) }}
              </slot>
            </td>
            
            <!-- Action buttons -->
            <td v-if="actions.length > 0" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  @click="handleAction(action, item, index)"
                  :class="[
                    'inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded',
                    action.variant === 'danger' ? 
                      'text-red-700 bg-red-100 hover:bg-red-200' :
                    action.variant === 'warning' ? 
                      'text-yellow-700 bg-yellow-100 hover:bg-yellow-200' :
                      'text-blue-700 bg-blue-100 hover:bg-blue-200'
                  ]"
                >
                  <component :is="action.icon" v-if="action.icon" class="w-3 h-3 mr-1" />
                  {{ action.label }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty state -->
      <div v-if="filteredData.length === 0" class="text-center py-12">
        <div class="text-gray-500">
          <slot name="empty-state">
            No data available
          </slot>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="enablePagination && filteredData.length > pageSize" class="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredData.length) }} of {{ filteredData.length }} results
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-3 py-1 text-sm font-medium border rounded-md',
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
            class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface DataTableAction {
  key: string
  label: string
  icon?: Component
  variant?: 'primary' | 'danger' | 'warning'
}

export interface DataTableBulkAction {
  key: string
  label: string
}

export interface DataTableProps {
  data: any[]
  columns: DataTableColumn[]
  title?: string
  actions?: DataTableAction[]
  bulkActions?: DataTableBulkAction[]
  enableMultiSelect?: boolean
  enablePagination?: boolean
  enableExport?: boolean
  pageSize?: number
  rowKey?: string
}

const props = withDefaults(defineProps<DataTableProps>(), {
  title: 'Data Table',
  actions: () => [],
  bulkActions: () => [],
  enableMultiSelect: false,
  enablePagination: true,
  enableExport: true,
  pageSize: 10,
  rowKey: 'id'
})

const emit = defineEmits<{
  action: [action: DataTableAction, item: any, index: number]
  bulkAction: [action: DataTableBulkAction, selectedItems: any[]]
  export: [data: any[]]
}>()

// State
const searchQuery = ref('')
const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const selectedRows = ref<string[]>([])
const showBulkActions = ref(false)

// Computed properties
const filteredData = computed(() => {
  let result = [...props.data]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return props.columns.some(column => {
        const value = getValue(item, column.key)
        return String(value).toLowerCase().includes(query)
      })
    })
  }
  
  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = getValue(a, sortKey.value)
      const bVal = getValue(b, sortKey.value)
      
      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return result
})

const totalPages = computed(() => 
  Math.ceil(filteredData.value.length / props.pageSize)
)

const startIndex = computed(() => 
  (currentPage.value - 1) * props.pageSize
)

const endIndex = computed(() => 
  Math.min(startIndex.value + props.pageSize, filteredData.value.length)
)

const paginatedData = computed(() => 
  props.enablePagination 
    ? filteredData.value.slice(startIndex.value, endIndex.value)
    : filteredData.value
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const isAllSelected = computed(() => 
  paginatedData.value.length > 0 && 
  selectedRows.value.length === paginatedData.value.length
)

const isIndeterminate = computed(() => 
  selectedRows.value.length > 0 && 
  selectedRows.value.length < paginatedData.value.length
)

// Methods
const getValue = (item: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const getRowKey = (item: any, index: number) => {
  return getValue(item, props.rowKey) || index.toString()
}

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedData.value.map((item, index) => getRowKey(item, index))
  }
}

const toggleRowSelection = (rowKey: string) => {
  const index = selectedRows.value.indexOf(rowKey)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(rowKey)
  }
}

const handleAction = (action: DataTableAction, item: any, index: number) => {
  emit('action', action, item, index)
}

const handleBulkAction = (action: DataTableBulkAction) => {
  const selectedItems = filteredData.value.filter((item, index) => 
    selectedRows.value.includes(getRowKey(item, index))
  )
  emit('bulkAction', action, selectedItems)
  showBulkActions.value = false
}

const exportToCsv = () => {
  const csvData = [
    // Header row
    props.columns.map(col => col.label).join(','),
    // Data rows
    ...filteredData.value.map(item => 
      props.columns.map(col => {
        const value = getValue(item, col.key)
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.title.toLowerCase().replace(/\s+/g, '_')}_export.csv`
  link.click()
  window.URL.revokeObjectURL(url)
  
  emit('export', filteredData.value)
}

// Watch for search changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})

// Close bulk actions when clicking outside
watch(() => showBulkActions.value, (isOpen) => {
  if (isOpen) {
    const closeHandler = () => {
      showBulkActions.value = false
      document.removeEventListener('click', closeHandler)
    }
    setTimeout(() => document.addEventListener('click', closeHandler), 0)
  }
})
</script>

<script lang="ts">
export default {
  name: 'DataTable'
}
</script>