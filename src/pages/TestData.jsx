import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Database, UserCheck, RefreshCw, LogIn } from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { seedMockData, quickLogin } from '../utils/mockData'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'

const TestData = () => {
  const navigate = useNavigate()
  const { login } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeedData = () => {
    setIsSeeding(true)
    try {
      seedMockData()
      success(t('testData.seed.success'))
    } catch (err) {
      error(t('testData.seed.error'))
    } finally {
      setIsSeeding(false)
    }
  }

  const handleQuickLogin = (email, password) => {
    const user = quickLogin(email, password)
    if (user) {
      login(user)
      success(t('testData.login.success', { company: user.companyName }))
      setTimeout(() => {
        navigate(
          user.type === 'admin'
            ? '/admin'
            : user.type === 'manufacturer'
              ? '/dashboard/manufacturer'
              : '/dashboard/supplier'
        )
      }, 500)
    } else {
      error(t('testData.login.error'))
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('testData.title')}
            </h1>
            <p className="text-text-gray">
              {t('testData.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className={`flex items-center space-x-3 ${language === 'ar' ? 'space-x-reverse' : ''} mb-4`}>
                <Database className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-cairo font-bold text-text-dark">{t('testData.seed.title')}</h2>
              </div>
              <p className="text-text-gray mb-6">
                {t('testData.seed.description')}
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleSeedData}
                disabled={isSeeding}
              >
                <RefreshCw className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} ${isSeeding ? 'animate-spin' : ''}`} />
                {isSeeding ? t('testData.seed.loading') : t('testData.seed.button')}
              </Button>
            </Card>

            <Card>
              <div className={`flex items-center space-x-3 ${language === 'ar' ? 'space-x-reverse' : ''} mb-4`}>
                <UserCheck className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-cairo font-bold text-text-dark">{t('testData.quickLogin.title')}</h2>
              </div>
              <p className="text-text-gray mb-6">
                {t('testData.quickLogin.description')}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleQuickLogin('manufacturer@test.com', 'password123')}
                >
                  <LogIn className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('testData.quickLogin.manufacturer')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleQuickLogin('supplier@test.com', 'password123')}
                >
                  <LogIn className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('testData.quickLogin.supplier')}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleQuickLogin('admin@test.com', 'password123')}
                >
                  <LogIn className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('testData.quickLogin.admin')}
                </Button>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('testData.testAccounts.title')}</h3>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold text-text-dark mb-2">{t('testData.testAccounts.manufacturer')}</h4>
                <p className="text-sm text-text-gray mb-1"><strong>{t('testData.testAccounts.emailLabel')}</strong> manufacturer@test.com</p>
                <p className="text-sm text-text-gray mb-1"><strong>{t('testData.testAccounts.passwordLabel')}</strong> password123</p>
                <p className="text-sm text-text-gray"><strong>{t('testData.testAccounts.companyLabel')}</strong> Tech Industries Co.</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold text-text-dark mb-2">{t('testData.testAccounts.supplier')}</h4>
                <p className="text-sm text-text-gray mb-1"><strong>{t('testData.testAccounts.emailLabel')}</strong> supplier@test.com</p>
                <p className="text-sm text-text-gray mb-1"><strong>{t('testData.testAccounts.passwordLabel')}</strong> password123</p>
                <p className="text-sm text-text-gray"><strong>{t('testData.testAccounts.companyLabel')}</strong> Global Materials Ltd.</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold text-text-dark mb-2">{t('testData.testAccounts.admin')}</h4>
                <p className="text-sm text-text-gray mb-1"><strong>{t('testData.testAccounts.emailLabel')}</strong> admin@test.com</p>
                <p className="text-sm text-text-gray mb-1"><strong>{t('testData.testAccounts.passwordLabel')}</strong> password123</p>
                <p className="text-sm text-text-gray"><strong>{t('testData.testAccounts.companyLabel')}</strong> DealZone Admin</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TestData

