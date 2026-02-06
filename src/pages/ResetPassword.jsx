import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useToast } from '../hooks/useToast'
import { validatePassword } from '../utils/validation'
import { useTranslation } from '../hooks/useTranslation'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isResetting, setIsResetting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!validatePassword(formData.password)) {
      newErrors.password = t('auth.reset.passwordMin')
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.reset.passwordMismatch')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsResetting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      success(t('auth.reset.success'))
      navigate('/login')
    } catch (err) {
      error(t('auth.reset.failed'))
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-large p-8 md:p-12"
          >
            <Link to="/login" className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray hover:text-primary mb-6`}>
              <ArrowLeft className="w-5 h-5" />
              <span>{t('auth.common.backToLogin')}</span>
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-cairo font-bold text-text-dark mb-3">
                {t('auth.reset.title')}
              </h1>
              <p className="text-text-gray">
                {t('auth.reset.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('auth.reset.newPassword')}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-secondary'
                  }`}
                  placeholder={t('auth.reset.newPasswordPlaceholder')}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('auth.reset.confirmPassword')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-secondary'
                  }`}
                  placeholder={t('auth.reset.confirmPasswordPlaceholder')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={isResetting}>
                {isResetting ? t('auth.reset.resetting') : t('auth.reset.submit')}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

