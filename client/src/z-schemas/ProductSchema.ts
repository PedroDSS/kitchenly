import { z } from "zod";

export const AddProductSchema = z.object({
  product_title: z
    .string()
    .min(1, { message: "Le titre du produit est requis" }),
  product_description: z.string().optional(),
  product_price: z
    .number({ message: "Le prix du produit est requis" })
    .min(0.01, { message: "Le prix du produit doit être supérieur à zéro" }),
  product_category: z
    .string()
    .min(1, { message: "La catégorie du produit est requise" }),
  delivery: z
    .string()
    .min(1, { message: "Les informations de livraison sont requises" }),
  product_stock: z
    .number({ message: "Le stock du produit est requis" })
    .min(0, { message: "Le stock du produit doit être au moins de zéro" }),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
  color: z.string().optional(),
  powerConsumption: z.string().optional(), // Consommation électrique (ex : "1500W")
  voltage: z.string().optional(), // Tension électrique (ex : "220V")
  capacity: z.string().optional(), // Capacité (ex : "7kg", "350L")
  dimensions: z.string().optional(), // Dimensions (ex : "60x60x85 cm")
  weight: z.string().optional(), // Poids (ex : "40kg")
  energyEfficiencyClass: z.string().optional(), // Classe énergétique (ex : "A++")
  noiseLevel: z.string().optional(), // Niveau sonore (ex : "55dB")
  warranty: z.string().optional(), // Garantie (ex : "2 ans")
  material: z.string().optional(), // Matériau (ex : "Acier inoxydable")
});

export const EditProductSchema = z.object({
  product_title: z
    .string()
    .min(1, { message: "Le titre du produit est requis" }),
  product_description: z.string().optional(),
  product_price: z
    .number({ message: "Le prix du produit est requis" })
    .min(0.01, { message: "Le prix du produit doit être supérieur à zéro" }),
  product_category: z
    .string()
    .min(1, { message: "La catégorie du produit est requise" }),
  delivery: z
    .string()
    .min(1, { message: "Les informations de livraison sont requises" }),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
  color: z.string().optional(),
  powerConsumption: z.string().optional(), // Consommation électrique (ex : "1500W")
  voltage: z.string().optional(), // Tension électrique (ex : "220V")
  capacity: z.string().optional(), // Capacité (ex : "7kg", "350L")
  dimensions: z.string().optional(), // Dimensions (ex : "60x60x85 cm")
  weight: z.string().optional(), // Poids (ex : "40kg")
  energyEfficiencyClass: z.string().optional(), // Classe énergétique (ex : "A++")
  noiseLevel: z.string().optional(), // Niveau sonore (ex : "55dB")
  warranty: z.string().optional(), // Garantie (ex : "2 ans")
  material: z.string().optional(), // Matériau (ex : "Acier inoxydable")
});

export type AddProduct = z.infer<typeof AddProductSchema>;
export type EditProduct = z.infer<typeof EditProductSchema>;
