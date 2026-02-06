import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Recycle, 
  Search, 
  Filter, 
  Star, 
  CheckCircle, 
  MapPin,
  Package
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useTranslation } from '../hooks/useTranslation'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/translations'

const ReDealZone = () => {
  const { t, language } = useTranslation()
  const { products } = useApp()

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const redealProducts = (products || []).filter(p => !!p.redeal)

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Recycle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark">
                  {t('redeal.whatIsReDeal') || 'ReDeal Zone'}
                </h1>
                <p className="text-text-gray">{t('redeal.description') || 'Surplus materials at discounted prices'}</p>
              </div>
            </div>
          </motion.div>


          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light`} />
              <input
                type="text"
                placeholder={t('redeal.searchPlaceholder')}
                className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent`}
              />
            </div>
            <button className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} px-6 py-3 border border-secondary rounded-lg hover:bg-secondary transition-colors`}>
              <Filter className="w-5 h-5" />
              <span>{t('marketplace.filters')}</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redealProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/product/${product.id}`}>
                  <Card hover>
                    <div className="relative mb-4">
                      <img
                        src={product.image}
                        alt={getText(product.name)}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                        <Recycle className="w-3 h-3" />
                        <span>{t('marketplace.redeal')}</span>
                      </div>
                      {product.verified && (
                        <div className={`absolute bottom-2 ${language === 'ar' ? 'right-2' : 'left-2'} bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                          <CheckCircle className="w-3 h-3" />
                          <span>{t('marketplace.verified')}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                      {getText(product.name)}
                    </h3>
                    <p className="text-text-gray mb-3">{product.supplier}</p>
                    <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} mb-3`}>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{product.rating}</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-accent">{formatPrice(product.price, language)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} text-text-gray text-sm`}>
                        <MapPin className="w-4 h-4" />
                        <span>{product.location}</span>
                      </div>
                      <Button variant="primary" className="text-sm py-2">
                        {t('marketplace.viewDetails')}
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Recycle className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-cairo font-bold text-text-dark mb-2">{t('redeal.item3')}</h3>
                  <p className="text-sm text-text-gray">
                    {t('redeal.reduceWasteDescription')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-cairo font-bold text-text-dark mb-2">{t('marketplace.redeal')}</h3>
                  <p className="text-sm text-text-gray">
                    {t('redeal.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-cairo font-bold text-text-dark mb-2">{t('redeal.sameProtection')}</h3>
                  <p className="text-sm text-text-gray">
                    {t('redeal.sameProtectionDescription')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ReDealZone

