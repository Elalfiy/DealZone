import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Star, 
  MapPin, 
  Package, 
  TrendingUp,
  FileText,
  Clock,
  Truck,
  ArrowLeft,
  Building2
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const ViewSupplier = () => {
  const { supplierId } = useParams()
  const navigate = useNavigate()
  const { user, getSupplierById, getSupplierProducts, addDeal } = useApp()
  const { t, language } = useTranslation()
  const [supplier, setSupplier] = useState(null)
  const [supplierProducts, setSupplierProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supplierId) {
      const supplierData = getSupplierById(parseInt(supplierId))
      const products = getSupplierProducts(parseInt(supplierId))
      setSupplier(supplierData)
      setSupplierProducts(products)
      setLoading(false)
    }
  }, [supplierId, getSupplierById, getSupplierProducts])

  const handleViewReviews = () => {
    navigate(`/reviews?supplier=${supplierId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <Sidebar userType={user?.type} />
        <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-4 md:p-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-text-gray">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <Sidebar userType={user?.type} />
        <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-4 md:p-8`}>
          <div className="max-w-7xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-text-gray">{t('supplier.notFound')}</p>
                <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
                  {t('common.back')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-gray hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>

          {/* Supplier Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-primary" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-cairo font-bold text-text-dark mb-2">
                        {supplier.name}
                      </h1>
                      {supplier.verified && (
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{t('marketplace.verified')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold text-text-dark">
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-text-gray mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.location}</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm text-text-gray">{t('supplier.totalProducts')}</span>
                      </div>
                      <p className="text-2xl font-bold text-text-dark">{supplier.totalProducts}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-text-gray">{t('supplier.completedDeals')}</span>
                      </div>
                      <p className="text-2xl font-bold text-text-dark">{supplier.completedDeals}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-text-gray">{t('supplier.onTimeDelivery')}</span>
                      </div>
                      <p className="text-2xl font-bold text-text-dark">{supplier.onTimeDelivery}%</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-text-gray">{t('supplier.responseTime')}</span>
                      </div>
                      <p className="text-lg font-bold text-text-dark">{supplier.responseTime}</p>
                    </div>
                  </div>

                  {/* KYC Status */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-dark">{t('supplier.kycStatus')}:</span>
                      {supplier.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          {t('supplier.kycVerified')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          <Clock className="w-4 h-4" />
                          {t('supplier.kycPending')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleViewReviews}>
                      <FileText className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('supplier.viewReviews')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">
              {t('supplier.products')} ({supplierProducts.length})
            </h2>
            {supplierProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplierProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card hover>
                      <div className="h-48 bg-secondary rounded-lg mb-4 overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-text-light" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {product.name}
                      </h3>
                      <p className="text-text-gray text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {product.price > 0 
                            ? formatPrice(product.price, language)
                            : t('products.requestQuote')
                          }
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold">{product.rating || 0}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-text-light mx-auto mb-4" />
                  <p className="text-text-gray">{t('supplier.noProducts')}</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ViewSupplier

