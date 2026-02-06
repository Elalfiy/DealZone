import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useToast } from '../hooks/useToast'
import { validateEmail } from '../utils/validation'
import { useTranslation } from '../hooks/useTranslation'

const ForgotPassword = () => {
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      error(t('auth.forgot.invalidEmail'))
      return
    }

    setIsSending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSent(true)
      success(t('auth.forgot.linkSent'))
    } catch (err) {
      error(t('auth.forgot.failed'))
    } finally {
      setIsSending(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-large p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-cairo font-bold text-text-dark mb-4">
                {t('auth.forgot.checkEmailTitle')}
              </h1>
              <p className="text-text-gray mb-8">
                {t('auth.forgot.checkEmailSubtitle', { email })}
              </p>
              <p className="text-sm text-text-gray mb-8">
                {t('auth.forgot.checkEmailNote')}
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  {t('auth.common.backToLogin')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    )
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
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-cairo font-bold text-text-dark mb-3">
                {t('auth.forgot.title')}
              </h1>
              <p className="text-text-gray">
                {t('auth.forgot.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('auth.forgot.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('auth.forgot.emailPlaceholder')}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={isSending}>
                {isSending ? t('auth.forgot.sending') : t('auth.forgot.submit')}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

