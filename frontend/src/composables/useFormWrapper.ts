import { ref, reactive, computed, type Ref } from 'vue'
import { useForm, type FieldContext, type FormContext } from 'vee-validate'
import type { ZodSchema } from 'zod'

export interface FormWrapperOptions<T> {
  validationSchema?: ZodSchema<T>
  initialValues?: Partial<T>
  onSubmit?: (values: T) => Promise<void> | void
  resetOnSuccess?: boolean
}

export interface FormField {
  value: any
  error: string | undefined
  touched: boolean
  validate: () => Promise<boolean>
  setValue: (value: any) => void
  setTouched: (touched: boolean) => void
}

export interface FormWrapperReturn<T> {
  // Form state
  isLoading: Ref<boolean>
  isSubmitting: Ref<boolean>
  isValid: Ref<boolean>
  isDirty: Ref<boolean>
  errors: Ref<Record<string, string>>
  values: Ref<T>
  
  // Form methods
  handleSubmit: (onSubmit?: (values: T) => Promise<void> | void) => Promise<void>
  validate: () => Promise<boolean>
  reset: () => void
  setFieldValue: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error: string) => void
  clearErrors: () => void
  
  // Field helpers
  getField: (name: keyof T) => FormField
  bindField: (name: keyof T) => {
    value: any
    error: string | undefined
    'onUpdate:modelValue': (value: any) => void
    onBlur: () => void
  }
  
  // Form context (VeeValidate)
  form: FormContext<T>
  
  // Success/Error states
  submitSuccess: Ref<boolean>
  submitError: Ref<string | null>
  setSuccess: (message?: string) => void
  setError: (error: string | Error) => void
  clearStatus: () => void
}

export function useFormWrapper<T extends Record<string, any>>(
  options: FormWrapperOptions<T> = {}
): FormWrapperReturn<T> {
  const {
    validationSchema,
    initialValues = {} as Partial<T>,
    onSubmit,
    resetOnSuccess = true
  } = options

  // Form state
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const submitSuccess = ref(false)
  const submitError = ref<string | null>(null)

  // Initialize VeeValidate form
  const form = useForm<T>({
    validationSchema,
    initialValues
  })

  const { values, errors, meta, setFieldValue, setFieldError, resetForm, validate: validateForm } = form

  // Computed properties
  const isValid = computed(() => meta.value.valid)
  const isDirty = computed(() => meta.value.dirty)

  // Methods
  const handleSubmit = async (customOnSubmit?: (values: T) => Promise<void> | void) => {
    const submitHandler = customOnSubmit || onSubmit
    if (!submitHandler) {
      console.warn('No submit handler provided')
      return
    }

    clearStatus()
    
    const isFormValid = await validateForm()
    if (!isFormValid.valid) {
      return
    }

    try {
      isSubmitting.value = true
      await submitHandler(values.value as T)
      
      submitSuccess.value = true
      if (resetOnSuccess) {
        resetForm()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      submitError.value = errorMessage
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const reset = () => {
    resetForm()
    clearStatus()
  }

  const clearErrors = () => {
    Object.keys(errors.value).forEach(field => {
      setFieldError(field, undefined)
    })
  }

  const setSuccess = (message = 'Operation completed successfully') => {
    submitSuccess.value = true
    submitError.value = null
  }

  const setError = (error: string | Error) => {
    const errorMessage = error instanceof Error ? error.message : error
    submitError.value = errorMessage
    submitSuccess.value = false
  }

  const clearStatus = () => {
    submitSuccess.value = false
    submitError.value = null
  }

  const getField = (name: keyof T): FormField => {
    const fieldContext = form.getFieldContext(name as string) as FieldContext

    return {
      value: fieldContext?.value,
      error: fieldContext?.errors.value[0],
      touched: fieldContext?.meta.touched,
      validate: async () => {
        const result = await fieldContext?.validate()
        return result?.valid ?? false
      },
      setValue: (value: any) => setFieldValue(name as string, value),
      setTouched: (touched: boolean) => fieldContext?.setTouched(touched)
    }
  }

  const bindField = (name: keyof T) => {
    const field = getField(name)
    
    return {
      value: field.value,
      error: field.error,
      'onUpdate:modelValue': (value: any) => field.setValue(value),
      onBlur: () => field.setTouched(true)
    }
  }

  return {
    // State
    isLoading,
    isSubmitting,
    isValid,
    isDirty,
    errors,
    values,
    
    // Methods
    handleSubmit,
    validate: validateForm,
    reset,
    setFieldValue: (field: keyof T, value: any) => setFieldValue(field as string, value),
    setFieldError: (field: keyof T, error: string) => setFieldError(field as string, error),
    clearErrors,
    
    // Field helpers
    getField,
    bindField,
    
    // Form context
    form,
    
    // Status
    submitSuccess,
    submitError,
    setSuccess,
    setError,
    clearStatus
  }
}

// Utility function for common form patterns
export function useAsyncFormWrapper<T extends Record<string, any>>(
  asyncAction: (values: T) => Promise<any>,
  options: Omit<FormWrapperOptions<T>, 'onSubmit'> = {}
) {
  return useFormWrapper<T>({
    ...options,
    onSubmit: async (values: T) => {
      await asyncAction(values)
    }
  })
}

// Hook for simple validation without form submission
export function useFieldValidation<T>(
  validationSchema?: ZodSchema<T>,
  initialValue?: T
) {
  const value = ref(initialValue)
  const error = ref<string>()
  const isValid = ref(true)

  const validate = async () => {
    if (!validationSchema) return true

    try {
      await validationSchema.parseAsync(value.value)
      error.value = undefined
      isValid.value = true
      return true
    } catch (err: any) {
      error.value = err.errors?.[0]?.message || 'Validation error'
      isValid.value = false
      return false
    }
  }

  return {
    value,
    error,
    isValid,
    validate
  }
}