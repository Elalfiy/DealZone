import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const Footer = () => {
  const { t, language } = useTranslation()
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-text-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                <img
                  src="/DealZone%20Logo.jpeg"
                  alt={t('aria.home')}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-2xl font-cairo font-bold">DealZone</span>
            </Link>
            <p className="text-gray-400 text-sm">
              {t('footer.tagline')}
            </p>
            <p className="text-gray-500 text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-cairo font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.marketplace')}
                </Link>
              </li>
              <li>
                <Link to="/redeal" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.redeal')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.signup')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.adminPanel')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-cairo font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.support.helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.support.escrowGuide')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.support.shippingInfo')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.support.contactUs')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-cairo font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-gray-400 text-sm`}>
                <Mail className="w-4 h-4" />
                <span>{t('footer.contact.email')}</span>
              </li>
              <li className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-gray-400 text-sm`}>
                <Phone className="w-4 h-4" />
                <span>{t('footer.contact.phone')}</span>
              </li>
              <li className={`flex items-start space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-gray-400 text-sm`}>
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{t('footer.contact.address')}</span>
              </li>
            </ul>
            <div className={`flex space-x-4 ${language === 'ar' ? 'space-x-reverse' : ''} mt-4`}>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>{t('footer.copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

