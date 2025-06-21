import { configure } from 'vee-validate'
import { z } from 'zod'

// Configure VeeValidate globally
configure({
  // Generates a localized validation message
  generateMessage: (ctx) => {
    const messages: Record<string, string> = {
      required: `The field ${ctx.field} is required.`,
      email: `The field ${ctx.field} must be a valid email.`,
      min: `The field ${ctx.field} must be at least ${(ctx.rule?.params as any)?.[0]} characters.`,
      max: `The field ${ctx.field} must not exceed ${(ctx.rule?.params as any)?.[0]} characters.`,
      numeric: `The field ${ctx.field} must be a number.`,
      url: `The field ${ctx.field} must be a valid URL.`,
    }

    const message = messages[ctx.rule?.name || ''] || `The field ${ctx.field} is invalid.`
    return message
  },
  
  // Validate on input by default (can be overridden per field)
  validateOnInput: true,
  
  // Validate on blur by default
  validateOnBlur: true,
  
  // Validate on change by default
  validateOnChange: true,
  
  // Validate on model update
  validateOnModelUpdate: true,
})

// Helper function to convert Zod schema to VeeValidate validator
export function zodToValidator<T>(schema: z.ZodSchema<T>) {
  return (value: unknown) => {
    const result = schema.safeParse(value)
    
    if (result.success) {
      return true
    }
    
    // Return the first error message
    return result.error.issues[0]?.message || 'Validation error'
  }
}

// Helper function for form validation with Zod
export function useZodValidation(schema: z.ZodObject<any>) {
  return {
    validationSchema: Object.keys(schema.shape).reduce((acc, key) => {
      // Create a validator for each field
      acc[key] = (value: unknown) => {
        try {
          const fieldSchema = schema.shape[key]
          const result = fieldSchema.safeParse(value)
          
          if (result.success) {
            return true
          }
          
          return result.error.issues[0]?.message || 'Validation error'
        } catch (error) {
          return 'Validation error'
        }
      }
      return acc
    }, {} as Record<string, (value: unknown) => boolean | string>)
  }
}

// Utility to validate entire form with Zod
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data, errors: {} }
  }
  
  // Convert Zod errors to field-specific errors
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    if (issue.path.length > 0) {
      const fieldName = issue.path.join('.')
      errors[fieldName] = issue.message
    }
  })
  
  return { success: false, data: null, errors }
}

// Common validation rules
export const validationRules = {
  required: (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required'
    }
    return true
  },
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return true
  },
  
  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `This field must be at least ${min} characters`
    }
    return true
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return `This field must not exceed ${max} characters`
    }
    return true
  },
  
  numeric: (value: string) => {
    if (!/^\d+$/.test(value)) {
      return 'This field must be numeric'
    }
    return true
  },
  
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  },
  
  password: (value: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/
    if (!passwordRegex.test(value)) {
      return 'Password must be at least 12 characters with uppercase, lowercase, number, and special character'
    }
    return true
  },
  
  confirmPassword: (passwordField: string) => (value: string, ctx: any) => {
    const password = ctx.form[passwordField]
    if (value !== password) {
      return 'Passwords do not match'
    }
    return true
  },
  
  positiveNumber: (value: number) => {
    if (value <= 0) {
      return 'This field must be a positive number'
    }
    return true
  },
  
  phone: (value: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number'
    }
    return true
  },
  
  postalCode: (value: string) => {
    const postalCodeRegex = /^\d{5}$/
    if (!postalCodeRegex.test(value)) {
      return 'Postal code must be 5 digits'
    }
    return true
  }
}