import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, Plus, ArrowLeft, Clock, TrendingDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const TendersListPage = () => {
  const navigate = useNavigate()
  const { user, tenders } = useApp()
  const { t, language } = useTranslation()
  const [activeTab, setActiveTab] = useState(user?.type === 'manufacturer' ? 'my' : 'available')

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getLowestBid = (tender) => {
    const bids = Array.isArray(tender?.bids) ? tender.bids : []
    if (!bids.length) return null
    return bids.reduce((min, b) => (typeof b.amount === 'number' && b.amount < min ? b.amount : min), bids[0].amount)
  }

  const now = Date.now()

  const myTenders = useMemo(() => {
    if (!user) return []
    return tenders
      .filter(tender => tender.manufacturerId === user.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [tenders, user])

  const availableTenders = useMemo(() => {
    if (!user) return []
    return tenders
      .filter(tender => tender.status === 'active')
      .filter(tender => user.type !== 'manufacturer' || tender.manufacturerId !== user.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [tenders, user])

  const items = activeTab === 'my' ? myTenders : availableTenders

  const formatTimeLeft = (endDate) => {
    const diff = new Date(endDate).getTime() - now
    if (!endDate || Number.isNaN(diff)) return '-'
    if (diff <= 0) return '0'
    const totalMinutes = Math.floor(diff / 60000)
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60
    if (days > 0) return t('time.left.dh', { d: days, h: hours })
    if (hours > 0) return t('time.left.hm', { h: hours, m: minutes })
    return t('time.left.m', { m: minutes })
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
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`inline-flex items-center text-text-gray hover:text-primary transition-colors ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              >
                <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                <span>{t('tenders.back')}</span>
              </button>

              <div className={`mt-2 flex items-center ${language === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-cairo font-bold text-text-dark">{t('tenders.title')}</h1>
                  <p className="text-sm text-text-gray mt-1">{t('tenders.subtitle')}</p>
                </div>
              </div>
            </div>

            {user?.type === 'manufacturer' && (
              <Link to="/tenders/create">
                <Button variant="primary">
                  <Plus className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('tenders.createTender')}
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <button
                  type="button"
                  onClick={() => setActiveTab('available')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === 'available'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-text-gray hover:text-text-dark'
                  }`}
                >
                  {t('tenders.availableTenders')}
                </button>
                {user?.type === 'manufacturer' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('my')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'my'
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-text-gray hover:text-text-dark'
                    }`}
                  >
                    {t('tenders.myTenders')}
                  </button>
                )}
              </div>

              <div className={`text-xs text-text-gray ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('tenders.lowerIsBetter')}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-10 text-center text-text-gray">{t('tenders.empty')}</div>
              ) : (
                items.map((tender) => {
                  const lowestBid = getLowestBid(tender)
                  const endAt = tender.endDate
                  const timeLeft = endAt ? formatTimeLeft(endAt) : '-'
                  const title = getText(tender.title)
                  const description = getText(tender.description)

                  return (
                    <motion.div key={tender.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-white">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-cairo font-bold text-text-dark">{title}</h3>
                                <p className="text-sm text-text-gray mt-1 line-clamp-2">{description}</p>
                              </div>
                            </div>

                            <div className={`mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <div className="bg-secondary/50 rounded-lg p-3">
                                <div className="text-xs text-text-gray">{t('tenders.targetPrice')}</div>
                                <div className="font-semibold text-text-dark mt-1">{formatPrice(tender.targetPrice, language)}</div>
                              </div>
                              <div className="bg-secondary/50 rounded-lg p-3">
                                <div className="text-xs text-text-gray">{t('tenders.currentLowestBid')}</div>
                                <div className="font-semibold text-text-dark mt-1">
                                  {lowestBid == null ? t('tenders.noBidsYet') : formatPrice(lowestBid, language)}
                                </div>
                              </div>
                              <div className="bg-secondary/50 rounded-lg p-3">
                                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-xs text-text-gray`}>
                                  <Clock className="w-4 h-4" />
                                  <span>{t('tenders.tenderEndsIn')}</span>
                                </div>
                                <div className={`mt-1 flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'} font-semibold text-text-dark`}>
                                  <TrendingDown className="w-4 h-4 text-green-600" />
                                  <span>{timeLeft}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 lg:flex-col lg:min-w-[180px]">
                            <Link to={`/tenders/${tender.id}`} className="flex-1">
                              <Button variant="primary" className="w-full">
                                {t('tenders.viewTender')}
                              </Button>
                            </Link>
                            {user?.type === 'manufacturer' && tender.manufacturerId === user.id && (
                              <Link to={`/tenders/${tender.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                  {t('tenders.receivedBids')}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TendersListPage
