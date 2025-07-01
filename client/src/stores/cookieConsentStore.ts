import { defineStore } from 'pinia'

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

const COOKIE_CONSENT_KEY = 'kitchenly_cookie_consent'
const COOKIE_PREFERENCES_KEY = 'kitchenly_cookie_preferences'

export const useCookieConsentStore = defineStore('cookieConsent', {
  state: () => ({
    showModal: false,
    hasConsented: false,
    preferences: {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    } as CookiePreferences
  }),

  actions: {
    init() {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
      const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      
      if (consent === 'true') {
        this.hasConsented = true
        this.showModal = false
        
        if (preferences) {
          this.preferences = JSON.parse(preferences)
        }
      } else {
        this.showModal = true
      }
    },

    acceptAll() {
      this.preferences = {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true
      }
      this.saveConsent()
      this.enableCookies()
    },

    rejectAll() {
      this.preferences = {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false
      }
      this.saveConsent()
      this.enableCookies()
    },

    acceptSelected(preferences: CookiePreferences) {
      this.preferences = { ...preferences }
      this.saveConsent()
      this.enableCookies()
    },

    updatePreferences(preferences: Partial<CookiePreferences>) {
      this.preferences = { ...this.preferences, ...preferences }
      this.savePreferences()
      this.enableCookies()
    },

    saveConsent() {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
      this.savePreferences()
      this.hasConsented = true
      this.showModal = false
    },

    savePreferences() {
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(this.preferences))
    },

    enableCookies() {
      if (this.preferences.analytics) {
        this.enableAnalyticsCookies()
      }
      
      if (this.preferences.marketing) {
        this.enableMarketingCookies()
      }
      
      if (this.preferences.functional) {
        this.enableFunctionalCookies()
      }
    },

    enableAnalyticsCookies() {
      // Initialize Google Analytics or other analytics tools
      console.log('Analytics cookies enabled')
    },

    enableMarketingCookies() {
      // Initialize marketing tools (Facebook Pixel, Google Ads, etc.)
      console.log('Marketing cookies enabled')
    },

    enableFunctionalCookies() {
      // Enable functional features that use cookies
      console.log('Functional cookies enabled')
    },

    resetConsent() {
      localStorage.removeItem(COOKIE_CONSENT_KEY)
      localStorage.removeItem(COOKIE_PREFERENCES_KEY)
      this.hasConsented = false
      this.showModal = true
      this.preferences = {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false
      }
    },

    getCookieValue(name: string): string | null {
      if (!this.preferences.essential && name !== 'essential') {
        return null
      }
      
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null
      }
      return null
    },

    setCookie(name: string, value: string, days: number = 30, type: keyof CookiePreferences = 'essential') {
      if (!this.preferences[type]) {
        return
      }
      
      const expires = new Date()
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`
    },

    deleteCookie(name: string) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
  }
})