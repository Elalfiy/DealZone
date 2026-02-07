import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, XCircle, Clock, Eye, AlertCircle, Inbox } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import PageTitle from '../components/ui/PageTitle'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const ReceivedOffers = () => {
  const navigate = useNavigate()
  const { user, offers, acceptOffer, rejectOffer } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const receivedOffers = offers.filter(o => o.manufacturerId === user?.id) || []

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
      <MobileDrawer userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8`}> 
        <div className="max-w-7xl mx-auto">
          <PageTitle title={t('offers.received')} />
          {receivedOffers.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={t('offers.noOffers')}
              description={t('offers.noOffersDesc')}
            />
          ) : (
            <div className="space-y-4">
              {receivedOffers.map((offer) => (
              <Card key={offer.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                      {getCompanyText(offer.productName || offer.requestTitle, offer.productNameAr || offer.requestTitleAr)}
                    </h3>
                    <p className="text-text-gray mb-4">
                      {t('offers.from')}{getCompanyText(offer.supplierName, offer.supplierNameAr)}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
                      {offer.status || 'Pending'}
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
                  {offer.status === 'pending' && (
                    <>
                      <Button 
                        variant="primary" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedOffer(offer)
                          setShowAcceptConfirm(true)
                        }}
                      >
                        <CheckCircle className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('offers.acceptOffer')}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-4"
                        onClick={() => {
                          setSelectedOffer(offer)
                          setShowRejectConfirm(true)
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {offer.status === 'accepted' && (
                    <Link to={`/deal/${offers.find(o => o.id === offer.id)?.dealId || ''}`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        {t('offers.viewDeal')}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
              ))}
            </div>
          )}
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
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-2">
                {getCompanyText(selectedOffer.productName || selectedOffer.requestTitle, selectedOffer.productNameAr || selectedOffer.requestTitleAr)}
              </h3>
              <p className="text-text-gray">
                {t('offers.from')}{getCompanyText(selectedOffer.supplierName, selectedOffer.supplierNameAr)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-gray">{t('offers.price')}</p>
                <p className="font-semibold text-text-dark">
                  {selectedOffer.pricePerUnit 
                    ? `${formatPrice(selectedOffer.pricePerUnit, language)}/${t('offers.unit')}`
                    : formatPrice(selectedOffer.price, language)
                  }
                </p>
              </div>
              {selectedOffer.quantity && (
                <div>
                  <p className="text-sm text-text-gray">{t('offers.quantity')}</p>
                  <p className="font-semibold text-text-dark">{selectedOffer.quantity}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-text-gray">{t('offers.total')}</p>
                <p className="font-semibold text-primary">
                  {formatPrice(selectedOffer.totalAmount || (selectedOffer.pricePerUnit * selectedOffer.quantity) || selectedOffer.price, language)}
                </p>
              </div>
              {selectedOffer.deliveryDate && (
                <div>
                  <p className="text-sm text-text-gray">{t('offers.deliveryDate')}</p>
                  <p className="font-semibold text-text-dark">
                    {new Date(selectedOffer.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {selectedOffer.notes && (
              <div>
                <p className="text-sm text-text-gray mb-1">{t('offers.notes')}</p>
                <p className="text-text-dark">{selectedOffer.notes}</p>
              </div>
            )}
            <div className="pt-4 border-t border-secondary">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false)
                    setShowAcceptConfirm(true)
                  }}
                >
                  {t('offers.acceptOffer')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false)
                    setShowRejectConfirm(true)
                  }}
                >
                  {t('offers.rejectOffer')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Accept Offer Confirmation Modal */}
      <Modal
        isOpen={showAcceptConfirm}
        onClose={() => {
          setShowAcceptConfirm(false)
          setSelectedOffer(null)
        }}
        title={t('offers.acceptOffer')}
      >
        {selectedOffer && (
          <div className="space-y-4">
            <p className="text-text-gray">
              {t('offers.confirmAccept', { 
                supplier: getCompanyText(selectedOffer.supplierName, selectedOffer.supplierNameAr), 
                amount: formatPrice(selectedOffer.totalAmount || (selectedOffer.pricePerUnit * selectedOffer.quantity) || selectedOffer.price, language) 
              })}
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAcceptConfirm(false)
                  setSelectedOffer(null)
                }}
                disabled={isProcessing}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={async () => {
                  setIsProcessing(true)
                  try {
                    const deal = acceptOffer(selectedOffer.id)
                    if (deal) {
                      success(t('offers.offerAccepted'))
                      setShowAcceptConfirm(false)
                      setSelectedOffer(null)
                      // Navigate to escrow payment
                      setTimeout(() => {
                        navigate(`/escrow/${deal.id}`)
                      }, 1000)
                    } else {
                      error(t('offers.acceptFailed'))
                    }
                  } catch (err) {
                    error(t('offers.acceptFailed'))
                  } finally {
                    setIsProcessing(false)
                  }
                }}
                disabled={isProcessing}
              >
                {isProcessing ? t('common.loading') : t('action.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Offer Confirmation Modal */}
      <Modal
        isOpen={showRejectConfirm}
        onClose={() => {
          setShowRejectConfirm(false)
          setSelectedOffer(null)
          setRejectReason('')
        }}
        title={t('offers.rejectOffer')}
      >
        {selectedOffer && (
          <div className="space-y-4">
            <p className="text-text-gray">
              {t('offers.confirmReject', { 
                supplier: getCompanyText(selectedOffer.supplierName, selectedOffer.supplierNameAr) 
              })}
            </p>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                {t('offers.rejectionReason')} ({t('common.optional')})
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                placeholder={t('offers.rejectionReasonPlaceholder')}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectConfirm(false)
                  setSelectedOffer(null)
                  setRejectReason('')
                }}
                disabled={isProcessing}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={async () => {
                  setIsProcessing(true)
                  try {
                    rejectOffer(selectedOffer.id, rejectReason)
                    success(t('offers.offerRejected'))
                    setShowRejectConfirm(false)
                    setSelectedOffer(null)
                    setRejectReason('')
                  } catch (err) {
                    error(t('offers.rejectFailed'))
                  } finally {
                    setIsProcessing(false)
                  }
                }}
                disabled={isProcessing}
              >
                {isProcessing ? t('common.loading') : t('action.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReceivedOffers

