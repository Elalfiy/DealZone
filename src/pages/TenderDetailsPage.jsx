import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, TrendingDown, BadgeDollarSign, FileText } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const TenderDetailsPage = () => {
  const { tenderId } = useParams()
  const navigate = useNavigate()
  const { user, tenders, submitTenderBid } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()

  const [bidAmount, setBidAmount] = useState('')
  const [now, setNow] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const tender = tenders.find(item => String(item.id) === String(tenderId))

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  const sortedBids = useMemo(() => {
    const bids = Array.isArray(tender?.bids) ? tender.bids : []
    return [...bids].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
  }, [tender])

  const lowestBid = useMemo(() => {
    if (!tender?.bids?.length) return null
    return tender.bids.reduce((min, b) => (typeof b.amount === 'number' && b.amount < min ? b.amount : min), tender.bids[0].amount)
  }, [tender])

  const timeLeftLabel = useMemo(() => {
    const end = tender?.endDate ? new Date(tender.endDate).getTime() : null
    if (!end) return '-'
    const diff = end - now
    if (diff <= 0) return '0'

    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / (60 * 60 * 24))
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) return t('time.left.dh', { d: days, h: hours })
    return t('time.left.hms', { h: hours, m: minutes, s: seconds })
  }, [now, tender])

  if (!tender) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-text-gray">{t('tenders.empty')}</p>
                <Button variant="outline" onClick={() => navigate('/tenders')} className="mt-4">
                  {t('tenders.back')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const title = getText(tender.title)
  const description = getText(tender.description)
  const unit = getText(tender.unit)

  const submitBid = async (e) => {
    e.preventDefault()
    if (!user) {
      error(t('request.pleaseLogin'))
      navigate('/login')
      return
    }

    if (!bidAmount || Number.isNaN(parseFloat(bidAmount))) {
      error(t('common.error') || 'Error')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      submitTenderBid(
        tender.id,
        bidAmount,
        user.id,
        user.companyName || user.name || 'Supplier',
        user.companyNameAr || user.nameAr || ''
      )
      setBidAmount('')
      success(t('tenders.submitBid'))
    } catch (e) {
      error(t('common.error') || 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <MobileDrawer userType={user?.type} />

      <div className={`pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <Link
                to="/tenders"
                className={`inline-flex items-center text-text-gray hover:text-primary transition-colors ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              >
                <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                <span>{t('tenders.back')}</span>
              </Link>

              <h1 className="mt-3 text-2xl md:text-3xl font-cairo font-bold text-text-dark">{title}</h1>
              <p className="text-sm text-text-gray mt-2 max-w-3xl">{description}</p>

              <div className={`mt-4 inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <TrendingDown className="w-4 h-4" />
                <span>{t('tenders.subtitle')}</span>
              </div>
            </div>

            {user?.type === 'manufacturer' && tender.manufacturerId === user.id && (
              <Link to="/tenders/create">
                <Button variant="outline">{t('tenders.createTender')}</Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-secondary/40 rounded-lg p-4">
                    <div className="text-xs text-text-gray">{t('tenders.targetPrice')}</div>
                    <div className="mt-1 text-xl font-bold text-text-dark">
                      {formatPrice(tender.targetPrice, language)}
                    </div>
                  </div>

                  <div className="bg-secondary/40 rounded-lg p-4">
                    <div className="text-xs text-text-gray">{t('tenders.currentLowestBid')}</div>
                    <div className="mt-1 text-xl font-bold text-text-dark">
                      {lowestBid == null ? t('tenders.noBidsYet') : formatPrice(lowestBid, language)}
                    </div>
                  </div>

                  <div className="bg-secondary/40 rounded-lg p-4">
                    <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-xs text-text-gray`}>
                      <Clock className="w-4 h-4" />
                      <span>{t('tenders.tenderEndsIn')}</span>
                    </div>
                    <div className="mt-1 text-lg font-bold text-text-dark">{timeLeftLabel}</div>
                  </div>

                  <div className="bg-secondary/40 rounded-lg p-4">
                    <div className="text-xs text-text-gray">{t('tenders.quantity')}</div>
                    <div className="mt-1 text-lg font-bold text-text-dark">
                      {tender.quantity} {unit}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="border border-secondary rounded-lg p-4">
                    <div className="text-xs text-text-gray">{t('tenders.startsAt')}</div>
                    <div className="mt-1 font-semibold text-text-dark">
                      {tender.startDate ? new Date(tender.startDate).toLocaleString() : '-'}
                    </div>
                  </div>
                  <div className="border border-secondary rounded-lg p-4">
                    <div className="text-xs text-text-gray">{t('tenders.endsAt')}</div>
                    <div className="mt-1 font-semibold text-text-dark">
                      {tender.endDate ? new Date(tender.endDate).toLocaleString() : '-'}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('tenders.bidHistory')}</h2>

                {sortedBids.length === 0 ? (
                  <div className="py-8 text-center text-text-gray">{t('tenders.noBidsYet')}</div>
                ) : (
                  <div className="space-y-3">
                    {sortedBids.map((bid, index) => (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-secondary/40 rounded-lg p-4"
                      >
                        <div>
                          <div className="font-semibold text-text-dark">
                            {getCompanyText(bid.bidderName, bid.bidderNameAr)}
                          </div>
                          <div className="text-xs text-text-gray mt-1">{bid.timestamp ? new Date(bid.timestamp).toLocaleString() : ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-text-dark">{formatPrice(bid.amount, language)}</div>
                          {index === sortedBids.length - 1 && (
                            <div className={`mt-1 inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full ${language === 'ar' ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                              <TrendingDown className="w-3 h-3" />
                              <span>{t('tenders.lowerIsBetter')}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-3">{t('tenders.details')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-text-gray">{t('tenders.category')}</span>
                    <span className="font-semibold text-text-dark">{t(`category.${tender.categoryKey || tender.category}`)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-text-gray">{t('tenders.quantity')}</span>
                    <span className="font-semibold text-text-dark">{tender.quantity} {unit}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">{t('tenders.submitBid')}</h3>
                <p className="text-sm text-text-gray mb-4">{t('tenders.lowerIsBetter')}</p>

                <form onSubmit={submitBid} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('tenders.bidAmount')}
                    </label>
                    <div className="relative">
                      <BadgeDollarSign className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-text-light ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className={`w-full px-10 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        placeholder={t('tenders.bidAmountPlaceholder')}
                        required
                      />
                    </div>
                    <div className="mt-2 text-xs text-text-gray">
                      {lowestBid == null ? (
                        <span>{t('tenders.targetPrice')}: {formatPrice(tender.targetPrice, language)}</span>
                      ) : (
                        <span>{t('tenders.currentLowestBid')}: {formatPrice(lowestBid, language)}</span>
                      )}
                    </div>
                  </div>

                  <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                    {t('tenders.submitBid')}
                  </Button>

                  <div className="text-xs text-text-gray">
                    <FileText className={`inline w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    <span>{t('landing.features.tenders.desc')}</span>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenderDetailsPage
