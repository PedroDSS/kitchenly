<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
    <!-- Panneau gauche - Hero -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      <div class="flex flex-col justify-between w-full p-12 z-10">
        <div>
          <router-link to="/" class="inline-flex items-center space-x-3 group">
            <div class="p-2 bg-white/10 backdrop-blur-sm rounded-lg group-hover:bg-white/20 transition-colors">
              <img src="/kitchenly-no-bg.png" alt="Kitchenly" class="h-8 w-auto filter brightness-0 invert" />
            </div>
            <span class="text-2xl font-bold text-white">Kitchenly</span>
          </router-link>
        </div>

        <div class="space-y-6">
          <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Le meilleur site de vente d'électroménager
          </h1>
          <p class="text-lg text-blue-100">
            Accédez à des offres exclusives sur les appareils électroménagers et gérez vos commandes facilement.
          </p>

          <div class="space-y-4 mt-8">
            <div class="flex items-center space-x-3 text-white">
              <div class="p-2 bg-white/10 rounded-lg">
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-blue-50">Produits connectés de marques renommées</span>
            </div>
            <div class="flex items-center space-x-3 text-white">
              <div class="p-2 bg-white/10 rounded-lg">
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-blue-50">Garantie 2 ans sur tous les produits</span>
            </div>
            <div class="flex items-center space-x-3 text-white">
              <div class="p-2 bg-white/10 rounded-lg">
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span class="text-blue-50">Livraison gratuite à partir de 299€</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center space-x-6">
            <div>
              <p class="text-3xl font-bold text-white">50K+</p>
              <p class="text-sm text-blue-100">Clients satisfaits</p>
            </div>
            <div>
              <p class="text-3xl font-bold text-white">1000+</p>
              <p class="text-sm text-blue-100">Produits</p>
            </div>
            <div>
              <p class="text-3xl font-bold text-white">4.8★</p>
              <p class="text-sm text-blue-100">Note moyenne</p>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-10"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
    </div>

    <!-- Panneau droit - Connexion -->
    <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div class="w-full space-y-8">
        <!-- Logo mobile -->
        <div class="lg:hidden text-center">
          <router-link to="/" class="inline-flex items-center justify-center space-x-3">
            <div class="p-2 bg-blue-600 rounded-lg">
              <img src="/kitchenly-no-bg.png" alt="Kitchenly" class="h-8 w-auto filter brightness-0 invert" />
            </div>
            <span class="text-2xl font-bold text-gray-900">Kitchenly</span>
          </router-link>
        </div>

        <!-- Formulaire de connexion -->
        <div class="bg-white shadow-xl rounded-3xl p-10 space-y-8">
          <div class="text-center">
            <h2 class="text-3xl font-extrabold text-gray-900">Connexion à votre compte</h2>
            <p class="mt-2 text-sm text-gray-600">
              Pas encore inscrit ?
              <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-700">
                Créez un compte
              </router-link>
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
              <input
                id="email"
                v-model="values.email"
                type="email"
                required
                :disabled="isLocked"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                :class="{ 'border-red-300 ring-red-500': errors.email }"
                placeholder="votre@email.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="values.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="isLocked"
                  class="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                  :class="{ 'border-red-300 ring-red-500': errors.password }"
                  placeholder="Votre mot de passe"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-2 text-sm">
                <input type="checkbox" v-model="rememberMe"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span>Se souvenir de moi</span>
              </label>
              <router-link to="/forgot-password"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium">Mot de passe oublié ?</router-link>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || isLocked || !isValid"
              class="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition">
              <LoadingSpinner v-if="isSubmitting" size="sm" variant="white" />
              <span v-else>Se connecter</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const values = ref({ email: '', password: '' })
const errors = ref({})
const rememberMe = ref(false)
const showPassword = ref(false)
const isSubmitting = ref(false)
const isLocked = ref(false)
const isValid = ref(true)

const handleSubmit = () => {
  // Validation and API call
}
</script>