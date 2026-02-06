import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, 
  CheckCircle, 
  MapPin, 
  Truck, 
  Shield, 
  Send,
  ShoppingCart,
  ArrowLeft
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'
import { validateNumber, validateRequired } from '../utils/validation'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, products, addOffer, addDeal } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerData, setOfferData] = useState({
    quantity: '',
    pricePerUnit: '',
    deliveryDate: '',
    notes: '',
  })
  const [offerErrors, setOfferErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  const product = products.find(p => String(p.id) === String(id))

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-text-gray">{t('marketplace.noProducts')}</p>
                <Button variant="outline" onClick={() => navigate('/marketplace')} className="mt-4">
                  {t('product.backToMarketplace')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const displayedName = getText(product.name)
  const displayedDescription = getText(product.description)
  const displayedSpecifications =
    typeof product.specifications === 'object'
      ? (product.specifications?.[language] || product.specifications?.en || product.specifications?.ar || {})
      : (product.specifications || {})

  const supplierInfo = {
    name: getCompanyText(product.supplier, product.supplierAr),
    verified: !!product.verified,
    rating: product.rating,
    totalDeals: 0,
    onTimeDelivery: 95,
    responseTime: t('dashboard.responseTimeExample', { hours: '2' }),
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/marketplace" className={`inline-flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary mb-6 transition-colors`}>
            <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t('product.backToMarketplace')}</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Image */}
              <Card>
                <img
                  src={product.image}
                  alt={displayedName}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </Card>

              {/* Description */}
              <Card>
                <h2 className="text-2xl font-cairo font-bold text-text-dark mb-4">{t('product.description')}</h2>
                <p className="text-text-gray leading-relaxed">{displayedDescription}</p>
              </Card>

              {/* Specifications */}
              <Card>
                <h2 className="text-2xl font-cairo font-bold text-text-dark mb-4">{t('product.specifications')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(displayedSpecifications).map(([key, value]) => (
                    <div key={key} className="border-b border-secondary pb-3">
                      <p className="text-sm text-text-gray mb-1">{key}</p>
                      <p className="font-semibold text-text-dark">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Reviews */}
              <Card>
                <div className={`flex items-center ${language === 'ar' ? 'justify-between space-x-reverse' : 'justify-between'} mb-6`}>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark">{t('product.reviews')}</h2>
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'}`}>
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">{product.rating}</span>
                    <span className="text-text-gray">({product.reviews} {t('product.reviewsCount')})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b border-secondary pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">U</span>
                          </div>
                          <div>
                            <p className="font-semibold text-text-dark">{t('product.reviewUser', { number: review })}</p>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-text-light">{t('product.reviewTimeAgo')}</span>
                      </div>
                      <p className="text-text-gray">{t('product.reviewSample')}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Product Info Card */}
              <Card>
                <h1 className="text-3xl font-cairo font-bold text-text-dark mb-4">
                  {displayedName}
                </h1>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-text-gray">({product.reviews})</span>
                  </div>
                  {product.verified && (
                    <span className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} text-primary text-sm`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('product.verified')}</span>
                    </span>
                  )}
                </div>
                <div className="text-4xl font-bold text-primary mb-6">
                  {formatPrice(product.price, language)}
                </div>

                <div className="space-y-3 mb-6">
                  {!user ? (
                    <>
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => navigate('/login')}
                      >
                        {t('product.loginToInteract')}
                      </Button>
                    </>
                  ) : user.type === 'manufacturer' ? (
                    <>
                      <Button variant="primary" className="w-full" onClick={() => setShowOfferModal(true)}>
                        <Send className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('product.sendOffer')}
                      </Button>
                      {product.price && (
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={() => {
                            // Create deal and navigate to escrow
                            const dealId = Date.now()
                            const deal = {
                              id: dealId,
                              productId: parseInt(id),
                              productName: typeof product?.name === 'object' ? (product?.name?.en || displayedName) : displayedName,
                              productNameAr: typeof product?.name === 'object' ? (product?.name?.ar || '') : '',
                              supplierId: product.supplierId,
                              supplierName: product.supplier,
                              supplierNameAr: product.supplierAr || '',
                              manufacturerId: user.id,
                              manufacturerName: user.companyName,
                              manufacturerNameAr: user.companyNameAr || '',
                              amount: typeof product.price === 'number' ? product.price : parseFloat(String(product.price || '0').replace(/[^0-9.]/g, '') || '0'),
                              status: 'created',
                            }
                            addDeal(deal)
                            success(t('product.dealCreated'))
                            setTimeout(() => {
                              navigate(`/escrow/${dealId}`)
                            }, 1000)
                          }}
                        >
                          <ShoppingCart className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {t('product.startDeal')}
                        </Button>
                      )}
                    </>
                  ) : user.type === 'supplier' ? (
                    <>
                      {product.supplierId === user.id ? (
                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={() => navigate('/my-products')}
                        >
                          {t('product.editProduct')}
                        </Button>
                      ) : (
                        <></>
                      )}
                    </>
                  ) : null}
                </div>

                <div className="border-t border-secondary pt-6 space-y-4">
                  <div className="flex items-center space-x-2 text-text-gray">
                    <MapPin className="w-5 h-5" />
                    <span>{product.location}</span>
                  </div>
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray`}>
                    <Truck className="w-5 h-5" />
                    <span>{t('product.freeShipping', { amount: formatPrice(5000, language) })}</span>
                  </div>
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray`}>
                    <Shield className="w-5 h-5" />
                    <span>{t('product.escrowProtection')}</span>
                  </div>
                </div>
              </Card>

              {/* Supplier Info */}
              <Card>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('product.supplierInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-text-dark mb-1">{supplierInfo.name}</p>
                    {supplierInfo.verified && (
                      <span className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} text-primary text-sm`}>
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('product.verifiedSupplier')}</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-gray">{t('product.rating')}</p>
                      <p className="font-semibold text-text-dark">{supplierInfo.rating}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-gray">{t('product.totalDeals')}</p>
                      <p className="font-semibold text-text-dark">{supplierInfo.totalDeals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-gray">{t('product.onTimeDelivery')}</p>
                      <p className="font-semibold text-text-dark">{supplierInfo.onTimeDelivery}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-gray">{t('product.responseTime')}</p>
                      <p className="font-semibold text-text-dark">{supplierInfo.responseTime}</p>
                    </div>
                  </div>
                  <Link to={`/supplier/${product.supplierId}`}>
                    <Button variant="outline" className="w-full">
                      {t('product.viewSupplierProfile')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Send Offer Modal */}
      <Modal
        isOpen={showOfferModal}
        onClose={() => {
          setShowOfferModal(false)
          setOfferData({ quantity: '', pricePerUnit: '', deliveryDate: '', notes: '' })
          setOfferErrors({})
        }}
        title={t('product.sendOffer')}
      >
        <form onSubmit={async (e) => {
          e.preventDefault()
          setIsSubmitting(true)
          setOfferErrors({})

          // Validation
          const errors = {}
          if (!validateRequired(offerData.quantity) || !validateNumber(offerData.quantity, 1)) {
            errors.quantity = t('product.validQuantityRequired')
          }
          if (!validateRequired(offerData.pricePerUnit) || !validateNumber(offerData.pricePerUnit, 0.01)) {
            errors.pricePerUnit = t('product.validPriceRequired')
          }
          if (!validateRequired(offerData.deliveryDate)) {
            errors.deliveryDate = t('product.deliveryDateRequired')
          }

          if (Object.keys(errors).length > 0) {
            setOfferErrors(errors)
            setIsSubmitting(false)
            return
          }

          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            addOffer({
              productId: parseInt(id),
              productName: typeof product?.name === 'object' ? (product?.name?.en || displayedName) : displayedName,
              productNameAr: typeof product?.name === 'object' ? (product?.name?.ar || '') : '',
              supplierId: product.supplierId,
              supplierName: product.supplier,
              supplierNameAr: product.supplierAr || '',
              manufacturerId: user?.id,
              manufacturerName: user?.companyName,
              manufacturerNameAr: user?.companyNameAr || '',
              quantity: parseFloat(offerData.quantity),
              pricePerUnit: parseFloat(offerData.pricePerUnit),
              totalAmount: parseFloat(offerData.quantity) * parseFloat(offerData.pricePerUnit),
              deliveryDate: offerData.deliveryDate,
              notes: offerData.notes,
            })

            success(t('product.offerSentSuccess'))
            setShowOfferModal(false)
            setOfferData({ quantity: '', pricePerUnit: '', deliveryDate: '', notes: '' })
          } catch (err) {
            error(t('product.offerSentFailed'))
          } finally {
            setIsSubmitting(false)
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">{t('product.quantity')} *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={offerData.quantity}
              onChange={(e) => setOfferData(prev => ({ ...prev, quantity: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                offerErrors.quantity ? 'border-red-500' : 'border-secondary'
              }`}
              placeholder={t('product.enterQuantity')}
              required
            />
            {offerErrors.quantity && (
              <p className="text-sm text-red-600 mt-1">{offerErrors.quantity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {t('product.pricePerUnit')} *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={offerData.pricePerUnit}
              onChange={(e) => setOfferData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                offerErrors.pricePerUnit ? 'border-red-500' : 'border-secondary'
              }`}
              placeholder={t('product.enterPrice')}
              required
            />
            {offerErrors.pricePerUnit && (
              <p className="text-sm text-red-600 mt-1">{offerErrors.pricePerUnit}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">{t('product.deliveryDate')} *</label>
            <input
              type="date"
              value={offerData.deliveryDate}
              onChange={(e) => setOfferData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                offerErrors.deliveryDate ? 'border-red-500' : 'border-secondary'
              }`}
              required
            />
            {offerErrors.deliveryDate && (
              <p className="text-sm text-red-600 mt-1">{offerErrors.deliveryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">{t('product.notesOptional')}</label>
            <textarea
              rows="4"
              value={offerData.notes}
              onChange={(e) => setOfferData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
              placeholder={t('product.addNotes')}
            />
          </div>
          {offerData.quantity && offerData.pricePerUnit && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-text-gray">{t('product.totalAmount')}</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(parseFloat(offerData.quantity || 0) * parseFloat(offerData.pricePerUnit || 0), language)}
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setShowOfferModal(false)
                setOfferData({ quantity: '', pricePerUnit: '', deliveryDate: '', notes: '' })
                setOfferErrors({})
              }}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? t('product.sending') : t('product.sendOffer')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProductDetails

