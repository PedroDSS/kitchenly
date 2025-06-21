import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { Product, Category, Brand, ProductFilters, PaginatedResponse } from '@/types'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const brands = ref<Brand[]>([])
  const currentProduct = ref<Product | null>(null)
  const isLoading = ref(false)
  const searchLoading = ref(false)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const currentFilters = ref<ProductFilters>({})
  const searchQuery = ref('')
  const searchFacets = ref<any>({})

  // Getters
  const totalPages = computed(() => Math.ceil(totalProducts.value / pageSize.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // Actions
  const fetchProducts = async (filters: ProductFilters = {}, page: number = 1) => {
    try {
      isLoading.value = true
      currentPage.value = page
      currentFilters.value = filters
      
      const response: PaginatedResponse<Product> = await apiService.getProducts({
        ...filters,
        page,
        limit: pageSize.value
      })
      
      products.value = response.data
      totalProducts.value = response.total
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const searchProducts = async (query: string, filters: ProductFilters = {}, page: number = 1) => {
    try {
      searchLoading.value = true
      searchQuery.value = query
      currentPage.value = page
      currentFilters.value = filters
      
      const response = await apiService.searchProducts(query, {
        ...filters,
        page,
        limit: pageSize.value
      })
      
      products.value = response.products
      totalProducts.value = response.total
      searchFacets.value = response.facets
      
      return response
    } catch (error) {
      throw error
    } finally {
      searchLoading.value = false
    }
  }

  const fetchProduct = async (id: string) => {
    try {
      isLoading.value = true
      const product = await apiService.getProduct(id)
      currentProduct.value = product
      return product
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories()
      categories.value = categoriesData
      return categoriesData
    } catch (error) {
      throw error
    }
  }

  const fetchBrands = async () => {
    try {
      const brandsData = await apiService.getBrands()
      brands.value = brandsData
      return brandsData
    } catch (error) {
      throw error
    }
  }

  const nextPage = async () => {
    if (hasNextPage.value) {
      if (searchQuery.value) {
        await searchProducts(searchQuery.value, currentFilters.value, currentPage.value + 1)
      } else {
        await fetchProducts(currentFilters.value, currentPage.value + 1)
      }
    }
  }

  const prevPage = async () => {
    if (hasPrevPage.value) {
      if (searchQuery.value) {
        await searchProducts(searchQuery.value, currentFilters.value, currentPage.value - 1)
      } else {
        await fetchProducts(currentFilters.value, currentPage.value - 1)
      }
    }
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      if (searchQuery.value) {
        await searchProducts(searchQuery.value, currentFilters.value, page)
      } else {
        await fetchProducts(currentFilters.value, page)
      }
    }
  }

  const updateFilters = async (filters: ProductFilters) => {
    if (searchQuery.value) {
      await searchProducts(searchQuery.value, filters, 1)
    } else {
      await fetchProducts(filters, 1)
    }
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchFacets.value = {}
    currentFilters.value = {}
  }

  const getCategoryName = (categoryId: string): string => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category?.name || ''
  }

  const getBrandName = (brandId: string): string => {
    const brand = brands.value.find(b => b.id === brandId)
    return brand?.name || ''
  }

  return {
    // State
    products,
    categories,
    brands,
    currentProduct,
    isLoading,
    searchLoading,
    totalProducts,
    currentPage,
    pageSize,
    currentFilters,
    searchQuery,
    searchFacets,
    
    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Actions
    fetchProducts,
    searchProducts,
    fetchProduct,
    fetchCategories,
    fetchBrands,
    nextPage,
    prevPage,
    goToPage,
    updateFilters,
    clearSearch,
    getCategoryName,
    getBrandName
  }
})