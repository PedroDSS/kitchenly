<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProductsStore } from '@/stores/productsStore';
import { debounce } from 'lodash';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  filteredProducts: {
    type: Array,
    required: true
  }
});

const productStore = useProductsStore();
const route = useRoute();
const router = useRouter();

const filters = {
  brand: 'brand',
  series: 'series',
  itemModelNumber: 'itemModelNumber',
  powerConsumption: 'powerConsumption',
  voltage: 'voltage',
  capacity: 'capacity',
  dimensions: 'dimensions',
  color: 'color',
  energyEfficiencyClass: 'energyEfficiencyClass',
  noiseLevel: 'noiseLevel',
  weight: 'weight',
  warranty: 'warranty',
  material: 'material'
};

const customTitles = {
  brand: 'Marque',
  series: 'Modèle',
  itemModelNumber: 'Numéro de modèle',
  powerConsumption: 'Consommation éléctrique',
  voltage: 'Tension',
  capacity: 'Capacité (L / Kg)',
  dimensions: 'Dimensions (HxLxP)',
  color: 'Couleur',
  energyEfficiencyClass: 'Classe Energétique',
  noiseLevel: 'Nuisance Sonore',
  weight: 'Poids du produit (kg)',
  warranty: 'Garantie',
  material: 'Matériaux'
};

const availableFilters = computed(() => {
  const result = {};
  for (const [filterKey, field] of Object.entries(filters)) {
    // Use all products from store instead of filtered products to prevent options from disappearing
    const allProducts = productStore.products.length > 0 ? productStore.products : props.filteredProducts;
    const uniqueValues = new Set(
        allProducts
            .map(product => product[field])
            .filter(value => value !== undefined && value !== null && value !== '')
    );
    
    // Only show filters that have options available
    if (uniqueValues.size > 0) {
      result[filterKey] = ['Tout', ...Array.from(uniqueValues).sort()];
    }
  }
  return result;
});

const minPrice = ref(0);
const maxPrice = ref(10000);

const updatePriceFilter = () => {
  productStore.filters.minPrice = minPrice.value;
  productStore.filters.maxPrice = maxPrice.value;
  updateURLWithFilters();
  debouncedFetchFilteredProducts();
};

const resetAllFilters = () => {
  // Reset all filters to empty arrays
  Object.keys(productStore.filters).forEach(filterKey => {
    if (Array.isArray(productStore.filters[filterKey])) {
      productStore.filters[filterKey] = [];
    }
  });
  
  // Reset price range
  minPrice.value = 0;
  maxPrice.value = 10000;
  
  // Ensure price filters exist in store and reset them
  if (!productStore.filters.hasOwnProperty('minPrice')) {
    productStore.filters.minPrice = 0;
  } else {
    productStore.filters.minPrice = 0;
  }
  
  if (!productStore.filters.hasOwnProperty('maxPrice')) {
    productStore.filters.maxPrice = 10000;
  } else {
    productStore.filters.maxPrice = 10000;
  }
  
  updateURLWithFilters();
  debouncedFetchFilteredProducts();
};

const hasActiveFilters = computed(() => {
  // Check array filters (brand, series, etc.)
  const hasArrayFilters = Object.keys(productStore.filters).some(filterKey => {
    const filterValue = productStore.filters[filterKey];
    return Array.isArray(filterValue) && filterValue.length > 0;
  });
  
  // Check price filters - use local reactive values which are the source of truth
  const hasPriceFilter = minPrice.value > 0 || maxPrice.value < 10000;
  
  return hasArrayFilters || hasPriceFilter;
});

const isChecked = (filterType, value) => {
  return productStore.filters[filterType].includes(value) || (value === 'Tout' && productStore.filters[filterType].length === 0);
};

const isDisabled = (filterType, value) => {
  return value === 'Tout';
};

const updateFilter = (filterType, value) => {
  if (value !== 'Tout') {
    if (productStore.filters[filterType].includes(value)) {
      productStore.filters[filterType] = productStore.filters[filterType].filter(v => v !== value);
    } else {
      productStore.filters[filterType].push(value);
    }
  } else {
    productStore.filters[filterType] = [];
  }

  updateURLWithFilters();
  debouncedFetchFilteredProducts();
};

const updateURLWithFilters = () => {
  const query = { ...route.query };

  Object.keys(productStore.filters).forEach(filterKey => {
    if (productStore.filters[filterKey].length > 0) {
      query[filterKey] = productStore.filters[filterKey].map(value => encodeURIComponent(value)).join(',');
    } else {
      delete query[filterKey];
    }
  });

  query.minPrice = minPrice.value;
  query.maxPrice = maxPrice.value;

  router.push({ query }).catch(err => { });
};

const debouncedFetchFilteredProducts = debounce(() => {
  if (route.query.query) {
    productStore.searchProductByTitleOrDescription(route.query.query);
  } else {
    productStore.fetchFilteredProducts();
  }
}, 300);

watch(() => productStore.filters, (newFilters) => {
  debouncedFetchFilteredProducts();
}, { deep: true });

onMounted(() => {
  if (route.query.minPrice) {
    minPrice.value = parseInt(route.query.minPrice as string) || 0;
  }
  if (route.query.maxPrice) {
    maxPrice.value = parseInt(route.query.maxPrice as string) || 10000;
  }
});
</script>

<template>
  <div class="p-4 space-y-6 max-h-screen overflow-y-auto">
    <!-- Reset button -->
    <div v-if="hasActiveFilters" class="sticky top-0 z-10 bg-white border border-red-200 rounded-lg p-3 mb-4">
      <button 
        @click="resetAllFilters"
        class="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Réinitialiser tous les filtres
      </button>
    </div>

    <!-- Filtre de prix -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Prix</h3>
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600">Prix minimum</label>
          <div class="relative">
            <input
                type="range"
                min="0"
                max="10000"
                v-model="minPrice"
                @input="updatePriceFilter"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0€</span>
              <span class="font-medium text-gray-700">{{ minPrice }}€</span>
              <span>10000€</span>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600">Prix maximum</label>
          <div class="relative">
            <input
                type="range"
                min="0"
                max="10000"
                v-model="maxPrice"
                @input="updatePriceFilter"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0€</span>
              <span class="font-medium text-gray-700">{{ maxPrice }}€</span>
              <span>10000€</span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <span class="text-sm font-medium text-gray-700">
            {{ minPrice }}€ - {{ maxPrice }}€
          </span>
        </div>
      </div>
    </div>

    <!-- Autres filtres -->
    <div v-for="(options, filterKey) in availableFilters" :key="filterKey" class="bg-white rounded-lg border border-gray-200 p-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
        {{ customTitles[filterKey] }}
        <span class="text-sm font-normal text-gray-500 ml-2">({{ options.length - 1 }} options)</span>
      </h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="option in options" :key="option" class="flex items-center">
          <label 
            :class="[
              'flex items-center w-full p-2 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-gray-50',
              { 'cursor-not-allowed opacity-50': isDisabled(filterKey, option) },
              { 'bg-blue-50 border border-blue-200': isChecked(filterKey, option) && !isDisabled(filterKey, option) }
            ]"
          >
            <input
                type="checkbox"
                :value="option"
                @change="updateFilter(filterKey, option)"
                :checked="isChecked(filterKey, option)"
                :disabled="isDisabled(filterKey, option)"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span class="ml-3 text-sm font-medium text-gray-700">{{ option }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="checkbox"]:disabled + label {
  color: #888;
}

/* Custom slider styles */
.slider::-webkit-slider-track {
  background: #e5e7eb;
  border-radius: 0.5rem;
  height: 0.5rem;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.slider::-moz-range-track {
  background: #e5e7eb;
  border-radius: 0.5rem;
  height: 0.5rem;
  border: none;
}

.slider::-moz-range-thumb {
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Scrollbar customization */
.space-y-2::-webkit-scrollbar {
  width: 6px;
}

.space-y-2::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.space-y-2::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.space-y-2::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation for filter sections */
.bg-white {
  transition: all 0.2s ease-in-out;
}

.bg-white:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
