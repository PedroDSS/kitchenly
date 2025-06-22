<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div class="flex items-center space-x-4">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <UserIcon class="w-10 h-10 text-blue-600" />
            </div>
            <div class="text-white">
              <h1 class="text-2xl font-bold">{{ user?.firstName }} {{ user?.lastName }}</h1>
              <p class="text-blue-100">{{ user?.email }}</p>
              <p class="text-blue-100 capitalize">{{ user?.role }} Account</p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Personal Information</h2>
              <button
                v-if="!isEditingPersonal"
                @click="isEditingPersonal = true"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>

            <form v-if="isEditingPersonal" @submit.prevent="handlePersonalInfoSubmit" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    v-model="personalForm.firstName"
                    type="text"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    v-model="personalForm.lastName"
                    type="text"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="personalForm.email"
                  type="email"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Changing your email will require confirmation
                </p>
              </div>

              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="isSubmittingPersonal"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <LoadingSpinner v-if="isSubmittingPersonal" size="sm" variant="white" customClass="mr-2" />
                  Save Changes
                </button>
                <button
                  type="button"
                  @click="cancelPersonalEdit"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div v-else class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ user?.firstName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ user?.lastName }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email Address</label>
                <p class="mt-1 text-sm text-gray-900">{{ user?.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Account Type</label>
                <p class="mt-1 text-sm text-gray-900 capitalize">{{ user?.role }}</p>
              </div>
              <div v-if="user?.createdAt">
                <label class="block text-sm font-medium text-gray-700">Member Since</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div v-else-if="activeTab === 'security'" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Security Settings</h2>

            <!-- Change Password -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Password</h3>
                  <p class="text-sm text-gray-600">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button
                  v-if="!isChangingPassword"
                  @click="isChangingPassword = true"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Change Password
                </button>
              </div>

              <form v-if="isChangingPassword" @submit.prevent="handlePasswordChange" class="space-y-4">
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    type="password"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  
                  <!-- Password Requirements -->
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 mb-2">Password must contain:</p>
                    <ul class="space-y-1">
                      <li class="flex items-center text-xs">
                        <CheckIcon
                          v-if="passwordChecks.minLength"
                          class="h-4 w-4 text-green-500 mr-2"
                        />
                        <XMarkIcon
                          v-else
                          class="h-4 w-4 text-gray-400 mr-2"
                        />
                        <span :class="passwordChecks.minLength ? 'text-green-700' : 'text-gray-600'">
                          At least 12 characters
                        </span>
                      </li>
                      <li class="flex items-center text-xs">
                        <CheckIcon
                          v-if="passwordChecks.uppercase"
                          class="h-4 w-4 text-green-500 mr-2"
                        />
                        <XMarkIcon
                          v-else
                          class="h-4 w-4 text-gray-400 mr-2"
                        />
                        <span :class="passwordChecks.uppercase ? 'text-green-700' : 'text-gray-600'">
                          One uppercase letter (A-Z)
                        </span>
                      </li>
                      <li class="flex items-center text-xs">
                        <CheckIcon
                          v-if="passwordChecks.lowercase"
                          class="h-4 w-4 text-green-500 mr-2"
                        />
                        <XMarkIcon
                          v-else
                          class="h-4 w-4 text-gray-400 mr-2"
                        />
                        <span :class="passwordChecks.lowercase ? 'text-green-700' : 'text-gray-600'">
                          One lowercase letter (a-z)
                        </span>
                      </li>
                      <li class="flex items-center text-xs">
                        <CheckIcon
                          v-if="passwordChecks.number"
                          class="h-4 w-4 text-green-500 mr-2"
                        />
                        <XMarkIcon
                          v-else
                          class="h-4 w-4 text-gray-400 mr-2"
                        />
                        <span :class="passwordChecks.number ? 'text-green-700' : 'text-gray-600'">
                          One number (0-9)
                        </span>
                      </li>
                      <li class="flex items-center text-xs">
                        <CheckIcon
                          v-if="passwordChecks.special"
                          class="h-4 w-4 text-green-500 mr-2"
                        />
                        <XMarkIcon
                          v-else
                          class="h-4 w-4 text-gray-400 mr-2"
                        />
                        <span :class="passwordChecks.special ? 'text-green-700' : 'text-gray-600'">
                          One special character (!@#$%^&*...)
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    v-model="passwordForm.confirmNewPassword"
                    type="password"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  
                  <!-- Password Match Indicator -->
                  <div v-if="passwordForm.confirmNewPassword" class="mt-1 flex items-center text-xs">
                    <CheckIcon
                      v-if="passwordsMatch"
                      class="h-4 w-4 text-green-500 mr-2"
                    />
                    <XMarkIcon
                      v-else
                      class="h-4 w-4 text-red-500 mr-2"
                    />
                    <span :class="passwordsMatch ? 'text-green-700' : 'text-red-600'">
                      {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
                    </span>
                  </div>
                </div>

                <div class="flex space-x-3">
                  <button
                    type="submit"
                    :disabled="isSubmittingPassword || !passwordsMatch || !passwordValid"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <LoadingSpinner v-if="isSubmittingPassword" size="sm" variant="white" customClass="mr-2" />
                    Update Password
                  </button>
                  <button
                    type="button"
                    @click="cancelPasswordChange"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Privacy Tab -->
          <div v-else-if="activeTab === 'privacy'" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Privacy & Data</h2>

            <!-- Data Export -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Export Your Data</h3>
                  <p class="text-sm text-gray-600">
                    Download a copy of all your personal data stored in our system
                  </p>
                </div>
                <button
                  @click="exportData"
                  :disabled="isExportingData"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <LoadingSpinner v-if="isExportingData" size="sm" customClass="mr-2" />
                  <ArrowDownTrayIcon v-else class="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>

            <!-- Delete Account -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-red-900">Delete Account</h3>
                  <p class="text-sm text-red-700">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <ConfirmButton
                  @confirm="deleteAccount"
                  :loading="isDeletingAccount"
                  variant="danger"
                  confirm-text="DELETE"
                  button-text="Delete Account"
                  :confirm-message="'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  UserIcon,
  PencilIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ConfirmButton from '@/components/ConfirmButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

// State
const activeTab = ref('personal')
const isEditingPersonal = ref(false)
const isChangingPassword = ref(false)
const isSubmittingPersonal = ref(false)
const isSubmittingPassword = ref(false)
const isExportingData = ref(false)
const isDeletingAccount = ref(false)

const user = computed(() => authStore.user)

// Tabs
const tabs = [
  { id: 'personal', name: 'Personal Information' },
  { id: 'security', name: 'Security' },
  { id: 'privacy', name: 'Privacy & Data' }
]

// Forms
const personalForm = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Password validation
const passwordChecks = computed(() => {
  const password = passwordForm.value.newPassword
  return {
    minLength: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
})

const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmNewPassword && 
         passwordForm.value.confirmNewPassword.length > 0
})

const passwordValid = computed(() => {
  return Object.values(passwordChecks.value).every(check => check)
})

// Methods
const initializePersonalForm = () => {
  if (user.value) {
    personalForm.value = {
      firstName: user.value.firstName || '',
      lastName: user.value.lastName || '',
      email: user.value.email || ''
    }
  }
}

const handlePersonalInfoSubmit = async () => {
  try {
    isSubmittingPersonal.value = true
    
    await authStore.updateProfile(personalForm.value)
    
    success('Profile updated successfully!')
    isEditingPersonal.value = false
  } catch (err: any) {
    error(err.response?.data?.message || 'Failed to update profile')
  } finally {
    isSubmittingPersonal.value = false
  }
}

const cancelPersonalEdit = () => {
  isEditingPersonal.value = false
  initializePersonalForm()
}

const handlePasswordChange = async () => {
  try {
    isSubmittingPassword.value = true
    
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    success('Password updated successfully!')
    cancelPasswordChange()
  } catch (err: any) {
    error(err.response?.data?.message || 'Failed to update password')
  } finally {
    isSubmittingPassword.value = false
  }
}

const cancelPasswordChange = () => {
  isChangingPassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  }
}

const exportData = async () => {
  try {
    isExportingData.value = true
    
    const response = await authStore.exportData()
    
    // Create and download file
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kitchenly-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    success('Data exported successfully!')
  } catch (err: any) {
    error(err.response?.data?.message || 'Failed to export data')
  } finally {
    isExportingData.value = false
  }
}

const deleteAccount = async () => {
  try {
    isDeletingAccount.value = true
    
    await authStore.deleteAccount()
    
    success('Account deleted successfully')
    router.push('/')
  } catch (err: any) {
    error(err.response?.data?.message || 'Failed to delete account')
  } finally {
    isDeletingAccount.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  initializePersonalForm()
})
</script>

<script lang="ts">
export default {
  name: 'ProfileView'
}
</script>