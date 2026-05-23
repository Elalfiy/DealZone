/*
 * FIXED: Frontend Registration Service
 * Handles FormData submission with file upload and proper error handling
 * Path: src/services/registrationService.js
 */

import api from '../config/api'

/**
 * Register user with optional KYC document
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (Buyer/Supplier)
 * @param {string} userData.companyName - Company name
 * @param {string} userData.taxNumber - Tax number (optional)
 * @param {string} userData.address - Address
 * @param {File} userData.kycDocument - KYC file (optional)
 * @returns {Promise<Object>} { token, refreshToken, user }
 * @throws {Error} With specific error message from backend
 */
export const registerUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.email) throw new Error('Email is required')
    if (!userData.password) throw new Error('Password is required')
    if (!userData.role) throw new Error('Role is required')

    // Create FormData to handle file upload
    const formData = new FormData()
    
    // Add string fields
    formData.append('email', userData.email.trim())
    formData.append('password', userData.password)
    formData.append('role', userData.role)
    
    // Add optional fields
    if (userData.companyName) {
      formData.append('companyName', userData.companyName.trim())
    }
    if (userData.taxNumber) {
      formData.append('taxNumber', userData.taxNumber.trim())
    }
    if (userData.address) {
      formData.append('address', userData.address.trim())
    }

    // Add file if provided
    if (userData.kycDocument) {
      // Validate file
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (userData.kycDocument.size > maxSize) {
        throw new Error(`File size exceeds 10MB limit. Uploaded: ${(userData.kycDocument.size / 1024 / 1024).toFixed(2)}MB`)
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(userData.kycDocument.type)) {
        throw new Error(`File type '${userData.kycDocument.type}' is not allowed. Allowed: PDF, JPG, PNG`)
      }

      formData.append('kycDocument', userData.kycDocument)
    }

    // Make API call
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Important: let browser set this with boundary
      }
    })

    // Extract error message if present
    if (!response.data.success && response.data.message) {
      throw new Error(response.data.message)
    }

    return response.data.data // { token, refreshToken, user }
  } catch (error) {
    // Extract error message from various sources
    let errorMessage = 'Registration failed. Please try again.'

    // API response error
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    // Axios error message
    else if (error.response?.data?.errors?.[0]) {
      errorMessage = error.response.data.errors[0]
    }
    // Validation error
    else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

/**
 * Upload KYC document after registration
 * @param {File} file - KYC document file
 * @param {string} docType - Document type
 * @returns {Promise<Object>} { status, fileUrl }
 */
export const uploadKycDocument = async (file, docType) => {
  try {
    if (!file) throw new Error('File is required')
    if (!docType) throw new Error('Document type is required')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)

    const response = await api.post('/companies/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data.data // { status, fileUrl }
  } catch (error) {
    let errorMessage = 'Document upload failed. Please try again.'

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors?.[0]) {
      errorMessage = error.response.data.errors[0]
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

/**
 * Get KYC document status
 * @returns {Promise<Object>} { status, fileUrl }
 */
export const getKycStatus = async () => {
  try {
    const response = await api.get('/companies/kyc/status')
    return response.data.data // { status, fileUrl }
  } catch (error) {
    let errorMessage = 'Failed to fetch KYC status'

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

export default {
  registerUser,
  uploadKycDocument,
  getKycStatus
}
