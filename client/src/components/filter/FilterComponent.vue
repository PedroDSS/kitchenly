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
    result[filterKey] = ['Tout', ...new Set(
        props.filteredProducts
            .map(product => product[field])
            .filter(value => value !== undefined && value !== null && value !== '')
    )];
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
  if (route.query.minPrice) minPrice.value = route.query.minPrice;
  if (route.query.maxPrice) maxPrice.value = route.query.maxPrice;
});
</script>

<template>
  <div>
    <!-- Filtre de prix -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Prix</h3>
      <div class="flex flex-col items-center">
        <input
            type="range"
            min="0"
            max="1OOOO"
            v-model="minPrice"
            @input="updatePriceFilter"
            class="w-4/5 mb-2"
        />
        <input
            type="range"
            min="0"
            max="10000"
            v-model="maxPrice"
            @input="updatePriceFilter"
            class="w-4/5 mb-2"
        />
        <div class="text-sm">
          Min: {{ minPrice }} €
        </div>
        <div class="text-sm">
          Max: {{ maxPrice }} €
        </div>
      </div>
    </div>
    <!-- Autres filtres -->
    <div v-for="(options, filterKey) in availableFilters" :key="filterKey" class="mb-6">
      <h3 class="text-lg font-semibold mb-2">{{ customTitles[filterKey] }}</h3>
      <div v-for="option in options" :key="option" class="mb-1">
        <label :class="{ 'cursor-not-allowed text-gray-500': isDisabled(filterKey, option) }">
          <input
              type="checkbox"
              :value="option"
              @change="updateFilter(filterKey, option)"
              :checked="isChecked(filterKey, option)"
              :disabled="isDisabled(filterKey, option)"
              class="mr-2"
          />
          {{ option }}
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="checkbox"]:disabled + label {
  color: #888;
}
</style>
