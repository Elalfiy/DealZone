import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Mail, Lock } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateEmail, validatePassword } from '../utils/validation'

const Login = () => {
  const navigate = useNavigate()
  const { login, user } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setFormErrors({})

    // Validation
    const errors = {}
    if (!validateEmail(formData.email)) {
      errors.email = t('auth.login.invalidEmail')
    }
    if (!validatePassword(formData.password)) {
      errors.password = t('auth.login.invalidPassword')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    // Simulate API call
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user exists in localStorage (demo)
      const savedUsers = JSON.parse(localStorage.getItem('dealzone_users') || '[]')
      const foundUser = savedUsers.find(u => u.email === formData.email && u.password === formData.password)
      
      if (foundUser) {
        login(foundUser)
        success(t('auth.login.success'))
        navigate(
          foundUser.type === 'admin'
            ? '/admin'
            : foundUser.type === 'manufacturer'
              ? '/dashboard/manufacturer'
              : '/dashboard/supplier'
        )
      } else {
        error(t('auth.login.invalidCredentials'))
        setFormErrors({ email: t('auth.login.invalidCredentials'), password: t('auth.login.invalidCredentials') })
      }
    } catch (err) {
      error(t('auth.login.failed'))
    } finally {
      setIsLoading(false)
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-cairo font-bold text-text-dark mb-3">
                {t('auth.login.title')}
              </h1>
              <p className="text-text-gray">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('auth.login.email')}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder={t('auth.login.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('auth.login.password')}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light`} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder={t('auth.login.passwordPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-secondary text-primary focus:ring-primary" />
                  <span className={`${language === 'ar' ? 'mr-2' : 'ml-2'} text-sm text-text-gray`}>{t('auth.login.remember')}</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  {t('auth.login.forgot')}
                </Link>
              </div>

              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
              {formErrors.password && (
                <p className="text-sm text-red-600">{formErrors.password}</p>
              )}
              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.login.signingIn') : t('auth.login.submit')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-gray">
                {t('auth.login.noAccount')}{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  {t('auth.login.signUp')}
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login

