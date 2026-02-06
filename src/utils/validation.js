export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 8
}

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return value !== 0
  return !!value
}

export const validateNumber = (value, min = null, max = null) => {
  const num = Number(value)
  if (isNaN(num)) return false
  if (min !== null && num < min) return false
  if (max !== null && num > max) return false
  return true
}

export const validateForm = (fields, values) => {
  const errors = {}
  
  Object.keys(fields).forEach(key => {
    const field = fields[key]
    const value = values[key]
    
    if (field.required && !validateRequired(value)) {
      errors[key] = `${field.label} is required`
      return
    }
    
    if (value && field.type === 'email' && !validateEmail(value)) {
      errors[key] = 'Invalid email address'
      return
    }
    
    if (value && field.type === 'password' && !validatePassword(value)) {
      errors[key] = 'Password must be at least 8 characters'
      return
    }
    
    if (value && field.type === 'phone' && !validatePhone(value)) {
      errors[key] = 'Invalid phone number'
      return
    }
    
    if (value && field.type === 'number' && !validateNumber(value, field.min, field.max)) {
      errors[key] = `Invalid number${field.min !== null ? ` (min: ${field.min})` : ''}${field.max !== null ? ` (max: ${field.max})` : ''}`
      return
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

