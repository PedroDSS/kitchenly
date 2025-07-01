<template>
  <div
    v-if="showModal"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative mx-4">
      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-3">Gestion des cookies</h2>
        <p class="text-gray-700 text-sm mb-4">
          Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
          Vous pouvez choisir quels types de cookies vous souhaitez accepter.
        </p>
      </div>

      <div class="space-y-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">Cookies essentiels</h3>
            <p class="text-xs text-gray-600">Nécessaires au fonctionnement du site</p>
          </div>
          <input
            type="checkbox"
            :checked="true"
            disabled
            class="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-not-allowed"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">Cookies analytiques</h3>
            <p class="text-xs text-gray-600">Pour comprendre l'utilisation du site</p>
          </div>
          <input
            v-model="preferences.analytics"
            type="checkbox"
            class="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">Cookies marketing</h3>
            <p class="text-xs text-gray-600">Pour personnaliser les publicités</p>
          </div>
          <input
            v-model="preferences.marketing"
            type="checkbox"
            class="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">Cookies fonctionnels</h3>
            <p class="text-xs text-gray-600">Pour des fonctionnalités améliorées</p>
          </div>
          <input
            v-model="preferences.functional"
            type="checkbox"
            class="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <Button
          @click="acceptAll"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Tout accepter
        </Button>
        <Button
          @click="acceptSelected"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
        >
          Accepter la sélection
        </Button>
        <Button
          @click="rejectAll"
          class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
        >
          Tout refuser
        </Button>
      </div>

      <div class="mt-4 text-center">
        <button
          @click="toggleDetails"
          class="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          {{ showDetails ? 'Masquer les détails' : 'Plus de détails' }}
        </button>
      </div>

      <div v-if="showDetails" class="mt-4 p-4 bg-gray-50 rounded text-sm">
        <h4 class="font-medium mb-2">Informations détaillées</h4>
        <p class="text-gray-700 mb-2">
          Conformément au RGPD, vous avez le droit de contrôler l'utilisation de vos données.
        </p>
        <ul class="text-gray-600 text-xs space-y-1">
          <li>• Les cookies essentiels sont nécessaires au bon fonctionnement du site</li>
          <li>• Les cookies analytiques nous aident à améliorer nos services</li>
          <li>• Les cookies marketing permettent la personnalisation publicitaire</li>
          <li>• Les cookies fonctionnels améliorent votre expérience utilisateur</li>
        </ul>
        <p class="text-xs text-gray-600 mt-2">
          Vous pouvez modifier vos préférences à tout moment dans les paramètres.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'

const cookieStore = useCookieConsentStore()

const showDetails = ref(false)

const preferences = ref({
  analytics: true,
  marketing: false,
  functional: true
})

const showModal = computed(() => cookieStore.showModal)

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const acceptAll = () => {
  cookieStore.acceptAll()
}

const acceptSelected = () => {
  cookieStore.acceptSelected({
    essential: true,
    analytics: preferences.value.analytics,
    marketing: preferences.value.marketing,
    functional: preferences.value.functional
  })
}

const rejectAll = () => {
  cookieStore.rejectAll()
}
</script>