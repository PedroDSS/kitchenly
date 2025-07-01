<script setup lang="ts">
import Footer from '@/components/common/FooterComponent.vue'
import CardSellComponent from '@/components/CardSellComponent.vue';
import CardCategoryComponent from '@/components/CardCategoryComponent.vue';
import NewsletterComponent from '@/components/common/NewsletterComponent.vue';
import { useProductsStore } from '@/stores/productsStore';
import { onMounted } from 'vue';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
const productStore = useProductsStore();

onMounted(() => {
  productStore.fetchProducts();
});

</script>


<template>
  <div class="min-h-screen">
    <!-- Hero Section with Featured Products -->
    <section class="py-12 bg-gradient-to-b from-background to-muted/20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Découvrez notre sélection d'appareils <span class="text-primary">électroménagers</span>
          </h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des produits de qualité, performants et durables, pour répondre à tous vos besoins du quotidien
          </p>
        </div>
        
        <!-- Featured Products Carousel -->
        <div class="max-w-6xl mx-auto">
          <Carousel class="w-full">
            <CarouselContent class="-ml-2 md:-ml-4">
              <CarouselItem 
                v-for="product in productStore.randomProducts" 
                :key="product._id"
                class="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <CardSellComponent :product="product" />
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious class="hidden md:flex" />
            <CarouselNext class="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Les plus importants</h2>
          <p class="text-lg text-muted-foreground">
            Les appareils les plus utiles du quotidiens
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <CardCategoryComponent 
            cardLink="/category/Réfrigérateur"
            productImage="https://boulanger.scene7.com/is/image/Boulanger/8806095463773_h_f_l_0?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
            productCategory="Réfrigérateurs"
            productDescription="Frais, silencieux, et basse consommation"
            cardImageClass="h-48"
            cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
          />
          <CardCategoryComponent 
            cardLink="/category/Lave-linge"
            productImage="https://boulanger.scene7.com/is/image/Boulanger/8806095210315_h_f_l_0?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
            productCategory="Lave-linge"
            productDescription="Des cycles efficaces, des économies assurées"
            cardImageClass="h-48"
            cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
          />
        </div>

        <!-- Secondary Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardCategoryComponent 
            cardLink="/category/Aspirateur"
            productImage="https://boulanger.scene7.com/is/image/Boulanger/5025155096772_h_f_l_0?wid=120&hei=120&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
            productCategory="Aspirateur"
            productDescription="Performance et silence pour un nettoyage sans effort"
            cardImageClass="h-48"
            cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
          />
          <CardCategoryComponent 
            cardLink="/category/Cafetière"
            productImage="https://boulanger.scene7.com/is/image/Boulanger/3576160025544_h_f_l_0?wid=120&hei=120&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
            productCategory="Petit électroménager"
            productDescription="Cafetières, grille-pains, robots... tout pour la cuisine"
            cardImageClass="h-48"
            cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
          />
          <CardCategoryComponent 
            cardLink="/category/Four"
            productImage="https://boulanger.scene7.com/is/image/Boulanger/3660767969315_h_f_l_0?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
            productCategory="Fours"
            productDescription="Pour des plats savoureux au quotidien"
            cardImageClass="h-48"
            cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
          />
        </div>
      </div>
    </section>

    <!-- Additional Categories Section -->
    <section class="py-16 bg-muted/20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Autres catégories</h2>
          <p class="text-lg text-muted-foreground">
            Ne passez pas à côté de ces produits tout aussi essentiels.
          </p>
        </div>

        <!-- Mixed Layout -->
        <div class="space-y-6">
          <!-- First Row - 2 columns on desktop -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardCategoryComponent 
              cardLink="/category/Micro-ondes"
              productImage="https://boulanger.scene7.com/is/image/Boulanger/8003437861789_h_f_l_0?wid=120&hei=120&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
              productCategory="Micro-ondes"
              productDescription="Pour des plats rapides"
              cardImageClass="h-48"
              cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
            />
            <CardCategoryComponent 
              cardLink="/category/Lave-Vaisselle"
              productImage="https://boulanger.scene7.com/is/image/Boulanger/8059019093543_h_f_l_0?wid=120&hei=120&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
              productCategory="Lave-vaisselle"
              productDescription="Silencieux, puissant, et économe en eau"
              cardImageClass="h-48"
              cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
            />
          </div>

          <!-- Second Row - 3 columns on desktop -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardCategoryComponent 
              cardLink="/category/Cuisinières"
              productImage="https://boulanger.scene7.com/is/image/Boulanger/7332543846184_h_f_l_0?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
              productCategory="Cuisinières"
              productDescription="Préparez vos plats préférés avec nos cuisinières multifonctions au design élégant."
              cardImageClass="h-48"
              cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
            />
            <CardCategoryComponent 
              cardLink="/category/Climatiseur"
              productImage="https://boulanger.scene7.com/is/image/Boulanger/7332857502424_h_f_l_0?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
              productCategory="Climatiseur"
              productDescription="Gardez votre intérieur frais même en été"
              cardImageClass="h-48"
              cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
            />
            <CardCategoryComponent 
              cardLink="/category/Robot-Cuisine"
              productImage="https://boulanger.scene7.com/is/image/Boulanger/5413184120962_h_f_l_0?wid=120&hei=120&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha"
              productCategory="Robot de cuisine"
              productDescription="L’assistant idéal pour toutes vos recettes"
              cardImageClass="h-48"
              cardClass="w-full h-80 transform transition-transform duration-200 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="container mx-auto px-4">
        <NewsletterComponent />
      </div>
    </section>


    <Footer />
  </div>
</template>