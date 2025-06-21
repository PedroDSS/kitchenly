<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Page non trouvée</h2>
      <p class="text-gray-600 mb-8">La page que vous cherchez n'existe pas.</p>
      
      <router-link 
        to="/" 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page 404
</script>