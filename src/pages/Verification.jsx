import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useTranslation } from '../hooks/useTranslation'

const Verification = () => {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-large p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Clock className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-cairo font-bold text-text-dark mb-4">
              {t('auth.verificationPending.title')}
            </h1>
            <p className="text-lg text-text-gray mb-8 max-w-md mx-auto">
              {t('auth.verificationPending.subtitle')}
            </p>

            <div className="bg-secondary/50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-text-dark mb-4 flex items-center">
                <CheckCircle className={`w-5 h-5 text-primary ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('auth.verificationPending.nextTitle')}
              </h3>
              <ul className="space-y-3 text-text-gray">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>{t('auth.verificationPending.step1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>{t('auth.verificationPending.step2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>{t('auth.verificationPending.step3')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-2">
                <Mail className={`w-5 h-5 text-primary ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                <span className="font-semibold text-text-dark">{t('auth.verificationPending.checkEmail')}</span>
              </div>
              <p className="text-sm text-text-gray">
                {t('auth.verificationPending.checkEmailDesc')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link to="/login" className="w-full">
                <Button variant="primary" className="w-full">
                  {t('auth.verificationPending.goToLogin')}
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">
                  {t('auth.verificationPending.backToHome')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Verification

