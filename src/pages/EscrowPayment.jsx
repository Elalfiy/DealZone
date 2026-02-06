import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  Lock, 
  Truck, 
  DollarSign,
  ArrowRight,
  Shield,
  Info
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const EscrowPayment = () => {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const { deals, updateDeal } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  
  const deal = deals.find(d => d.id === parseInt(dealId))

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">{t('escrow.dealNotFound')}</h3>
                <p className="text-text-gray">{t('escrow.dealNotFoundDesc')}</p>
                <div className="mt-6">
                  <Link to="/deal-tracking">
                    <Button variant="outline">{t('deal.backToDashboard')}</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  
  const fee = deal.amount * 0.01
  const total = deal.amount + fee

  // Determine step status based on deal state
  const getStepStatus = (stepId) => {
    if (deal.paymentStatus === 'completed') {
      if (stepId <= 2) return 'completed'
      if (deal.escrowStatus === 'held') return stepId === 2 ? 'current' : 'pending'
      if (deal.status === 'shipped') return stepId <= 3 ? 'completed' : stepId === 4 ? 'current' : 'pending'
      if (deal.status === 'delivered') return stepId <= 4 ? 'completed' : stepId === 5 ? 'current' : 'pending'
      if (deal.status === 'completed') return 'completed'
    }
    return stepId === 1 ? 'current' : 'pending'
  }

  const steps = [
    { id: 1, key: 'pay', name: t('escrow.pay'), status: getStepStatus(1), description: t('escrow.paymentReceived') },
    { id: 2, key: 'held', name: t('escrow.held'), status: getStepStatus(2), description: t('escrow.fundsHeld') },
    { id: 3, key: 'delivery', name: t('escrow.delivery'), status: getStepStatus(3), description: t('escrow.awaitingShipment') },
    { id: 4, key: 'confirmation', name: t('escrow.confirmation'), status: getStepStatus(4), description: t('escrow.confirmReceipt') },
    { id: 5, key: 'release', name: t('escrow.release'), status: getStepStatus(5), description: t('escrow.paymentReleased') },
  ]

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Validation
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      error(t('escrow.invalidCard'))
      setIsProcessing(false)
      return
    }
    if (!paymentData.expiry || !/^\d{2}\/\d{2}$/.test(paymentData.expiry)) {
      error(t('escrow.invalidExpiry'))
      setIsProcessing(false)
      return
    }
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      error(t('escrow.invalidCVV'))
      setIsProcessing(false)
      return
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update deal status
      updateDeal(parseInt(dealId), {
        status: 'paid',
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString(),
        escrowStatus: 'held',
      })

      success(t('escrow.paymentSuccess'))
      setTimeout(() => {
        navigate(`/deal/${dealId}`)
      }, 1500)
    } catch (err) {
      error(t('escrow.paymentFailed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const getStepIcon = (step) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />
    } else if (step.status === 'current') {
      return <Clock className="w-6 h-6 text-primary" />
    } else {
      return <div className="w-6 h-6 rounded-full border-2 border-secondary" />
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to={`/deal/${dealId}`} className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray hover:text-primary mb-6 transition-colors`}>
            <ArrowRight className={`w-5 h-5 ${language === 'ar' ? '' : 'rotate-180'}`} />
            <span>{t('escrow.backToDeal')}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('escrow.title')}
            </h1>
            <p className="text-text-gray">{t('escrow.subtitle')}</p>
          </motion.div>


          {/* Progress Steps */}
          <Card className="mb-8">
            <div className="relative">
              {steps.map((step, index) => (
                <div key={step.id} className={`flex items-start ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex flex-col items-center ${language === 'ar' ? 'ml-4' : 'mr-4'}`}>
                    {getStepIcon(step)}
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-16 ${
                        step.status === 'completed' ? 'bg-green-600' : 'bg-secondary'
                      } mt-2`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className={`font-semibold mb-1 ${
                      step.status === 'current' ? 'text-primary' : 
                      step.status === 'completed' ? 'text-green-600' : 'text-text-gray'
                    }`}>
                      {step.name}
                    </h3>
                    <p className="text-sm text-text-gray">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} mb-6`}>
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-cairo font-bold text-text-dark">{t('escrow.paymentDetails')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-secondary">
                    <span className="text-text-gray">{t('escrow.product')}</span>
                    <span className="font-semibold text-text-dark">{getCompanyText(deal.productName, deal.productNameAr)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-secondary">
                    <span className="text-text-gray">{t('escrow.supplier')}</span>
                    <span className="font-semibold text-text-dark">{getCompanyText(deal.supplierName, deal.supplierNameAr)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-secondary">
                    <span className="text-text-gray">{t('escrow.amount')}</span>
                    <span className="font-semibold text-text-dark">{formatPrice(deal.amount, language)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-secondary">
                    <span className="text-text-gray">{t('deal.escrowFee')}</span>
                    <span className="font-semibold text-text-dark">{formatPrice(fee, language)}</span>
                  </div>
                  <div className="flex justify-between py-4 pt-4">
                    <span className="text-lg font-bold text-text-dark">{t('deal.total')}</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(total, language)}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className={`flex items-start ${language === 'ar' ? 'space-x-reverse' : 'space-x-3'} bg-blue-50 border border-blue-200 rounded-lg p-4`}>
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">{t('escrow.howEscrowWorks')}</p>
                    <p>{t('escrow.howEscrowWorksDesc')}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Payment Action */}
            <div>
              <Card>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('escrow.completePayment')}</h3>
                <form onSubmit={handlePayment} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">{t('escrow.paymentMethod')}</label>
                    <select 
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="credit">{t('escrow.creditCard')}</option>
                      <option value="bank">{t('escrow.bankTransfer')}</option>
                      <option value="wallet">{t('escrow.digitalWallet')}</option>
                    </select>
                  </div>
                  {paymentData.paymentMethod === 'credit' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">{t('escrow.cardNumber')}</label>
                        <input
                          type="text"
                          value={paymentData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                            setPaymentData(prev => ({ ...prev, cardNumber: formatted }))
                          }}
                          placeholder={t('escrow.cardNumberPlaceholder')}
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">{t('escrow.expiryDate')}</label>
                          <input
                            type="text"
                            value={paymentData.expiry}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                              const formatted = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value
                              setPaymentData(prev => ({ ...prev, expiry: formatted }))
                            }}
                            placeholder={t('escrow.expiryPlaceholder')}
                            className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">{t('escrow.cvv')}</label>
                          <input
                            type="text"
                            value={paymentData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                              setPaymentData(prev => ({ ...prev, cvv: value }))
                            }}
                            placeholder={t('escrow.cvvPlaceholder')}
                            className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {paymentData.paymentMethod === 'bank' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        {t('escrow.bankTransferDetails')}
                      </p>
                    </div>
                  )}
                  {paymentData.paymentMethod === 'wallet' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        {t('escrow.walletRedirect')}
                      </p>
                    </div>
                  )}
                </form>
                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  <Lock className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {isProcessing 
                  ? t('escrow.processing') 
                  : `${t('escrow.paySecurely')} ${formatPrice(total, language)}`
                }
                </Button>
                <p className="text-xs text-text-gray text-center mt-4">
                  {t('escrow.paymentProtected')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EscrowPayment

