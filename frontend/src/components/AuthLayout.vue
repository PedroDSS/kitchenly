<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header with Logo -->
    <header class="p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <router-link to="/" class="inline-flex items-center space-x-3 group">
          <div class="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/kitchenly-no-bg.png" alt="Kitchenly" class="h-8 w-auto" />
          </div>
          <span class="text-2xl font-bold text-gray-900">Kitchenly</span>
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div class="w-full max-w-7xl">
        <!-- Card Container -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <!-- Card Header (optional) -->
          <div v-if="title || $slots.header" class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <slot name="header">
              <h1 class="text-2xl font-bold text-white text-center">{{ title }}</h1>
            </slot>
          </div>

          <!-- Card Body -->
          <div class="p-8 sm:p-10">
            <slot />
          </div>
        </div>

        <!-- Footer Links -->
        <div v-if="$slots.footer" class="mt-6 text-center">
          <slot name="footer" />
        </div>
      </div>
    </main>

    <!-- Page Footer -->
    <footer class="py-6 text-center">
      <div class="space-y-3">
        <nav class="flex items-center justify-center space-x-6 text-sm">
          <a href="/terms" class="text-gray-600 hover:text-gray-900 transition-colors">
            Conditions d'utilisation
          </a>
          <span class="text-gray-300">•</span>
          <a href="/privacy" class="text-gray-600 hover:text-gray-900 transition-colors">
            Politique de confidentialité
          </a>
          <span class="text-gray-300">•</span>
          <a href="mailto:contact.kitchenly@gmail.com" class="text-gray-600 hover:text-gray-900 transition-colors">
            Support
          </a>
        </nav>
        <p class="text-xs text-gray-500">
          © {{ new Date().getFullYear() }} Kitchenly. Tous droits réservés.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<style scoped>
/* Ensure smooth transitions for all interactive elements */
a, button {
  transition: all 0.2s ease;
}
</style>