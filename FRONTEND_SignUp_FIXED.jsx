/*
 * FIXED: SignUp.jsx Component
 * Changes:
 * - Uses FormData for entire submission (including file)
 * - Proper error message extraction and display
 * - Better loading states and user feedback
 * - Transaction-like behavior (all data sent together)
 * 
 * Path: src/pages/SignUp.jsx
 */

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Building2, Factory, ArrowRight, Check, AlertCircle, Upload } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../utils/validation'
import { registerUser } from '../services/registrationService'

const SignUp = () => {
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') || null
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  
  const [userType, setUserType] = useState(initialType)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    taxId: '',
    contactPerson: '',
    businessLicense: null,
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [specificErrors, setSpecificErrors] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
    setSpecificErrors([])
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Client-side file validation
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          businessLicense: `File size exceeds 10MB. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }))
        return
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          businessLicense: `Invalid file type. Allowed: PDF, JPG, PNG`
        }))
        return
      }

      setFormData(prev => ({ ...prev, businessLicense: file }))
      setFormErrors(prev => ({ ...prev, businessLicense: '' }))
    }
  }

  const validateStep = (stepNumber) => {
    const errors = {}
    
    if (stepNumber === 2) {
      // Step 2: Basic Business Information
      if (!validateRequired(formData.companyName)) {
        errors.companyName = t('auth.signup.companyNameRequired')
      }
      if (!formData.email || !validateEmail(formData.email)) {
        errors.email = t('auth.signup.emailRequired')
      }
      if (!formData.password || !validatePassword(formData.password)) {
        errors.password = t('auth.signup.passwordRequired')
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('auth.signup.passwordMismatch')
      }
      if (!formData.phone || !validatePhone(formData.phone)) {
        errors.phone = t('auth.signup.phoneRequired')
      }
      if (!validateRequired(formData.address)) {
        errors.address = t('auth.signup.addressRequired')
      }
    }
    
    if (stepNumber === 3) {
      // Step 3: KYC Documents (all optional except file is optional too)
      // Tax ID and Contact Person are optional
      // Business License is optional (commented out validation)
    }
    
    return errors
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    
    if (step === 1) {
      if (!userType) {
        error(t('auth.signup.selectUserType'))
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const errors = validateStep(2)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        const firstError = Object.values(errors)[0]
        error(firstError)
        return
      }
      setFormErrors({})
      setStep(3)
      return
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step < 3) {
      handleNextStep(e)
      return
    }

    // Step 3: Final submission with file
    setIsLoading(true)
    setSpecificErrors([])
    
    try {
      // Validate step 3 (optional fields, so no required validation)
      const errors = validateStep(3)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        const firstError = Object.values(errors)[0]
        error(firstError)
        setIsLoading(false)
        return
      }

      // Prepare data for registration
      const registrationData = {
        type: userType,
        email: formData.email.trim(),
        password: formData.password,
        role: userType === 'supplier' ? 'Supplier' : 'Buyer',
        companyName: formData.companyName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        taxNumber: (formData.taxId || '').trim(),
        contactPerson: (formData.contactPerson || '').trim(),
        kycDocument: formData.businessLicense // Include file if provided
      }

      // Show uploading progress message
      if (formData.businessLicense) {
        setUploadProgress(30)
      }

      // Call registration API
      const response = await registerUser(registrationData)

      setUploadProgress(100)

      // Save tokens
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('refreshToken', response.refreshToken)
      }

      success('Registration successful! Redirecting to verification...')
      
      // Redirect after brief delay
      setTimeout(() => {
        navigate('/verification', { state: { email: formData.email } })
      }, 1000)
    } catch (err) {
      // Extract specific error message
      let errorMsg = 'Registration failed. Please try again.'
      let errorArray = []

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message
        if (err.response.data.errors) {
          errorArray = Array.isArray(err.response.data.errors) 
            ? err.response.data.errors 
            : [err.response.data.errors]
        }
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        errorMsg = Array.isArray(errors) ? errors[0] : errors
        errorArray = Array.isArray(errors) ? errors : [errors]
      } else if (err.message) {
        errorMsg = err.message
        errorArray = [err.message]
      }

      setSpecificErrors(errorArray)
      error(errorMsg)

      // Check if it's an email conflict error
      if (errorMsg.includes('already registered') || errorMsg.includes('already in use')) {
        setFormErrors({ email: errorMsg })
        setStep(2)
      }
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Alert */}
          {specificErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Registration Issues:</h3>
                  <ul className="space-y-1">
                    {specificErrors.map((err, idx) => (
                      <li key={idx} className="text-sm text-red-700">• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Choose User Type */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {t('auth.signup.title')}
                </h1>
                <p className="text-gray-600">{t('auth.signup.chooseType')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('supplier')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    userType === 'supplier'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <Factory className={`w-12 h-12 mx-auto mb-4 ${
                    userType === 'supplier' ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <h3 className="font-bold text-xl mb-2">Supplier</h3>
                  <p className="text-sm text-gray-600">
                    Sell your products to buyers
                  </p>
                  {userType === 'supplier' && (
                    <Check className="w-6 h-6 text-primary mx-auto mt-4" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('buyer')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    userType === 'buyer'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <Building2 className={`w-12 h-12 mx-auto mb-4 ${
                    userType === 'buyer' ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <h3 className="font-bold text-xl mb-2">Buyer</h3>
                  <p className="text-sm text-gray-600">
                    Find suppliers and purchase products
                  </p>
                  {userType === 'buyer' && (
                    <Check className="w-6 h-6 text-primary mx-auto mt-4" />
                  )}
                </motion.button>
              </div>

              <Button
                onClick={() => userType && setStep(2)}
                disabled={!userType || isLoading}
                className="w-full"
              >
                {isLoading ? 'Loading...' : 'Continue'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>

              <p className="text-center mt-6 text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Company Info */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Business Information
                  </h2>
                  <span className="text-sm text-gray-500">Step 2 of 3</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-primary rounded-full w-2/3" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your company name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.companyName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.companyName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min 8 chars, 1 number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+20 123 456 7890"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full business address"
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.address}</p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: KYC Documents */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    KYC Documents & Verification
                  </h2>
                  <span className="text-sm text-gray-500">Step 3 of 3</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-primary rounded-full w-full" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tax ID - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tax ID/VAT Number <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456789"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.taxId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.taxId && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.taxId}</p>
                  )}
                </div>

                {/* Contact Person - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Person <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Primary contact name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.contactPerson ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.contactPerson && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.contactPerson}</p>
                  )}
                </div>

                {/* Business License - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Business License / Documents <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    formErrors.businessLicense
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-primary'
                  }`}>
                    <input
                      type="file"
                      name="businessLicense"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="businessLicense"
                      disabled={isLoading}
                    />
                    <label htmlFor="businessLicense" className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-700 mb-2 font-medium">
                        {formData.businessLicense ? 'File selected: ' + formData.businessLicense.name : 'Click or drag file here'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPG, or PNG • Max 10MB
                      </p>
                      {formData.businessLicense && (
                        <p className="text-sm text-primary mt-2 font-medium">
                          ✓ {formData.businessLicense.name}
                        </p>
                      )}
                    </label>
                  </div>
                  {formErrors.businessLicense && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.businessLicense}</p>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Uploading...</span>
                      <span className="text-sm text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> All documents will be reviewed within 24-48 hours. You'll be notified once verified.
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        {uploadProgress > 0 ? 'Uploading...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignUp
