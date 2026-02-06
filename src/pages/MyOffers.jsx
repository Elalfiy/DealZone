import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const MyOffers = () => {
  const { user, offers } = useApp()
  const { t, language } = useTranslation()
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const myOffers = offers.filter(o => o.supplierId === user?.id) || []

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-8`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-cairo font-bold text-text-dark mb-8">
            {t('offers.myOffers')}
          </h1>
          <div className="space-y-4">
            {myOffers.map((offer) => (
              <Card key={offer.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                      {getCompanyText(offer.productName || offer.requestTitle, offer.productNameAr || offer.requestTitleAr)}
                    </h3>
                    <p className="text-text-gray mb-4">
                      {t('offers.to')}: {getCompanyText(offer.manufacturerName, offer.manufacturerNameAr)}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-text-gray">{t('offers.price')}</p>
                        <p className="font-semibold text-text-dark">
                          {offer.pricePerUnit 
                            ? `${formatPrice(offer.pricePerUnit, language)}/${t('offers.unit')}`
                            : formatPrice(offer.price, language)
                          }
                        </p>
                      </div>
                      {offer.quantity && (
                        <div>
                          <p className="text-sm text-text-gray">{t('offers.quantity')}</p>
                          <p className="font-semibold text-text-dark">{offer.quantity}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-text-gray">{t('offers.total')}</p>
                        <p className="font-semibold text-primary">
                          {formatPrice(offer.totalAmount || (offer.pricePerUnit * offer.quantity) || offer.price, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={language === 'ar' ? 'mr-6' : 'ml-6'}>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {offer.status === 'accepted' ? t('offers.accepted') :
                       offer.status === 'rejected' ? t('offers.rejected') :
                       t('offers.pending')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedOffer(offer)
                      setShowDetailModal(true)
                    }}
                  >
                    <Eye className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t('offers.viewDetails')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Offer Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedOffer(null)
        }}
        title={t('offers.offerDetails')}
        size="lg"
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-text-dark mb-2">
                {getCompanyText(selectedOffer.productName || selectedOffer.requestTitle, selectedOffer.productNameAr || selectedOffer.requestTitleAr)}
              </h3>
              <p className="text-sm text-text-gray">
                {t('offers.to')}: {getCompanyText(selectedOffer.manufacturerName, selectedOffer.manufacturerNameAr)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-gray mb-1">{t('offers.price')}</p>
                <p className="font-semibold text-text-dark">
                  {selectedOffer.pricePerUnit 
                    ? `${formatPrice(selectedOffer.pricePerUnit, language)}/${t('offers.unit')}`
                    : formatPrice(selectedOffer.price, language)
                  }
                </p>
              </div>
              {selectedOffer.quantity && (
                <div>
                  <p className="text-sm text-text-gray mb-1">{t('offers.quantity')}</p>
                  <p className="font-semibold text-text-dark">{selectedOffer.quantity}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-text-gray mb-1">{t('offers.total')}</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(selectedOffer.totalAmount || (selectedOffer.pricePerUnit * selectedOffer.quantity) || selectedOffer.price, language)}
                </p>
              </div>
            </div>
            {selectedOffer.deliveryDate && (
              <div>
                <p className="text-sm text-text-gray mb-1">{t('offers.deliveryDate')}</p>
                <p className="font-semibold text-text-dark">{new Date(selectedOffer.deliveryDate).toLocaleDateString()}</p>
              </div>
            )}
            {selectedOffer.notes && (
              <div>
                <p className="text-sm text-text-gray mb-1">{t('offers.notes')}</p>
                <p className="text-text-dark">{selectedOffer.notes}</p>
              </div>
            )}
            {selectedOffer.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  {t('offers.rejectionReason')}:
                </p>
                <p className="text-sm text-red-700">{selectedOffer.rejectionReason}</p>
              </div>
            )}
            <div className="pt-4 border-t border-secondary">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedOffer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                selectedOffer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedOffer.status === 'accepted' ? t('offers.accepted') :
                 selectedOffer.status === 'rejected' ? t('offers.rejected') :
                 t('offers.pending')}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyOffers

