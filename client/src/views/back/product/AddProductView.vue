<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { useProductsStore } from "@/stores/productsStore";
import { AddProductSchema } from "@/z-schemas/ProductSchema";

import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectLabel from "@/components/ui/select/SelectLabel.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import { useForm } from "@/composables/useForm";
import { Save } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";

const productsStore = useProductsStore();
const router = useRouter();

type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "file"
  | "textarea"
  | "select";

interface ProductField {
  value: string | number | boolean | File[];
  selectLabel?: string;
  type: FieldType;
  placeholder: string;
  options?: string[];
}
const files = ref<File[]>([]);

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
    placeholder: "Saisir le type de prise éléctrique..",
  },
});

const flattenValues = (obj: Record<string, ProductField>) => {
  const result: Record<string, string | number | boolean | File[]> = {};

  for (const key in obj) {
    result[key] = obj[key].value;
  }
  return result;
};

const { values, errors, isSubmitting, httpError, handleSubmit } = useForm({
  schema: AddProductSchema,
  initialValues: {
    ...flattenValues(basicProductInfo.value),
    ...flattenValues(productSpecifications.value),
    ...flattenValues(additionalProductDetails.value),
  },
  onSubmit: async (values) => {
    if (values.active === "Oui") {
      values.active = true;
    } else {
      values.active = false;
    }
    if (files) {
      await productsStore.addProductWithImages(values, files.value);
    } else {
      await productsStore.addProduct(values);
    }

    if (productsStore.error) {
      errors["product_photo"] = productsStore.error;
    } else {
      router.push({ name: "AdminProducts" });
    }
  },
});

const handleFileChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  files.value = Array.from(target.files || []);
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
    case "active":
      return "Produit en vente ?";
    default:
      return key;
  }
};
</script>

<template>
  <div class="flex justify-between w-full">
    <span class="flex flex-col">
      <span class="text-xl font-bold text-text-100">Ajouter un produit</span>
      <span class="text-md text-text-200"
        >Remplissez les détails du produit à ajouter.</span
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
              >Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div
                v-for="(field, key) in basicProductInfo"
                :key="key"
                class="grid gap-2"
              >
                <Label :for="key">{{ getLabel(key) }}</Label>
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
                  :id="key"
                  v-model="values[key].value"
                />
                <Input
                  v-if="field.type === 'file'"
                  :id="key"
                  type="file"
                  multiple
                  :placeholder="field.placeholder"
                  @change="(event) => handleFileChange(key, event)"
                />
                <Textarea
                  v-if="field.type === 'textarea'"
                  :id="key"
                  v-model="values[key].value"
                  :placeholder="field.placeholder"
                />
                <Select
                  v-if="field.type == 'select'"
                  v-model="values[key].value"
                >
                  <SelectTrigger>
                    <SelectValue :placeholder="field.placeholder" />
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
                <Label :for="key">{{ getLabel(key) }}</Label>
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

      <Card class="w-1/2">
        <CardHeader class="p-2">
          <CardTitle class="text-text-100 font-medium text-md mb-4"
            >Spécifications techniques</CardTitle
          >
        </CardHeader>
        <CardContent>
          <div class="grid gap-4">
            <div
              v-for="(field, key) in productSpecifications"
              :key="key"
              class="grid gap-2"
            >
              <Label :for="key">{{ getLabel(key) }}</Label>
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
