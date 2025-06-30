<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { useProductsStore } from "@/stores/productsStore";
import { EditProductSchema } from "@/z-schemas/ProductSchema";

import Carousel from "@/components/ui/carousel/Carousel.vue";
import CarouselContent from "@/components/ui/carousel/CarouselContent.vue";
import CarouselItem from "@/components/ui/carousel/CarouselItem.vue";
import CarouselNext from "@/components/ui/carousel/CarouselNext.vue";
import CarouselPrevious from "@/components/ui/carousel/CarouselPrevious.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectLabel from "@/components/ui/select/SelectLabel.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import { useForm } from "@/composables/useForm";
import { watchOnce } from "@vueuse/core";
import { Save } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const productsStore = useProductsStore();
const router = useRouter();
const route = useRoute();
const productDetails = computed(() => productsStore.product);

type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "file"
  | "textarea"
  | "select";

interface ProductField {
  value: string | number | boolean | File[];
  type: FieldType;
  placeholder: string;
  selectLabel?: string;
  options?: string[];
}

const productId = route.params.id as string;
const files = ref<File[]>([]);
const emblaMainApi = ref<CarouselApi>();
const emblaThumbnailApi = ref<CarouselApi>();
const selectedIndex = ref(0);

function onSelect() {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) return;
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap();
  emblaThumbnailApi.value.scrollTo(emblaMainApi.value.selectedScrollSnap());
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) return;
  emblaMainApi.value.scrollTo(index);
}

watchOnce(emblaMainApi, (emblaMainApi) => {
  if (!emblaMainApi) return;

  onSelect();
  emblaMainApi.on("select", onSelect);
  emblaMainApi.on("reInit", onSelect);
});

const basicProductInfo = ref<Record<string, ProductField>>({
  product_photo: {
    value: [],
    type: "file",
    placeholder: "Ajouter des photos du produit...",
  },
  product_title: {
    value: "",
    type: "string",
    placeholder: "Saisir le titre du produit...",
  },
  product_price: {
    value: "",
    type: "number",
    placeholder: "Saisir le prix du produit...",
  },
  product_category: {
    value: "",
    type: "select",
    selectLabel: "Catégories",
    placeholder: "Choisir la catégorie du produit...",
    options: [
      "Réfrigérateur",
      "Lave-linge",
      "Four",
      "Micro-ondes",
      "Aspirateur",
      "Lave-vaisselle",
      "Climatiseur",
      "Cafetière",
    ],
  },
  delivery: {
    value: "",
    type: "string",
    placeholder: "Saisir le délai de livraison...",
  },
  product_stock: {
    value: "",
    type: "number",
    placeholder: "Saisir le stock du produit...",
  },
  active: {
    value: "",
    type: "select",
    selectLabel: "Options",
    placeholder: "Mise en vente...",
    options: ["Oui", "Non"],
  },
  product_description: {
    value: "",
    type: "textarea",
    placeholder: "Saisir la description du produit...",
  },
});

const productSpecifications = ref<Record<string, ProductField>>({
  brand: {
    value: "",
    type: "select",
    selectLabel: "Marque",
    placeholder: "Choisir la marque du produit...",
    options: [
      "Samsung",
      "LG",
      "Whirlpool",
      "Bosch",
      "Haier",
      "Siemens",
      "Electrolux",
      "Miele",
      "Panasonic",
      "Sharp",
      "Dyson",
      "Rowenta",
      "Philips",
      "Daikin",
      "Mitsubishi Electric",
      "Toshiba",
      "De'Longhi",
      "Nespresso",
      "Krups",
      "Breville"
    ],
  },
  itemModelNumber: {
    value: "",
    type: "string",
    placeholder: "Saisir le numéro de modèle...",
  },
  color: {
    value: "",
    type: "string",
    placeholder: "Saisir la couleur...",
  },
  powerConsumption: {
    value: "",
    type: "string",
    placeholder: "Saisir la consommation électrique (ex: 1500W)...",
  },
  voltage: {
    value: "",
    type: "string",
    placeholder: "Saisir la tension (ex: 220V)...",
  },
  capacity: {
    value: "",
    type: "string",
    placeholder: "Saisir la capacité (ex: 7kg, 350L)...",
  },
  dimensions: {
    value: "",
    type: "string",
    placeholder: "Saisir les dimensions (HxLxP)...",
  },
  weight: {
    value: "",
    type: "string",
    placeholder: "Saisir le poids...",
  },
  energyEfficiencyClass: {
    value: "",
    type: "string",
    placeholder: "Saisir la classe énergétique (ex: A++)...",
  },
  noiseLevel: {
    value: "",
    type: "string",
    placeholder: "Saisir le niveau sonore (ex: 55dB)...",
  },
  warranty: {
    value: "",
    type: "string",
    placeholder: "Saisir la garantie (ex: 2 ans)...",
  },
  material: {
    value: "",
    type: "string",
    placeholder: "Saisir le matériau (ex: Acier inoxydable)...",
  },
});

const additionalProductDetails = ref<Record<string, ProductField>>({
  series: { value: "", type: "string", placeholder: "Saisir la série..." },
  plugType: {
    value: "",
    type: "string",
    placeholder: "Saisir le type de prise éléctrique...",
  },
});

const flattenValues = (obj: Record<string, ProductField>) => {
  const result: Record<string, string | number | boolean | File[]> = {};

  for (const key in obj) {
    result[key] = obj[key].value;
  }
  return result;
};

const fetchProduct = async () => {
  await productsStore.getProductById(productId);
  const product = productsStore.product;
  for (const key in basicProductInfo.value) {
    if (product.hasOwnProperty(key)) {
      basicProductInfo.value[key].value = product[key];
    }
  }
  for (const key in productSpecifications.value) {
    if (product.hasOwnProperty(key)) {
      productSpecifications.value[key].value = product[key];
    }
  }
  for (const key in additionalProductDetails.value) {
    if (product.hasOwnProperty(key)) {
      additionalProductDetails.value[key].value = product[key];
    }
  }
  setValues(flattenValues(basicProductInfo.value));
  setValues(flattenValues(productSpecifications.value));
  setValues(flattenValues(additionalProductDetails.value));
};

onMounted(() => {
  fetchProduct();
});

const { values, errors, isSubmitting, httpError, handleSubmit, setValues } =
  useForm({
    schema: EditProductSchema,
    initialValues: {
      ...flattenValues(basicProductInfo.value),
      ...flattenValues(productSpecifications.value),
      ...flattenValues(additionalProductDetails.value),
    },
    onSubmit: async (values) => {
      if (files.value.length > 0) {
        await productsStore.updateProductImages(productId, values, files.value);
        await productsStore.updateProduct(productId, values);
      } else {
        await productsStore.updateProduct(productId, values);
      }

      if (productsStore.error) {
        errors["image_urls"] = productsStore.error;
      } else {
        router.push({ name: "AdminProducts" });
      }
    },
  });

const handleFileChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  files.value = Array.from(target.files || []);
};
const deleteImage = async (imageUrl: string) => {
  const image = await productsStore.getImageId(imageUrl);
  await productsStore.deleteProductImage(productId, image.imageId);
};

const getLabel = (key: string) => {
  switch (key) {
    case "product_title":
      return "Nom du produit*";
    case "product_description":
      return "Description du produit";
    case "product_price":
      return "Prix du produit*";
    case "product_star_rating":
      return "Évaluation du produit";
    case "product_url":
      return "URL du produit";
    case "product_photo":
      return "Photo du produit*";
    // case "product_minimum_offer_price":
    //   return "Prix minimum de l'offre*";
    case "product_category":
      return "Catégorie du produit*";
    case "is_best_seller":
      return "Meilleure vente";
    case "delivery":
      return "Livraison*";
    case "product_stock":
      return "Stock du produit*";
    case "brand":
      return "Marque";
    case "itemModelNumber":
      return "Numéro de modèle";
    case "color":
      return "Couleur";
    case "weight":
      return "Poids";
    case "powerConsumption":
      return "Consommation électrique";
    case "voltage":
      return "Tension électrique";
    case "capacity":
      return "Capacité";
    case "dimensions":
      return "Dimensions";
    case "energyEfficiencyClass":
      return "Classe énergétique";
    case "noiseLevel":
      return "Niveau sonore";
    case "warranty":
      return "Garantie";
    case "material":
      return "Matériau";
    case "plugType":
      return "Type de prise éléctrique";
    case "series":
      return "Numéro de série";
    default:
      return key;
  }
};
</script>

<template>
  <div class="flex justify-between w-full">
    <span class="flex flex-col">
      <span class="text-xl font-bold text-text-100">Modifier un produit</span>
      <span class="text-md text-text-200"
        >Modifiez les détails du produit.</span
      >
    </span>
    <Button
      class="button border bg-transparent text-text-100 border-accent-200 text-md font-medium hover:bg-primary-200 hover:text-white"
      @click="handleSubmit"
      :disabled="isSubmitting"
    >
      <Save class="icon w-6 h-6 mr-2 text-primary-200" />
      Enregistrer
    </Button>
  </div>

  <form @submit.prevent="handleSubmit" class="max-w-full flex flex-col mt-6">
    <div class="flex w-full gap-x-2">
      <div class="flex flex-col w-1/2 gap-y-2">
        <Card class="h-fit p-3">
          <CardHeader class="p-2">
            <CardTitle class="text-text-100 font-medium text-md mb-4"
              >Informations de base</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div
                v-for="(field, key) in basicProductInfo"
                :key="key"
                class="grid gap-2"
              >
                <Label :for="key.toString()">{{
                  getLabel(key.toString())
                }}</Label>
                <Input
                  v-if="field.type === 'string'"
                  :id="key"
                  v-model="values[key].value"
                  :placeholder="field.placeholder"
                  type="text"
                />
                <Input
                  v-if="field.type === 'number'"
                  :id="key"
                  v-model.number="values[key].value"
                  :placeholder="field.placeholder"
                  type="number"
                />
                <Checkbox
                  v-if="field.type === 'boolean'"
                  :id="key.toString()"
                  v-model="field.value"
                />
                <Input
                  v-if="key === 'product_photo'"
                  :id="key"
                  type="file"
                  multiple
                  :placeholder="field.placeholder"
                  @change="handleFileChange($event)"
                />
                <Textarea
                  v-if="field.type === 'textarea'"
                  :id="key"
                  v-model="values[key].value"
                  :placeholder="field.placeholder"
                />
                <Select
                  v-if="key === 'product_category'"
                  v-model="values[key].value"
                >
                  <SelectTrigger>
                    <SelectValue>{{ values[key].value }} </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{{ field.selectLabel }}</SelectLabel>
                      <SelectItem
                        v-for="option in field.options"
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select v-if="key === 'active'" v-model="values[key].value">
                  <SelectTrigger>
                    <SelectValue>{{ values[key].value }} </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{{ field.selectLabel }}</SelectLabel>
                      <SelectItem
                        v-for="option in field.options"
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span v-if="errors[key]" class="text-red-500 text-sm">
                  {{ errors[key] }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="p-4">
          <CardHeader class="p-2">
            <CardTitle class="text-text-100 font-medium text-md mb-4"
              >Informations complémentaires</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div
                v-for="(field, key) in additionalProductDetails"
                :key="key"
                class="grid gap-2"
              >
                <Label :for="key.toString()">{{
                  getLabel(key.toString())
                }}</Label>
                <Input
                  v-if="field.type === 'string'"
                  :id="key"
                  v-model="values[key].value"
                  :placeholder="field.placeholder"
                  type="text"
                />
                <Input
                  v-if="field.type === 'number'"
                  :id="key"
                  v-model.number="values[key].value"
                  :placeholder="field.placeholder"
                  type="number"
                />
                <Checkbox
                  v-if="field.type === 'boolean'"
                  :id="key.toString()"
                  v-model="values[key].value"
                />
                <span v-if="errors[key]" class="text-red-500 text-sm">
                  {{ errors[key] }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="w-full md:w-1/2">
        <Card class="h-fit p-3">
          <CardHeader class="p-2">
            <CardTitle class="text-text-100 font-medium text-md mb-4">
              Photos du produit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="productDetails" class="flex justify-center mt-3">
              <div class="w-full md:w-1/3">
                <div class="w-full sm:w-auto center">
                  <Carousel
                    class="relative w-full max-w-xs"
                    @init-api="(val) => (emblaMainApi = val)"
                  >
                    <CarouselContent>
                      <CarouselItem
                        v-for="(photo, index) in productDetails.imageUrls"
                        :key="index"
                      >
                        <img
                          :src="photo"
                          alt="Product Image"
                          class="w-full h-auto object-cover rounded-lg"
                        />
                        <Button
                          @click="deleteImage(photo)"
                          class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          ✕
                        </Button>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>

                  <Carousel
                    class="relative w-full max-w-xs mt-4"
                    @init-api="(val) => (emblaThumbnailApi = val)"
                  >
                    <CarouselContent class="flex gap-1 ml-0">
                      <CarouselItem
                        v-for="(photo, index) in productDetails.imageUrls"
                        :key="index"
                        class="pl-0 basis-1/4 cursor-pointer"
                        @click="onThumbClick(index)"
                      >
                        <img
                          :src="photo"
                          alt="Thumbnail Image"
                          class="w-full h-auto object-cover rounded-lg"
                          :class="index === selectedIndex ? '' : 'opacity-50'"
                        />
                      </CarouselItem>
                    </CarouselContent>
                  </Carousel>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="mt-4">
          <CardHeader class="p-2">
            <CardTitle class="text-text-100 font-medium text-md mb-4"
              >Spécifications technique</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div
                v-for="(field, key) in productSpecifications"
                :key="key"
                class="grid gap-2"
              >
                <Label :for="key.toString()">{{
                  getLabel(key.toString())
                }}</Label>
                <Input
                  v-if="field.type === 'string'"
                  :id="key"
                  v-model="values[key].value"
                  :placeholder="field.placeholder"
                  type="text"
                />
                <Input
                  v-if="field.type === 'number'"
                  :id="key"
                  v-model.number="values[key].value"
                  type="number"
                  :placeholder="field.placeholder"
                />
                <Checkbox
                  v-if="field.type === 'boolean'"
                  :id="key"
                  v-model="values[key].value"
                />
                <span v-if="errors[key]" class="text-red-500 text-sm">
                  {{ errors[key] }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <p v-if="httpError" class="text-red-500 text-xs mt-2">
      {{ httpError }}
    </p>
  </form>
</template>

<style scoped>
.button:hover .icon {
  color: white;
}
</style>
