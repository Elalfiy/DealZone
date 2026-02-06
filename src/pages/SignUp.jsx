import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Building2, Factory, ArrowRight, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../utils/validation'

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, businessLicense: e.target.files[0] }))
  }

  const validateStep = (stepNumber) => {
    const errors = {}
    
    if (stepNumber === 2) {
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
      // Tax ID is optional - validation removed
      // Contact Person is now optional - validation removed
      // if (!validateRequired(formData.contactPerson)) {
      //   errors.contactPerson = t('auth.signup.contactPersonRequired')
      // }
      
      // Make file optional for testing - just show warning
      if (!formData.businessLicense) {
        // For testing, we'll allow proceeding without file
        // errors.businessLicense = 'Business license is required'
      }
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (step < 3) {
        const errors = validateStep(step + 1)
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors)
          const firstError = Object.values(errors)[0]
          error(firstError || t('auth.signup.fillRequired'))
          return
        }
      setFormErrors({})
      setStep(step + 1)
    } else {
      // Final submission
        const errors = validateStep(3)
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors)
          const firstError = Object.values(errors)[0]
          error(firstError || t('auth.signup.fillRequired'))
          return
        }

      setIsLoading(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Save user to localStorage (demo)
        const newUser = {
          id: Date.now(),
          type: userType,
          companyName: formData.companyName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          taxId: (formData.taxId || '').trim(), 
          contactPerson: (formData.contactPerson || '').trim(), // تأكد من حفظه كـ '' إذا كان فارغًا
          verified: false,
          createdAt: new Date().toISOString(),
        }
        
        const savedUsers = JSON.parse(localStorage.getItem('dealzone_users') || '[]')
        // Check if email already exists
        if (savedUsers.find(u => u.email === newUser.email)) {
          error(t('auth.signup.emailExists'))
          setIsLoading(false)
          return
        }
        
        savedUsers.push({ ...newUser, password: formData.password })
        localStorage.setItem('dealzone_users', JSON.stringify(savedUsers))
        
        success(t('auth.signup.success'))
        navigate('/verification')
      } catch (err) {
        error(t('auth.signup.failed'))
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Choose User Type */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-large p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-cairo font-bold text-text-dark mb-3">
                  {t('auth.signup.title')}
                </h1>
                <p className="text-text-gray">{t('auth.signup.chooseType')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('supplier')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    userType === 'supplier'
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary hover:border-primary/50'
                  }`}
                >
                  <Factory className={`w-12 h-12 mx-auto mb-4 ${
                    userType === 'supplier' ? 'text-primary' : 'text-text-gray'
                  }`} />
                  <h3 className="font-cairo font-bold text-xl mb-2">{t('auth.signup.supplier')}</h3>
                  <p className="text-sm text-text-gray">
                    {t('auth.signup.supplierDesc')}
                  </p>
                  {userType === 'supplier' && (
                    <Check className="w-6 h-6 text-primary mx-auto mt-4" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType('manufacturer')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    userType === 'manufacturer'
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary hover:border-primary/50'
                  }`}
                >
                  <Building2 className={`w-12 h-12 mx-auto mb-4 ${
                    userType === 'manufacturer' ? 'text-primary' : 'text-text-gray'
                  }`} />
                  <h3 className="font-cairo font-bold text-xl mb-2">{t('auth.signup.manufacturer')}</h3>
                  <p className="text-sm text-text-gray">
                    {t('auth.signup.manufacturerDesc')}
                  </p>
                  {userType === 'manufacturer' && (
                    <Check className="w-6 h-6 text-primary mx-auto mt-4" />
                  )}
                </motion.button>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => userType && setStep(2)}
                disabled={!userType || isLoading}
              >
                {isLoading ? t('common.loading') : t('common.continue')}
                {!isLoading && <ArrowRight className={`w-5 h-5 inline-block ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />}
              </Button>

              <p className="text-center mt-6 text-sm text-text-gray">
                {t('auth.signup.haveAccount')}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('nav.login')}
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Company Info */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-large p-8 md:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-cairo font-bold text-text-dark">
                    {t('auth.signup.companyInfo')}
                  </h2>
                  <span className="text-sm text-text-gray">{t('auth.signup.step2of3')}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full mb-6">
                  <div className="h-2 bg-primary rounded-full w-2/3" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.signup.companyName')} *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.companyName ? 'border-red-500' : 'border-secondary'
                    }`}
                  />
                  {formErrors.companyName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.login.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-secondary'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      {t('auth.login.password')} *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.password ? 'border-red-500' : 'border-secondary'
                      }`}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      {t('auth.signup.confirmPassword')} *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-secondary'
                      }`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.signup.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.phone ? 'border-red-500' : 'border-secondary'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.signup.address')} *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.address ? 'border-red-500' : 'border-secondary'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    {t('common.back')}
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
                    {isLoading ? t('auth.signup.processing') : t('common.continue')}
                    {!isLoading && <ArrowRight className={`w-5 h-5 inline-block ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Business Documents */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-large p-8 md:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-cairo font-bold text-text-dark">
                    {t('auth.signup.kyc')}
                  </h2>
                  <span className="text-sm text-text-gray">{t('auth.signup.step3of3')}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full mb-6">
                  <div className="h-2 bg-primary rounded-full w-full" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.signup.taxId')} <span className="text-text-light">({t('auth.signup.optional')})</span>
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.taxId ? 'border-red-500' : 'border-secondary'
                    }`}
                  />
                  {formErrors.taxId && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.taxId}</p>
                  )}
                </div>

                {/* حقل Contact Person - أصبح اختياريًا الآن */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.signup.contactPerson')} <span className="text-text-light">({t('auth.signup.optional')})</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    // required تمت إزالة الخاصية
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.contactPerson ? 'border-red-500' : 'border-secondary'
                    }`}
                  />
                  {formErrors.contactPerson && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.contactPerson}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('auth.signup.businessLicense')} <span className="text-text-light">({t('auth.signup.optional')})</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors ${
                    formErrors.businessLicense ? 'border-red-500' : 'border-secondary'
                  }`}>
                    <input
                      type="file"
                      name="businessLicense"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="businessLicense"
                    />
                    <label htmlFor="businessLicense" className="cursor-pointer">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-6 h-6 text-text-gray" />
                      </div>
                      <p className="text-text-gray mb-2">
                        {t('auth.signup.uploadFile')}
                      </p>
                      <p className="text-sm text-text-light">
                        {t('auth.signup.fileFormat')}
                      </p>
                      {formData.businessLicense && (
                        <p className="text-sm text-primary mt-2 font-medium">
                          {formData.businessLicense.name}
                        </p>
                      )}
                    </label>
                  </div>
                  {formErrors.businessLicense && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.businessLicense}</p>
                  )}
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-text-gray">
                    <strong>{t('auth.signup.note')}:</strong> {t('auth.signup.verificationNote')}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                  >
                    {t('common.back')}
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
                    {isLoading ? t('auth.signup.submitting') : t('auth.signup.complete')}
                    {!isLoading && <ArrowRight className={`w-5 h-5 inline-block ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />}
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