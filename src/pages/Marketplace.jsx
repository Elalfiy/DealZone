import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Star, 
  CheckCircle, 
  Recycle,
  Package,
  FileText,
  MapPin
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'
import { useApp } from '../context/AppContext'

const Marketplace = () => {
  const { t, language } = useTranslation()
  const { user, products: contextProducts, requests: contextRequests } = useApp()
  const [activeTab, setActiveTab] = useState('products')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [sortBy, setSortBy] = useState('default')

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  const allProducts = contextProducts
  const allRequests = contextRequests

  // Filter and search products
  const filteredProducts = allProducts.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const productName = getText(product.name).toLowerCase()
      const productDesc = getText(product.description).toLowerCase()
      const supplierName = getCompanyText(product.supplier, product.supplierAr).toLowerCase()
      if (!productName.includes(query) && !supplierName.includes(query) && !productDesc.includes(query)) {
        return false
      }
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      if ((product.categoryKey || product.category) !== selectedCategory) return false
    }
    
    // Price range filter
    if (selectedPriceRange !== 'All' && product.price) {
      const price = typeof product.price === 'number' ? product.price : parseFloat(product.price)
      if (selectedPriceRange.includes('Under') || selectedPriceRange.includes('أقل من')) {
        if (price >= 1000) return false
      } else if (selectedPriceRange.includes('1,000 - 5,000') || selectedPriceRange.includes('1,000 - 5,000 ج.م')) {
        if (price < 1000 || price > 5000) return false
      } else if (selectedPriceRange.includes('5,000 - 10,000') || selectedPriceRange.includes('5,000 - 10,000 ج.م')) {
        if (price < 5000 || price > 10000) return false
      } else if (selectedPriceRange.includes('10,000+') || selectedPriceRange.includes('أكثر من 10,000 ج.م')) {
        if (price < 10000) return false
      }
    }
    
    // Location filter
    if (selectedLocation !== 'All') {
      const locationMap = {
        'Cairo': 'Cairo',
        'Alexandria': 'Alexandria',
        'Giza': 'Giza',
        'القاهرة': 'Cairo',
        'الإسكندرية': 'Alexandria',
        'الجيزة': 'Giza',
      }
      const mappedLocation = locationMap[selectedLocation] || selectedLocation
      if (!product.location.includes(mappedLocation)) return false
    }
    
    return true
  }).sort((a, b) => {
    // Sort products
    if (sortBy === 'price-low') {
      return (a.price || 0) - (b.price || 0)
    } else if (sortBy === 'price-high') {
      return (b.price || 0) - (a.price || 0)
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0)
    }
    return 0
  })

  // Filter and search requests
  const filteredRequests = allRequests.filter(request => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const requestTitle = getText(request.title).toLowerCase()
      const requestDesc = getText(request.description).toLowerCase()
      const manufacturerName = getCompanyText(request.manufacturer, request.manufacturerAr).toLowerCase()
      if (!requestTitle.includes(query) && !manufacturerName.includes(query) && !requestDesc.includes(query)) {
        return false
      }
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      if ((request.categoryKey || request.category) !== selectedCategory) return false
    }
    
    // Location filter
    if (selectedLocation !== 'All') {
      const locationMap = {
        'Cairo': 'Cairo',
        'Alexandria': 'Alexandria',
        'Giza': 'Giza',
        'القاهرة': 'Cairo',
        'الإسكندرية': 'Alexandria',
        'الجيزة': 'Giza',
      }
      const mappedLocation = locationMap[selectedLocation] || selectedLocation
      if (!request.location.includes(mappedLocation)) return false
    }
    
    return true
  })

  const filters = {
    category: [
      { key: 'all', label: t('category.all') },
      { key: 'textiles', label: t('category.textiles') },
      { key: 'food', label: t('category.food') },
      { key: 'metals', label: t('category.metals') },
    ],
    priceRange: language === 'ar'
      ? ['الكل', 'أقل من 1,000 ج.م', '1,000 - 5,000 ج.م', '5,000 - 10,000 ج.م', 'أكثر من 10,000 ج.م']
      : ['All', 'Under 1,000 EGP', '1,000 - 5,000 EGP', '5,000 - 10,000 EGP', '10,000+ EGP'],
    location: language === 'ar'
      ? ['الكل', 'القاهرة', 'الإسكندرية', 'الجيزة', 'أخرى']
      : ['All', 'Cairo', 'Alexandria', 'Giza', 'Other'],
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark mb-4">
              {t('marketplace.title')}
            </h1>
            <p className="text-xl text-text-gray">
              {t('marketplace.discover')}
            </p>
          </motion.div>

          {/* Tabs */}
          <div className={`flex items-center space-x-4 ${language === 'ar' ? 'space-x-reverse' : ''} mb-6 border-b border-secondary`}>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-gray hover:text-text-dark'
              }`}
            >
              <Package className={`w-5 h-5 inline-block ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('marketplace.products')}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-gray hover:text-text-dark'
              }`}
            >
              <FileText className={`w-5 h-5 inline-block ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('marketplace.requests')}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('marketplace.searchPlaceholder')}
                className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} px-6 py-3 border border-secondary rounded-lg hover:bg-secondary transition-colors`}
            >
              <Filter className="w-5 h-5" />
              <span>{t('marketplace.filters')}</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-xl p-6 shadow-soft mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('products.category')}
                  </label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {filters.category.map((cat) => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('marketplace.priceRange')}
                  </label>
                  <select 
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {filters.priceRange.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('marketplace.location')}
                  </label>
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {filters.location.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'}`}>
                  <label className="text-sm font-medium text-text-dark">
                    {t('marketplace.sortBy')}
                  </label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="default">{t('marketplace.default')}</option>
                    <option value="price-low">{t('marketplace.priceLowToHigh')}</option>
                    <option value="price-high">{t('marketplace.priceHighToLow')}</option>
                    <option value="rating">{t('marketplace.rating')}</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedPriceRange('All')
                    setSelectedLocation('All')
                    setSortBy('default')
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {t('marketplace.clearFilters')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <div className="mb-4 text-sm text-text-gray">
            {activeTab === 'products' 
              ? t('marketplace.foundProducts', { count: filteredProducts.length })
              : t('marketplace.foundRequests', { count: filteredRequests.length })
            }
          </div>

          {/* Products Grid */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/product/${encodeURIComponent(String(product.id))}`}>
                    <Card hover>
                      <div className="relative mb-4">
                        <img
                          src={product.image}
                          alt={getText(product.name)}
                          loading="lazy"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            const fallback = `https://picsum.photos/seed/${encodeURIComponent(String(product?.id || getText(product?.name) || 'product'))}/600/400`
                            if (e?.currentTarget?.src !== fallback) {
                              e.currentTarget.src = fallback
                            }
                          }}
                        />
                        {product.redeal && (
                          <div className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                            <Recycle className="w-3 h-3" />
                            <span>{t('marketplace.redeal')}</span>
                          </div>
                        )}
                        {product.verified && (
                          <div className={`absolute top-2 ${language === 'ar' ? 'right-2' : 'left-2'} bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                            <CheckCircle className="w-3 h-3" />
                            <span>{t('marketplace.verified')}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {getText(product.name)}
                      </h3>
                      <p className="text-text-gray mb-3">{product.supplier}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold">{product.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-text-gray text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{product.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(product.price, language)}
                        </span>
                        <Button variant="primary" className="text-sm py-2">
                          {t('marketplace.viewDetails')}
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )) : (
                <div className="col-span-full">
                  <Card>
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-text-light mx-auto mb-4" />
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {t('marketplace.noProducts')}
                      </h3>
                      <p className="text-text-gray">
                        {t('marketplace.tryChangingFilters')}
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Requests Grid */}
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.length > 0 ? filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/request/${request.id}`}>
                    <Card hover>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                            {getText(request.title)}
                          </h3>
                          <p className="text-text-gray text-sm mb-2">{request.manufacturer}</p>
                          <span className="inline-block bg-secondary text-text-dark px-3 py-1 rounded-full text-xs font-medium">
                            {t(`category.${request.categoryKey || request.category}`)}
                          </span>
                        </div>
                        {request.verified && (
                          <span className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} text-primary text-sm`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('marketplace.verified')}</span>
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-sm text-text-gray`}>
                          <MapPin className="w-4 h-4" />
                          <span>{request.location}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-text-gray">{t('marketplace.budget')}</span>
                          <span className="font-semibold text-text-dark">
                            {request.budget === 'Negotiable' 
                              ? t('marketplace.negotiable')
                              : request.budget.includes('-') 
                                ? request.budget.split(' - ').map(b => formatPrice(parseFloat(b), language)).join(' - ')
                                : request.budget.includes('+')
                                  ? formatPrice(parseFloat(request.budget.replace('+', '')), language) + '+'
                                  : formatPrice(parseFloat(request.budget), language)
                            }
                          </span>
                        </div>
                        <div className="text-xs text-text-light">{request.date}</div>
                      </div>
                      {user && user.type === 'supplier' ? (
                        <Button variant="primary" className="w-full">
                          {t('marketplace.sendOffer')}
                        </Button>
                      ) : !user ? (
                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault()
                            window.location.href = '/login'
                          }}
                        >
                          {t('marketplace.loginToSendOffer')}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full">
                          {t('marketplace.viewDetails')}
                        </Button>
                      )}
                    </Card>
                  </Link>
                </motion.div>
              )) : (
                <div className="col-span-full">
                  <Card>
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-text-light mx-auto mb-4" />
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {t('marketplace.noRequests')}
                      </h3>
                      <p className="text-text-gray">
                        {t('marketplace.tryChangingFilters')}
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Marketplace