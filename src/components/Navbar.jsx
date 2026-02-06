import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, User, Languages, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'

const Navbar = () => {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  
  const isAuthenticated = !!user
  const userType = user?.type

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-soft' : 'bg-white/98 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Enhanced styling, fixed position, responsive */}
          <Link 
            to="/" 
            className={`flex items-center space-x-3 ${language === 'ar' ? 'space-x-reverse' : ''} group flex-shrink-0 hover:opacity-90 transition-opacity`}
            aria-label={t('aria.home')}
            onClick={handleLogoClick}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0 overflow-hidden">
              <img
                src="/DealZone%20Logo.jpeg"
                alt={t('aria.home')}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <span className="text-2xl sm:text-3xl font-cairo font-bold text-text-dark whitespace-nowrap tracking-tight">DealZone</span>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center space-x-8 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
            <Link to="/marketplace" className="text-text-gray hover:text-primary transition-colors font-medium">
              {t('nav.marketplace')}
            </Link>
            <Link to="/about" className="text-text-gray hover:text-primary transition-colors font-medium">
              {t('nav.about')}
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-text-gray hover:text-primary transition-colors font-medium">
                  {t('nav.login')}
                </Link>
                <Link to="/signup" className="btn-primary">
                  {t('nav.signup')}
                </Link>
              </>
            ) : (
              <>
                {userType === 'admin' ? (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium`}
                  >
                    <span>{t('nav.adminPanel')}</span>
                  </Link>
                ) : (
                  <Link
                    to={userType === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier'}
                    className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary transition-colors`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{t('nav.dashboard')}</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary transition-colors font-medium`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            )}
            <button
              onClick={toggleLanguage}
              className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} px-3 py-2 rounded-lg hover:bg-secondary transition-colors`}
              title={language === 'en' ? t('nav.switchToArabic') : t('nav.switchToEnglish')}
            >
              <Languages className="w-5 h-5 text-text-gray" />
              <span className="font-medium text-text-gray">{language === 'en' ? t('nav.langShortArabic') : t('nav.langShortEnglish')}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-secondary"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/marketplace"
                className="block text-text-gray hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.marketplace')}
              </Link>
              <Link
                to="/about"
                className="block text-text-gray hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="block text-text-gray hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="block btn-primary text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              ) : (
                <>
                  {userType === 'admin' ? (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.adminPanel')}
                    </Link>
                  ) : (
                    <Link
                      to={userType === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier'}
                      className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary transition-colors font-medium`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary transition-colors font-medium`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  toggleLanguage()
                  setIsMobileMenuOpen(false)
                }}
                className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} w-full text-text-gray hover:text-primary transition-colors font-medium`}
              >
                <Languages className="w-5 h-5" />
                <span>{language === 'en' ? t('nav.langShortArabic') : t('nav.langShortEnglish')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar

