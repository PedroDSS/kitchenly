<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const route = useRoute()

// Routes that should not show the header/footer (auth pages)
const authRoutes = [
  'Login',
  'Register', 
  'EmailConfirmation',
  'ForgotPassword',
  'ResetPassword'
]

const showHeaderFooter = computed(() => {
  return !authRoutes.includes(route.name as string)
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <!-- Header for non-auth pages -->
    <Header v-if="showHeaderFooter" />
    
    <!-- Main content area with responsive layout -->
    <main id="main-content" class="w-full">
      <router-view />
    </main>
    
    <!-- Footer for non-auth pages -->
    <Footer v-if="showHeaderFooter" />
    
    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<style scoped>
/* Additional responsive styles if needed */
</style>
