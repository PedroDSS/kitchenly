<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductsStore } from '@/stores/productsStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { CircleUser, Search, ShoppingCart, Menu, X } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const productStore = useProductsStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const searchQuery = ref("");
const showSuggestions = ref(false);
const isSearchFocused = ref(false);

onMounted(() => {
  productStore.fetchProducts();
  if (route.query.query) {
    productStore.searchProductByTitleOrDescription(route.query.query);
  }
});

const handleSearch = async () => {
  if (searchQuery.value.trim() !== "") {
    await productStore.searchProductByTitleOrDescription(searchQuery.value);
    router.push({ path: "/products", query: { query: searchQuery.value } });
    showSuggestions.value = false;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

const isLoggedIn = computed(() => authStore.user !== null);

const handleSuggestionClick = (path: string) => {
  router.push(path);
  showSuggestions.value = false;
  searchQuery.value = "";
};

const dynamicSuggestions = computed(() => {
  const categories = productStore.productCategories;
  if (!searchQuery.value) {
    return categories.slice(0, 5).map(cat => ({ 
      label: cat, 
      path: `/category/${cat}` 
    }));
  }
  
  const filtered = categories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  
  return filtered.slice(0, 5).map(cat => ({ 
    label: cat, 
    path: `/category/${cat}` 
  }));
});
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <!-- Main Header -->
    <div class="container flex h-16 items-center px-4">
      <!-- Mobile Menu -->
      <div class="md:hidden">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon">
              <Menu class="h-5 w-5" />
              <span class="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
        <SheetContent side="left" class="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>
              <SheetClose as-child>
                <RouterLink to="/" class="flex items-center gap-2">
                  <img src="@/assets/Kitchenly-no-bg.png" class="h-16" alt="Kitchenly" />
                </RouterLink>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <nav class="flex flex-col gap-4 mt-8">
            <SheetClose as-child>
              <RouterLink 
                :to="`/products`" 
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
              >
                Tout les produits
              </RouterLink>
            </SheetClose>
            <h3 class="font-semibold text-sm text-muted-foreground px-2">Catégories</h3>
            <template v-for="category in productStore.productCategories" :key="category">
              <SheetClose as-child>
                <RouterLink 
                  :to="`/category/${category}`" 
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  {{ category }}
                </RouterLink>
              </SheetClose>
            </template>
          </nav>
        </SheetContent>
        </Sheet>
      </div>

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 md:mr-8">
        <img src="@/assets/Kitchenly-no-bg.png" class="h-10 md:h-12" alt="Kitchenly" />
      </RouterLink>

      <!-- Search Bar -->
      <div class="flex-1 flex items-center px-3">
        <form @submit.prevent="handleSearch" class="relative w-full max-w-lg mx-auto">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              v-model="searchQuery" 
              @focus="isSearchFocused = true; showSuggestions = true" 
              @blur="isSearchFocused = false; setTimeout(() => showSuggestions = false, 200)"
              type="search" 
              placeholder="Rechercher des produits..." 
              class="h-10 w-full rounded-full bg-muted/40 pl-10 pr-4 focus:bg-background"
            />
            
            <!-- Search Suggestions -->
            <transition name="fade">
              <div v-if="showSuggestions && (dynamicSuggestions.length > 0 || searchQuery)" 
                class="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-popover p-1 shadow-lg">
                <div v-if="searchQuery" class="px-3 py-2 text-sm text-muted-foreground">
                  Appuyez sur Entrée pour rechercher
                </div>
                <div v-if="dynamicSuggestions.length > 0" class="border-t pt-1">
                  <p class="px-3 py-1 text-xs text-muted-foreground">Catégories suggérées</p>
                  <button
                    v-for="suggestion in dynamicSuggestions"
                    :key="suggestion.path"
                    type="button"
                    @mousedown.prevent="handleSuggestionClick(suggestion.path)"
                    class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Search class="h-3 w-3" />
                    {{ suggestion.label }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </form>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <!-- User Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="relative">
              <CircleUser class="h-5 w-5" />
              <span class="sr-only">Compte utilisateur</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <template v-if="isLoggedIn">
              <DropdownMenuItem as-child>
                <RouterLink to="/account" class="flex items-center">
                  Mon compte
                </RouterLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <RouterLink to="/orders" class="flex items-center">
                  Mes commandes
                </RouterLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleLogout" class="text-destructive">
                Déconnexion
              </DropdownMenuItem>
            </template>
            <template v-else>
              <DropdownMenuItem as-child>
                <RouterLink to="/login" class="flex items-center">
                  Se connecter
                </RouterLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <RouterLink to="/register" class="flex items-center">
                  S'inscrire
                </RouterLink>
              </DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Cart -->
        <RouterLink to="/cart" class="relative">
          <Button variant="ghost" size="icon">
            <ShoppingCart class="h-5 w-5" />
            <span class="sr-only">Panier</span>
            <Badge 
              v-if="cartStore.cart.length" 
              class="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {{ cartStore.cart.length }}
            </Badge>
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- Category Navigation -->
    <nav class="hidden md:block border-t">
      <div class="container px-4">
        <div class="flex items-center gap-6 overflow-x-auto py-3 scrollbar-none">
          <RouterLink 
            :to="`/products`" 
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
          >
            Tout les produits
          </RouterLink>
          <RouterLink 
            v-for="category in productStore.productCategories" 
            :key="category"
            :to="`/category/${category}`" 
            class="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
            :class="{ 'text-primary': route.params.category === category }"
          >
            {{ category }}
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>