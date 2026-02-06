import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  MapPin, 
  Calendar,
  DollarSign,
  Package,
  ArrowLeft,
  Send
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateNumber, validateRequired } from '../utils/validation'

const RequestDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, requests, addOffer } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerData, setOfferData] = useState({
    price: '',
    deliveryDate: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const request = requests.find(r => String(r.id) === String(id))

  if (!request) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-text-gray">{t('marketplace.noRequests')}</p>
                <Button variant="outline" onClick={() => navigate('/marketplace')} className="mt-4">
                  {t('request.backToMarketplace')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const displayedTitle = getText(request.title)
  const displayedDescription = getText(request.description)
  const displayedSpecifications =
    typeof request.specifications === 'object'
      ? (request.specifications?.[language] || request.specifications?.en || request.specifications?.ar || {})
      : (request.specifications || {})

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/marketplace" className={`inline-flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary mb-6 transition-colors`}>
            <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t('request.backToMarketplace')}</span>
          </Link>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-cairo font-bold text-text-dark mb-4">
                      {displayedTitle}
                    </h1>
                    <div className={`flex items-center space-x-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                      <span className="inline-block bg-secondary text-text-dark px-3 py-1 rounded-full text-sm font-medium">
                        {t(`category.${request.categoryKey || request.category}`)}
                      </span>
                      {request.verified && (
                        <span className={`flex items-center space-x-1 ${language === 'ar' ? 'space-x-reverse' : ''} text-primary text-sm`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>{t('request.verifiedManufacturer')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray`}>
                    <MapPin className="w-5 h-5" />
                    <span>{request.location}</span>
                  </div>
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray`}>
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold text-text-dark">{t('request.budget')}: {request.budget}</span>
                  </div>
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray`}>
                    <Calendar className="w-5 h-5" />
                    <span>{t('request.posted')} {request.date}</span>
                  </div>
                </div>

                <div className="border-t border-secondary pt-6">
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-4">{t('request.description')}</h2>
                  <p className="text-text-gray leading-relaxed">{displayedDescription}</p>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-cairo font-bold text-text-dark mb-4">{t('request.specifications')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(displayedSpecifications).map(([key, value]) => (
                    <div key={key} className="border-b border-secondary pb-3">
                      <p className="text-sm text-text-gray mb-1">{key}</p>
                      <p className="font-semibold text-text-dark">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('request.manufacturerInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-text-dark mb-1">{request.manufacturerInfo.name}</p>
                    {request.manufacturerInfo.verified && (
                      <span className={`inline-flex items-center space-x-1 ${language === 'ar' ? 'space-x-reverse' : ''} text-primary text-sm`}>
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('request.verified')}</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-gray">{t('request.rating')}</p>
                      <p className="font-semibold text-text-dark">{request.manufacturerInfo.rating}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-gray">{t('request.totalDeals')}</p>
                      <p className="font-semibold text-text-dark">{request.manufacturerInfo.totalDeals}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="space-y-4">
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => {
                      if (!user) {
                        error(t('request.pleaseLogin'))
                        navigate('/login')
                        return
                      }
                      setShowOfferModal(true)
                    }}
                  >
                    <Send className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t('request.sendOffer')}
                  </Button>
                </div>
              </Card>
              
              {/* Send Offer Modal */}
              <Modal
                isOpen={showOfferModal}
                onClose={() => {
                  setShowOfferModal(false)
                  setOfferData({ price: '', deliveryDate: '', notes: '' })
                }}
                title={t('request.sendOfferTitle')}
              >
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  setIsSubmitting(true)

                  const errors = {}
                  if (!validateRequired(offerData.price) || !validateNumber(offerData.price, 0.01)) {
                    errors.price = t('request.priceRequired')
                  }
                  if (!validateRequired(offerData.deliveryDate)) {
                    errors.deliveryDate = t('request.deliveryDateRequired')
                  }

                  if (Object.keys(errors).length > 0) {
                    error(t('request.fillAllFields'))
                    setIsSubmitting(false)
                    return
                  }

                  try {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    addOffer({
                      requestId: parseInt(id),
                      requestTitle: displayedTitle,
                      manufacturerId: request.manufacturerId,
                      manufacturerName: request.manufacturer,
                      supplierId: user?.id,
                      supplierName: user?.companyName,
                      price: parseFloat(offerData.price),
                      deliveryDate: offerData.deliveryDate,
                      notes: offerData.notes,
                    })
                    success(t('request.offerSentSuccess'))
                    setShowOfferModal(false)
                    setOfferData({ price: '', deliveryDate: '', notes: '' })
                  } catch (err) {
                    error(t('request.offerSentFailed'))
                  } finally {
                    setIsSubmitting(false)
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">{t('request.price')} *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={offerData.price}
                      onChange={(e) => setOfferData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('request.pricePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">{t('request.deliveryDate')} *</label>
                    <input
                      type="date"
                      value={offerData.deliveryDate}
                      onChange={(e) => setOfferData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">{t('request.notes')}</label>
                    <textarea
                      rows="4"
                      value={offerData.notes}
                      onChange={(e) => setOfferData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('request.notesPlaceholder')}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowOfferModal(false)
                        setOfferData({ price: '', deliveryDate: '', notes: '' })
                      }}
                      disabled={isSubmitting}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? t('request.sending') : t('request.sendOffer')}
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetails

