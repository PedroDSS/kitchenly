<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Kitchenly</h1>
        <p class="text-gray-600 mt-2">Électroménager de luxe pour votre cuisine</p>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Bienvenue chez Kitchenly</h2>
        <p class="text-gray-600 mb-8">Votre boutique en ligne d'électroménager de luxe</p>
        
        <div class="flex justify-center space-x-4">
          <router-link 
            to="/products" 
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Parcourir les produits
          </router-link>
          <router-link 
            to="/login" 
            class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Se connecter
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page d'accueil
</script>