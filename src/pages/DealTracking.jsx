import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Truck, 
  AlertCircle,
  FileText,
  Package,
  ArrowRight
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const DealTracking = () => {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const { deals, user, updateDeal } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDescription, setDisputeDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  const isListView = !dealId
  const userDeals = deals.filter((deal) => {
    if (user?.type === 'manufacturer') {
      return deal.manufacturerId === user?.id
    }
    if (user?.type === 'supplier') {
      return deal.supplierId === user?.id
    }
    return false
  })
  const activeDeals = userDeals.filter((deal) =>
    ['created', 'paid', 'shipped'].includes(deal.status)
  )
  const sortedActiveDeals = [...activeDeals].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )

  const dealStatusLabels = {
    created: t('deal.created'),
    paid: t('deal.paid'),
    shipped: t('deal.shipped'),
    delivered: t('deal.delivered'),
    completed: t('deal.delivered'),
    cancelled: t('admin.statusCancelled'),
  }

  const getDealStatusLabel = (status) => dealStatusLabels[status] || status
  const getDealStatusTone = (status) => {
    switch (status) {
      case 'created':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isListView) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <Sidebar userType={user?.type} />
        <MobileDrawer userType={user?.type} />
        <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8 pb-20`}>
          <div className="max-w-7xl mx-auto">
            <Link
              to={user?.type === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier'}
              className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray hover:text-primary mb-6 transition-colors`}
            >
              <ArrowRight className={`w-5 h-5 ${language === 'ar' ? '' : 'rotate-180'}`} />
              <span>{t('deal.backToDashboard')}</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
                {t('sidebar.activeDeals')}
              </h1>
              <p className="text-text-gray">{t('deal.monitor')}</p>
            </motion.div>

            {sortedActiveDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedActiveDeals.map((deal) => (
                  <Card key={deal.id} hover>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-cairo font-bold text-text-dark">
                          {getCompanyText(deal.productName, deal.productNameAr)}
                        </h3>
                        <p className="text-sm text-text-gray">
                          {user?.type === 'manufacturer' ? t('deal.supplier') : t('deal.manufacturer')}: {user?.type === 'manufacturer'
                            ? getCompanyText(deal.supplierName, deal.supplierNameAr)
                            : getCompanyText(deal.manufacturerName, deal.manufacturerNameAr)}
                        </p>
                        <p className="text-xs text-text-light mt-1">
                          {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : t('common.na')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDealStatusTone(deal.status)}`}>
                        {getDealStatusLabel(deal.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(deal.amount, language)}
                      </p>
                      <Link to={`/deal/${deal.id}`}>
                        <Button variant="outline" className="text-sm">
                          {t('dashboard.trackDeal')}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-text-light mx-auto mb-4" />
                  <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                    {t('dashboard.noActiveDeals')}
                  </h3>
                  <p className="text-text-gray">{t('deal.monitor')}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  const parsedDealId = Number(dealId)

  const deal = deals.find(d => d.id === parsedDealId)

  if (!deal) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <Sidebar userType={user?.type} />
        <MobileDrawer userType={user?.type} />
        <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8 pb-20`}>
          <div className="max-w-3xl mx-auto">
            <Link
              to="/deal-tracking"
              className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray hover:text-primary mb-6 transition-colors`}
            >
              <ArrowRight className={`w-5 h-5 ${language === 'ar' ? '' : 'rotate-180'}`} />
              <span>{t('deal.backToDashboard')}</span>
            </Link>
            <Card>
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">{t('deal.notFound')}</h3>
                <p className="text-text-gray">{t('deal.notFoundDesc')}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const timeline = [
    { step: t('deal.created'), date: '2024-01-10', time: '10:30 AM', status: 'completed', description: t('deal.dealCreated') },
    { step: t('deal.escrow'), date: '2024-01-10', time: '11:15 AM', status: 'completed', description: t('deal.paymentSecured') },
    { step: t('deal.paid'), date: '2024-01-10', time: '11:20 AM', status: 'completed', description: t('deal.paymentConfirmed') },
    { step: t('deal.shipped'), date: '2024-01-15', time: '2:45 PM', status: 'current', description: t('deal.packageInTransit') },
    { step: t('deal.delivered'), date: null, time: null, status: 'pending', description: t('deal.awaitingDelivery') },
    { step: t('deal.released'), date: null, time: null, status: 'pending', description: t('deal.paymentWillBeReleased') },
  ]

  const tabs = [
    { id: 'overview', label: t('deal.overview'), icon: Package },
    { id: 'payment', label: t('deal.payment'), icon: DollarSign },
    { id: 'shipping', label: t('deal.shipping'), icon: Truck },
    { id: 'dispute', label: t('deal.dispute'), icon: AlertCircle },
    { id: 'activity', label: t('deal.activity'), icon: FileText },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'current':
        return <Clock className="w-5 h-5 text-primary animate-pulse" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-secondary" />
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <MobileDrawer userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8 pb-20`}>
        <div className="max-w-7xl mx-auto">
          <Link to={user?.type === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier'} className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray hover:text-primary mb-6 transition-colors`}>
            <ArrowRight className={`w-5 h-5 ${language === 'ar' ? '' : 'rotate-180'}`} />
            <span>{t('deal.backToDashboard')}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('deal.tracking')}
            </h1>
            <p className="text-text-gray">{t('deal.monitor')}</p>
          </motion.div>

          {/* Deal Info Card */}
          <Card className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-text-gray mb-1">{t('deal.product')}</p>
              <p className="font-semibold text-text-dark">
                {getCompanyText(deal.productName, deal.productNameAr)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-gray mb-1">{user?.type === 'manufacturer' ? t('deal.supplier') : t('deal.manufacturer')}</p>
              <p className="font-semibold text-text-dark">
                {user?.type === 'manufacturer'
                  ? getCompanyText(deal.supplierName, deal.supplierNameAr)
                  : getCompanyText(deal.manufacturerName, deal.manufacturerNameAr)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-gray mb-1">{t('deal.amount')}</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(deal.amount, language)}
              </p>
            </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-soft p-2 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-gray hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('deal.timeline')}</h2>
                  <div className="space-y-6">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mr-4">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${
                              item.status === 'current' ? 'text-primary' : 
                              item.status === 'completed' ? 'text-green-600' : 'text-text-gray'
                            }`}>
                              {item.step}
                            </h3>
                            {item.date && (
                              <span className="text-sm text-text-gray">
                                {item.date} at {item.time}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-gray">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Payment Tab */}
              {activeTab === 'payment' && (() => {
                const amount = typeof deal.amount === 'number' ? deal.amount : parseFloat(String(deal.amount || '0').replace(/[^0-9.]/g, '') || '0')
                const fee = amount * 0.01
                const total = amount + fee
                
                return (
                  <Card>
                    <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">
                      {t('deal.paymentInfo')}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-secondary">
                        <span className="text-text-gray">{t('deal.amount')}</span>
                        <span className="font-semibold text-text-dark">
                          {formatPrice(amount, language)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-secondary">
                        <span className="text-text-gray">{t('deal.escrowFee')}</span>
                        <span className="font-semibold text-text-dark">
                          {formatPrice(fee, language)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-secondary">
                        <span className="text-text-gray">{t('deal.status')}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          deal.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          deal.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {deal.paymentStatus === 'completed' ? t('deal.paid') :
                           deal.paymentStatus === 'pending' ? t('deal.pending') :
                           t('deal.pending')}
                        </span>
                      </div>
                      <div className="flex justify-between py-4">
                        <span className="text-lg font-bold text-text-dark">{t('deal.total')}</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(total, language)}
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })()}

              {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                  <Card>
                    <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">
                      {t('deal.shippingDetails')}
                    </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-text-gray mb-1">
                        {t('deal.trackingNumber')}
                      </p>
                      <p className="font-semibold text-text-dark">
                        {deal.trackingNumber || `TRK${deal.id}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-gray mb-1">
                        {t('deal.courier')}
                      </p>
                      <p className="font-semibold text-text-dark">
                        {deal.courier || t('deal.expressLogistics')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-gray mb-1">
                        {t('deal.estimatedDelivery')}
                      </p>
                      <p className="font-semibold text-text-dark">{deal.estimatedDelivery || t('deal.tbd')}</p>
                    </div>
                    {deal.status === 'shipped' && user?.type === 'manufacturer' && (
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={async () => {
                          setIsSubmitting(true)
                          try {
                            await new Promise(resolve => setTimeout(resolve, 1000))
                            updateDeal(parseInt(dealId), {
                              status: 'delivered',
                              deliveredAt: new Date().toISOString(),
                            })
                            success(t('deal.deliveryConfirmed'))
                            setTimeout(() => {
                              navigate(`/rating/${dealId}`)
                            }, 1500)
                          } catch (err) {
                            error(t('deal.deliveryFailed'))
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        <CheckCircle className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {isSubmitting 
                          ? t('deal.confirming') 
                          : t('deal.confirmDelivery')
                        }
                      </Button>
                    )}
                    <Link to={`/shipping/TRK${deal.id}`}>
                      <Button variant="outline" className="w-full">
                        <Truck className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('deal.trackShipment')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              {/* Dispute Tab */}
              {activeTab === 'dispute' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('deal.disputeCenter')}</h2>
                  <div className="space-y-6">
                    {deal.dispute ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} mb-4`}>
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                          <h3 className="font-semibold text-yellow-800">{t('deal.disputeFiled')}</h3>
                        </div>
                        <p className="text-sm text-yellow-800 mb-2"><strong>{t('deal.reason')}:</strong> {deal.dispute.reason}</p>
                        <p className="text-sm text-yellow-800 mb-2"><strong>{t('deal.status')}:</strong> {deal.dispute.status}</p>
                        <p className="text-sm text-yellow-800"><strong>{t('deal.filed')}:</strong> {deal.dispute.filedAt}</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <p className="text-sm text-blue-800">
                            {t('deal.disputeInfo')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            {t('deal.reasonForDispute')} *
                          </label>
                          <select
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary mb-4"
                          >
                            <option value="">{t('deal.selectReason')}</option>
                            <option value="delivery">{t('deal.deliveryIssue')}</option>
                            <option value="quality">{t('deal.qualityIssue')}</option>
                            <option value="payment">{t('deal.paymentIssue')}</option>
                            <option value="other">{t('deal.other')}</option>
                          </select>
                          {disputeReason && (
                            <textarea
                              rows="4"
                              value={disputeDescription}
                              onChange={(e) => setDisputeDescription(e.target.value)}
                              className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary mb-4"
                              placeholder={t('deal.describeIssue')}
                            />
                          )}
                          <Button
                            variant="primary"
                            onClick={async () => {
                              if (!disputeReason || !disputeDescription.trim()) {
                                error(t('deal.fillAllFields'))
                                return
                              }
                              setIsSubmitting(true)
                              try {
                                await new Promise(resolve => setTimeout(resolve, 1000))
                                updateDeal(parseInt(dealId), {
                                  dispute: {
                                    reason: disputeReason,
                                    description: disputeDescription,
                                    status: 'open',
                                    filedAt: new Date().toISOString(),
                                    filedBy: user?.id,
                                  },
                                  disputeStatus: 'open',
                                })
                                success(t('deal.disputeFiledSuccess'))
                                setDisputeReason('')
                                setDisputeDescription('')
                              } catch (err) {
                                error(t('deal.disputeFiledFailed'))
                              } finally {
                                setIsSubmitting(false)
                              }
                            }}
                            disabled={!disputeReason || !disputeDescription.trim() || isSubmitting}
                          >
                            <AlertCircle className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {isSubmitting 
                              ? t('deal.processing') 
                              : t('deal.fileDispute')
                            }
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('deal.activityLog')}</h2>
                  <div className="space-y-4">
                    {[
                      { action: t('deal.activityDealCreated'), user: t('deal.system'), time: '2024-01-10 10:30 AM' },
                      { action: t('deal.activityOfferAccepted'), user: 'Tech Industries Co.', time: '2024-01-10 10:32 AM' },
                      { action: t('deal.activityPaymentReceived'), user: t('deal.system'), time: '2024-01-10 11:20 AM' },
                      { action: t('deal.activityOrderShipped'), user: 'Global Materials Ltd.', time: '2024-01-15 2:45 PM' },
                    ].map((activity, index) => (
                      <div key={index} className={`flex items-start ${language === 'ar' ? 'space-x-reverse' : 'space-x-3'} pb-4 border-b border-secondary last:border-0`}>
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="font-semibold text-text-dark">{activity.action}</p>
                          <p className="text-sm text-text-gray">
                            {t('deal.by')} {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="flex gap-4">
                {deal.status === 'delivered' && !deal.review && (
                  <Link to={`/rating/${dealId}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      <CheckCircle className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('deal.addReview')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealTracking

