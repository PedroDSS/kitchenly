<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Main search bar -->
    <div class="p-4">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="handleSearch"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Quick search suggestions -->
      <div v-if="suggestions.length > 0 && showSuggestions" class="mt-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            @click="applySuggestion(suggestion)"
            class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Facets section -->
    <div v-if="facets.length > 0" class="border-t border-gray-200">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-900">Filters</h3>
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-for="facet in facets" :key="facet.key" class="space-y-2">
            <!-- Facet header -->
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">
                {{ facet.label }}
              </label>
              <button
                v-if="isFacetCollapsible(facet)"
                @click="toggleFacet(facet.key)"
                class="text-gray-400 hover:text-gray-600"
              >
                <ChevronDownIcon
                  :class="[
                    'w-4 h-4 transition-transform',
                    collapsedFacets.includes(facet.key) ? 'rotate-180' : ''
                  ]"
                />
              </button>
            </div>
            
            <!-- Facet content -->
            <div v-show="!collapsedFacets.includes(facet.key)" class="space-y-2">
              <!-- Range facet (price, rating, etc.) -->
              <div v-if="facet.type === 'range'" class="space-y-2">
                <div class="flex items-center space-x-2">
                  <input
                    v-model.number="rangeValues[facet.key].min"
                    type="number"
                    :placeholder="`Min ${facet.label.toLowerCase()}`"
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    @change="updateRangeFilter(facet.key)"
                  />
                  <span class="text-xs text-gray-500">to</span>
                  <input
                    v-model.number="rangeValues[facet.key].max"
                    type="number"
                    :placeholder="`Max ${facet.label.toLowerCase()}`"
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    @change="updateRangeFilter(facet.key)"
                  />
                </div>
              </div>
              
              <!-- Checkbox facet (categories, brands, etc.) -->
              <div v-else-if="facet.type === 'checkbox'" class="space-y-1">
                <div class="max-h-32 overflow-y-auto space-y-1">
                  <label
                    v-for="option in facet.options"
                    :key="option.value"
                    class="flex items-center text-sm"
                  >
                    <input
                      v-model="selectedFilters[facet.key]"
                      type="checkbox"
                      :value="option.value"
                      class="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      @change="updateCheckboxFilter(facet.key)"
                    />
                    <span class="ml-2 text-gray-700">{{ option.label }}</span>
                    <span v-if="option.count !== undefined" class="ml-auto text-xs text-gray-500">
                      ({{ option.count }})
                    </span>
                  </label>
                </div>
              </div>
              
              <!-- Radio facet (single selection) -->
              <div v-else-if="facet.type === 'radio'" class="space-y-1">
                <label
                  v-for="option in facet.options"
                  :key="option.value"
                  class="flex items-center text-sm"
                >
                  <input
                    v-model="selectedFilters[facet.key]"
                    type="radio"
                    :value="option.value"
                    class="h-3 w-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                    @change="updateRadioFilter(facet.key)"
                  />
                  <span class="ml-2 text-gray-700">{{ option.label }}</span>
                  <span v-if="option.count !== undefined" class="ml-auto text-xs text-gray-500">
                    ({{ option.count }})
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active filters display -->
    <div v-if="hasActiveFilters" class="border-t border-gray-200 p-4">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(filter, key) in activeFilters"
          :key="key"
          class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          <span>{{ formatActiveFilter(key, filter) }}</span>
          <button
            @click="removeFilter(key)"
            class="ml-1 text-blue-600 hover:text-blue-800"
          >
            <XMarkIcon class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

export interface SearchFacetOption {
  value: string | number
  label: string
  count?: number
}

export interface SearchFacet {
  key: string
  label: string
  type: 'checkbox' | 'radio' | 'range'
  options?: SearchFacetOption[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface SearchBarProps {
  placeholder?: string
  suggestions?: string[]
  facets?: SearchFacet[]
  initialQuery?: string
  initialFilters?: Record<string, any>
  showSuggestions?: boolean
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  placeholder: 'Search...',
  suggestions: () => [],
  facets: () => [],
  initialQuery: '',
  initialFilters: () => ({}),
  showSuggestions: true
})

const emit = defineEmits<{
  search: [query: string, filters: Record<string, any>]
  queryChange: [query: string]
  filtersChange: [filters: Record<string, any>]
  clear: []
}>()

// State
const searchQuery = ref(props.initialQuery)
const selectedFilters = reactive<Record<string, any>>({ ...props.initialFilters })
const rangeValues = reactive<Record<string, { min: number | null; max: number | null }>>({})
const collapsedFacets = ref<string[]>([])

// Initialize range values and collapsed state
props.facets.forEach(facet => {
  if (facet.type === 'range') {
    rangeValues[facet.key] = { min: null, max: null }
  }
  if (facet.type === 'checkbox' && !selectedFilters[facet.key]) {
    selectedFilters[facet.key] = []
  }
  if (facet.defaultCollapsed) {
    collapsedFacets.value.push(facet.key)
  }
})

// Computed properties
const hasActiveFilters = computed(() => {
  return Object.keys(activeFilters.value).length > 0
})

const activeFilters = computed(() => {
  const filters: Record<string, any> = {}
  
  // Add non-empty filters
  Object.entries(selectedFilters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      filters[key] = value
    } else if (!Array.isArray(value) && value !== null && value !== undefined && value !== '') {
      filters[key] = value
    }
  })
  
  // Add range filters
  Object.entries(rangeValues).forEach(([key, range]) => {
    if (range.min !== null || range.max !== null) {
      filters[key] = range
    }
  })
  
  return filters
})

// Methods
const handleSearch = () => {
  emit('search', searchQuery.value, activeFilters.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('queryChange', '')
  handleSearch()
}

const applySuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  emit('queryChange', suggestion)
  handleSearch()
}

const toggleFacet = (facetKey: string) => {
  const index = collapsedFacets.value.indexOf(facetKey)
  if (index > -1) {
    collapsedFacets.value.splice(index, 1)
  } else {
    collapsedFacets.value.push(facetKey)
  }
}

const isFacetCollapsible = (facet: SearchFacet) => {
  return facet.collapsible !== false
}

const updateCheckboxFilter = (facetKey: string) => {
  emit('filtersChange', activeFilters.value)
  handleSearch()
}

const updateRadioFilter = (facetKey: string) => {
  emit('filtersChange', activeFilters.value)
  handleSearch()
}

const updateRangeFilter = (facetKey: string) => {
  emit('filtersChange', activeFilters.value)
  handleSearch()
}

const removeFilter = (filterKey: string) => {
  if (Array.isArray(selectedFilters[filterKey])) {
    selectedFilters[filterKey] = []
  } else {
    selectedFilters[filterKey] = null
  }
  
  if (rangeValues[filterKey]) {
    rangeValues[filterKey] = { min: null, max: null }
  }
  
  emit('filtersChange', activeFilters.value)
  handleSearch()
}

const clearAllFilters = () => {
  // Clear all selected filters
  Object.keys(selectedFilters).forEach(key => {
    if (Array.isArray(selectedFilters[key])) {
      selectedFilters[key] = []
    } else {
      selectedFilters[key] = null
    }
  })
  
  // Clear all range values
  Object.keys(rangeValues).forEach(key => {
    rangeValues[key] = { min: null, max: null }
  })
  
  emit('filtersChange', {})
  emit('clear')
  handleSearch()
}

const formatActiveFilter = (key: string, filter: any) => {
  const facet = props.facets.find(f => f.key === key)
  if (!facet) return `${key}: ${JSON.stringify(filter)}`
  
  if (facet.type === 'range') {
    const { min, max } = filter
    if (min !== null && max !== null) {
      return `${facet.label}: ${min} - ${max}`
    } else if (min !== null) {
      return `${facet.label}: ${min}+`
    } else if (max !== null) {
      return `${facet.label}: ≤${max}`
    }
  } else if (Array.isArray(filter)) {
    return `${facet.label}: ${filter.length} selected`
  } else if (facet.options) {
    const option = facet.options.find(opt => opt.value === filter)
    return `${facet.label}: ${option?.label || filter}`
  }
  
  return `${facet.label}: ${filter}`
}

// Watchers
watch(searchQuery, (newQuery) => {
  emit('queryChange', newQuery)
})

watch(() => activeFilters.value, (newFilters) => {
  emit('filtersChange', newFilters)
}, { deep: true })
</script>

<script lang="ts">
export default {
  name: 'SearchBar'
}
</script>