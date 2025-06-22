import { z } from 'zod'

// Password validation schema matching backend requirements
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),
  customerType: z.enum(['B2C', 'B2B']).default('B2C'),
  companyName: z.string().optional(),
  vatNumber: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}).refine((data) => {
  if (data.customerType === 'B2B') {
    return !!data.companyName && data.companyName.length >= 2
  }
  return true
}, {
  message: 'Company name is required for B2B accounts',
  path: ['companyName']
}).refine((data) => {
  if (data.customerType === 'B2B') {
    return !!data.vatNumber && data.vatNumber.length >= 5
  }
  return true
}, {
  message: 'VAT number is required for B2B accounts',
  path: ['vatNumber']
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

// Profile schemas
export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

// Product schemas
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required')
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  parentId: z.string().optional()
})

export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  logo: z.string().url().optional()
})

// Cart and Order schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10')
})

export const checkoutSchema = z.object({
  deliveryAddress: z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits'),
    country: z.string().min(2, 'Country is required')
  }),
  deliveryOptionId: z.string().min(1, 'Delivery option is required'),
  paymentMethod: z.enum(['card', 'paypal'], {
    errorMap: () => ({ message: 'Please select a payment method' })
  })
})

// Email Alert schemas
export const emailAlertSchema = z.object({
  type: z.enum(['stock', 'price', 'new_product', 'low_stock']),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  enabled: z.boolean().default(true)
}).refine((data) => {
  if (data.type === 'stock' || data.type === 'price') {
    return !!data.productId
  }
  if (data.type === 'new_product') {
    return !!data.categoryId
  }
  return true
}, {
  message: 'Product is required for stock and price alerts, category is required for new product alerts',
  path: ['productId']
})

// Admin schemas
export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  type: z.enum(['in', 'out']),
  reason: z.string().min(5, 'Reason must be at least 5 characters')
})

export const promoCodeSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must not exceed 20 characters').regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, underscores, and hyphens'),
  discount: z.number().min(0.01, 'Discount must be greater than 0'),
  type: z.enum(['percentage', 'fixed']),
  expiresAt: z.date().min(new Date(), 'Expiry date must be in the future'),
  categoryId: z.string().optional(),
  productId: z.string().optional()
}).refine((data) => {
  if (data.type === 'percentage') {
    return data.discount <= 100
  }
  return true
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discount']
})

export const relayPointSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  openingHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional()
  })
})

// Search and filter schemas
export const productFiltersSchema = z.object({
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
}).refine((data) => {
  if (data.minPrice && data.maxPrice) {
    return data.minPrice <= data.maxPrice
  }
  return true
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['maxPrice']
})

export const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query must not exceed 100 characters')
})

// Export types for use in components
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type BrandFormData = z.infer<typeof brandSchema>
export type AddToCartFormData = z.infer<typeof addToCartSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type EmailAlertFormData = z.infer<typeof emailAlertSchema>
export type StockMovementFormData = z.infer<typeof stockMovementSchema>
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>
export type RelayPointFormData = z.infer<typeof relayPointSchema>
export type ProductFiltersFormData = z.infer<typeof productFiltersSchema>
export type SearchFormData = z.infer<typeof searchSchema>