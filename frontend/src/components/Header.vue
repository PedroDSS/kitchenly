<template>
  <header class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
    <div class="container">
      <div class="flex items-center justify-between py-3">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="p-1.5 rounded-lg transition-all duration-200 group-hover:bg-gray-50 dark:group-hover:bg-gray-700">
              <img 
                src="/kitchenly-no-bg.png" 
                alt="Kitchenly" 
                class="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Kitchenly</span>
          </router-link>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center space-x-8">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ 'active': $route.path === '/' }"
          >
            Accueil
          </router-link>
          <a href="#about" class="nav-link">À propos</a>
          
          <!-- Divider -->
          <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          
          <!-- Cart Icon -->
          <CartIcon :count="cartStore.itemCount" @click="navigateToCart" />
          
          <!-- Auth Section -->
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <div class="relative group">
                <button class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <UserIcon class="w-5 h-5" />
                  <span class="text-sm font-medium">{{ authStore.user?.firstName }}</span>
                  <ChevronDownIcon class="w-4 h-4" />
                </button>
                
                <!-- Dropdown Menu -->
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div class="py-2">
                    <router-link to="/profile" class="dropdown-item">
                      <UserCircleIcon class="w-4 h-4" />
                      Mon compte
                    </router-link>
                    <router-link to="/orders" class="dropdown-item">
                      <ClipboardDocumentListIcon class="w-4 h-4" />
                      Mes commandes
                    </router-link>
                    <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item">
                      <CogIcon class="w-4 h-4" />
                      Administration
                    </router-link>
                    <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <button @click="logout" class="dropdown-item text-red-600 dark:text-red-400 w-full text-left">
                      <ArrowRightOnRectangleIcon class="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <router-link to="/login" class="btn btn-primary btn-sm">
                Se connecter
              </router-link>
            </template>
          </div>
        </nav>
        
        <!-- Mobile Menu Button -->
        <div class="flex items-center space-x-3 lg:hidden">
          <CartIcon :count="cartStore.itemCount" @click="navigateToCart" class="lg:hidden" />
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div 
      v-if="mobileMenuOpen" 
      class="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <nav class="container py-4">
        <div class="space-y-1">
          <router-link to="/" class="mobile-nav-item" @click="mobileMenuOpen = false">
            <HomeIcon class="w-5 h-5" />
            Accueil
          </router-link>
          <a href="#about" class="mobile-nav-item" @click="mobileMenuOpen = false">
            <InformationCircleIcon class="w-5 h-5" />
            À propos
          </a>
          
          <div class="border-t border-gray-200 dark:border-gray-600 my-3"></div>
          
          <template v-if="authStore.isAuthenticated">
            <router-link to="/profile" class="mobile-nav-item" @click="mobileMenuOpen = false">
              <UserCircleIcon class="w-5 h-5" />
              Mon compte
            </router-link>
            <router-link to="/orders" class="mobile-nav-item" @click="mobileMenuOpen = false">
              <ClipboardDocumentListIcon class="w-5 h-5" />
              Mes commandes
            </router-link>
            <router-link v-if="authStore.isAdmin" to="/admin" class="mobile-nav-item" @click="mobileMenuOpen = false">
              <CogIcon class="w-5 h-5" />
              Administration
            </router-link>
            <button @click="logout; mobileMenuOpen = false" class="mobile-nav-item text-red-600 dark:text-red-400 w-full text-left">
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              Se déconnecter
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="mobile-nav-item text-primary-600 dark:text-primary-400" @click="mobileMenuOpen = false">
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              Se connecter
            </router-link>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import CartIcon from '@/components/CartIcon.vue'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CubeIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { toast } from '@/utils/toast'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

const navigateToCart = () => {
  router.push('/cart')
}

const logout = async () => {
  await authStore.logout()
  toast.success('Déconnexion réussie')
  router.push('/')
}
</script>

<script lang="ts">
export default {
  name: 'Header'
}
</script>