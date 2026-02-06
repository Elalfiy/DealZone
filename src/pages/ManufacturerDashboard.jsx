import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  FileText, 
  ClipboardList, 
  TrendingUp, 
  DollarSign, 
  Truck,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Star
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const ManufacturerDashboard = () => {
  const { user, deals, offers, requests, products } = useApp()
  const { t, language } = useTranslation()
  const [showAnalytics, setShowAnalytics] = useState(false)

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }
  
  // Calculate real stats for Manufacturer
  const manufacturerDeals = deals.filter(d => d.manufacturerId === user?.id)
  const activeDealItems = manufacturerDeals.filter(d =>
    ['created', 'paid', 'shipped'].includes(d.status)
  )
  const completedDeals = manufacturerDeals.filter(d =>
    ['delivered', 'completed'].includes(d.status)
  )
  const activeDeals = activeDealItems.length
  
  const pendingPayments = manufacturerDeals
    .filter(d => d.paymentStatus === 'pending')
    .reduce((sum, d) => sum + (typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount || '0').replace(/[^0-9.]/g, '') || '0')), 0)
  
  const shipments = manufacturerDeals.filter(d =>
    ['shipped', 'delivered'].includes(d.status)
  ).length
  
  const offersReceived = offers.filter(o => 
    o.manufacturerId === user?.id && o.status === 'pending'
  ).length

  const stats = [
    { 
      label: t('dashboard.manufacturer.activeDeals'), 
      value: activeDeals.toString(), 
      icon: Package, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: t('dashboard.manufacturer.pendingPayments'), 
      value: formatPrice(pendingPayments, language), 
      icon: DollarSign, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
    { 
      label: t('dashboard.manufacturer.shipments'), 
      value: shipments.toString(), 
      icon: Truck, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: t('dashboard.manufacturer.offersReceived'), 
      value: offersReceived.toString(), 
      icon: FileText, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
  ]

  const quickActions = [
    { icon: Plus, label: t('dashboard.createRFQ'), path: '/create-rfq', color: 'primary' },
    { icon: FileText, label: t('dashboard.viewOffers'), path: '/received-offers', color: 'secondary' },
    { icon: Package, label: t('dashboard.manufacturer.activeDeals'), path: '/deal-tracking', color: 'accent' },
    { icon: ClipboardList, label: t('tenders.createTender'), path: '/tenders/create', color: 'primary' },
    { icon: ClipboardList, label: t('tenders.myTenders'), path: '/tenders', color: 'secondary' },
  ]

  const activeDealsList = [...activeDealItems]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const recentDeals = [...manufacturerDeals]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)
    .map(deal => ({
      id: deal.id,
      supplier: getCompanyText(deal.supplierName, deal.supplierNameAr),
      product: getCompanyText(deal.productName, deal.productNameAr),
      status: deal.status,
      amount: formatPrice(deal.amount, language),
      date: deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : t('common.na')
    }))

  const performanceMetrics = {
    rating: completedDeals.length > 0 ? 4.7 : 4.5,
    onTimePayments: manufacturerDeals.length > 0
      ? Math.round((manufacturerDeals.filter(d => d.paymentStatus === 'completed').length / manufacturerDeals.length) * 100)
      : 0,
    responseTime: t('dashboard.responseTimeExample', { hours: '2.1' }),
    totalDeals: completedDeals.length,
  }

  // Get top suppliers from products
  const topSuppliers = products
    .filter(p => p.rating >= 4.5 && p.verified)
    .reduce((acc, product) => {
      const existing = acc.find(s => s.supplierId === product.supplierId)
      if (existing) {
        existing.rating = Math.max(existing.rating, product.rating)
        existing.dealsCount++
      } else {
        acc.push({
          supplierId: product.supplierId,
          name: getCompanyText(product.supplier || t('common.unknownSupplier'), product.supplierAr),
          rating: product.rating || 0,
          dealsCount: 1,
          verified: product.verified,
        })
      }
      return acc
    }, [])
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map(supplier => ({
      ...supplier,
      match: `${Math.round(supplier.rating * 20)}%`,
      reason: supplier.verified ? t('dashboard.manufacturer.verifiedSupplier') : t('dashboard.manufacturer.goodRating'),
    }))

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />
      case 'paid':
      case 'created':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const dealStatusLabels = {
    created: t('deal.created'),
    paid: t('deal.paid'),
    shipped: t('deal.shipped'),
    delivered: t('deal.delivered'),
    completed: t('deal.delivered'),
    cancelled: t('admin.statusCancelled'),
  }

  const getDealStatusLabel = (status) => dealStatusLabels[status] || status

  const locale = language === 'ar' ? 'ar-EG' : 'en-US'
  const chartPalette = ['#1A73E8', '#00C853', '#FBBC05', '#EF4444', '#8B5CF6']
  const parseAmount = (value) => {
    if (typeof value === 'number') return value
    if (!value) return 0
    const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''))
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`
  const monthlySeries = (() => {
    const months = 6
    const now = new Date()
    return Array.from({ length: months }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
      return {
        key: getMonthKey(date),
        month: date.toLocaleString(locale, { month: 'short' }),
        spend: 0,
        deals: 0,
        requests: 0,
        offers: 0,
        avgDealValue: 0,
      }
    })
  })()

  const seriesByKey = monthlySeries.reduce((acc, entry) => {
    acc[entry.key] = entry
    return acc
  }, {})

  const addToSeries = (items, getDate, updater) => {
    items.forEach((item) => {
      const rawDate = getDate(item)
      if (!rawDate) return
      const date = new Date(rawDate)
      if (Number.isNaN(date.getTime())) return
      const entry = seriesByKey[getMonthKey(date)]
      if (entry) {
        updater(entry, item)
      }
    })
  }

  const manufacturerRequests = requests.filter(r => r.manufacturerId === user?.id)
  const manufacturerOffers = offers.filter(o => o.manufacturerId === user?.id)

  addToSeries(manufacturerDeals, (deal) => deal.createdAt, (entry, deal) => {
    entry.deals += 1
    if (['completed', 'delivered'].includes(deal.status)) {
      entry.spend += parseAmount(deal.amount)
    }
  })

  addToSeries(manufacturerRequests, (request) => request.createdAt, (entry) => {
    entry.requests += 1
  })

  addToSeries(manufacturerOffers, (offer) => offer.createdAt, (entry) => {
    entry.offers += 1
  })

  monthlySeries.forEach((entry) => {
    entry.avgDealValue = entry.deals ? entry.spend / entry.deals : 0
  })

  const completedSpend = manufacturerDeals
    .filter(d => ['completed', 'delivered'].includes(d.status))
    .reduce((sum, deal) => sum + parseAmount(deal.amount), 0)
  const totalDeals = manufacturerDeals.length
  const totalRequests = manufacturerRequests.length
  const totalOffers = manufacturerOffers.length

  const dealStatusCounts = manufacturerDeals.reduce((acc, deal) => {
    const status = deal.status || 'created'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const dealStatusData = Object.keys(dealStatusLabels).map((status) => ({
    name: dealStatusLabels[status],
    value: dealStatusCounts[status] || 0,
    color: chartPalette[Object.keys(dealStatusLabels).indexOf(status) % chartPalette.length],
  }))

  const hasAnalyticsData = totalDeals || totalRequests || totalOffers
  const formatCompactNumber = (value) =>
    new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  const axisTick = { fill: '#6B7280', fontSize: 12 }
  const tooltipStyles = {
    backgroundColor: '#111827',
    border: 'none',
    borderRadius: '12px',
    color: '#F9FAFB',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.2)',
    padding: '12px 14px',
  }
  const tooltipLabelStyle = { color: '#F9FAFB', fontWeight: 600 }
  const currencyPrefix = language === 'ar' ? 'ج.م' : 'EGP'
  const formatCurrencyCompact = (value) => `${currencyPrefix} ${formatCompactNumber(value)}`
  const currencyMetrics = [
    t('dashboard.analytics.spend'),
    t('dashboard.analytics.avgDealValue'),
  ]
  const tooltipFormatter = (value, name) => {
    if (currencyMetrics.includes(name)) {
      return [formatCurrencyCompact(value), name]
    }
    return [formatCompactNumber(value), name]
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar isAuthenticated={true} userType="manufacturer" />
      <Sidebar userType="manufacturer" />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8`}>                <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('dashboard.manufacturer.title')}
            </h1>
            <p className="text-text-gray">
              {t('dashboard.manufacturer.manage')}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-gray mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-text-dark">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-cairo font-bold text-text-dark mb-4">
              {t('dashboard.quickActions')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const colorClasses = {
                  primary: 'bg-primary/10 text-primary',
                  secondary: 'bg-secondary text-text-dark',
                  accent: 'bg-accent/10 text-accent',
                }
                return (
                  <Link key={index} to={action.path}>
                    <Card hover>
                      <div className={`flex items-center space-x-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                        <div className={`w-12 h-12 ${colorClasses[action.color] || colorClasses.primary} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-dark">{action.label}</h3>
                        </div>
                        <ArrowRight className="w-5 h-5 text-text-gray" />
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Active Deals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-cairo font-bold text-text-dark">
                    {t('dashboard.manufacturer.activeDeals')}
                  </h2>
                  <span className="text-sm text-text-gray">
                    {activeDealsList.length} {t('dashboard.manufacturer.activeDeals')}
                  </span>
                </div>
                {activeDealsList.length > 0 ? (
                  <div className="space-y-4">
                    {activeDealsList.map((deal) => (
                      <div key={deal.id} className="p-4 bg-secondary/50 rounded-lg border border-secondary/60">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(deal.status)}
                            <div>
                              <h3 className="font-semibold text-text-dark">
                                {getCompanyText(deal.productName, deal.productNameAr)}
                              </h3>
                              <p className="text-sm text-text-gray">
                                {t('deal.supplier')}: {getCompanyText(deal.supplierName || '-', deal.supplierNameAr)}
                              </p>
                              <p className="text-xs text-text-light mt-1">
                                {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : t('common.na')}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-text-dark">{formatPrice(deal.amount, language)}</p>
                            <span className="text-xs text-text-light">{getDealStatusLabel(deal.status)}</span>
                          </div>
                        </div>
                        <Link to={`/deal/${deal.id}`} className="mt-3 block">
                          <Button variant="outline" className="w-full">
                            {t('dashboard.trackDeal')}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-gray">
                    {t('dashboard.noActiveDeals')}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Performance Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} mb-6`}>
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <h2 className="text-xl font-cairo font-bold text-text-dark">
                    {t('dashboard.manufacturer.performanceRating')}
                  </h2>
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-text-dark mb-2">{performanceMetrics.rating}</div>
                    <div className={`flex items-center justify-center space-x-1 ${language === 'ar' ? 'space-x-reverse' : ''} mb-4`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(performanceMetrics.rating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-text-dark">{performanceMetrics.onTimePayments}%</p>
                      <p className="text-sm text-text-gray">
                        {t('dashboard.manufacturer.onTimePayments')}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-text-dark">{performanceMetrics.responseTime}</p>
                      <p className="text-sm text-text-gray">
                        {t('dashboard.manufacturer.avgResponse')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{performanceMetrics.totalDeals}</p>
                    <p className="text-sm text-text-gray">
                      {t('dashboard.manufacturer.totalCompletedDeals')}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowAnalytics((prev) => !prev)}
                  >
                    <TrendingUp className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {showAnalytics ? t('dashboard.analytics.hide') : t('dashboard.manufacturer.viewFullAnalytics')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark">
                    {t('dashboard.analytics.title')}
                  </h2>
                  <p className="text-text-gray">{t('dashboard.analytics.subtitle')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span>{t('dashboard.analytics.spend')}</span>
                    <span className="font-semibold text-text-dark">{formatPrice(completedSpend, language)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span>{t('dashboard.analytics.deals')}</span>
                    <span className="font-semibold text-text-dark">{formatCompactNumber(totalDeals)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-light" />
                    <span>{t('dashboard.analytics.requests')}</span>
                    <span className="font-semibold text-text-dark">{formatCompactNumber(totalRequests)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span>{t('dashboard.analytics.offers')}</span>
                    <span className="font-semibold text-text-dark">{formatCompactNumber(totalOffers)}</span>
                  </div>
                </div>
              </div>

              {!hasAnalyticsData ? (
                <Card className="text-center py-10">
                  <p className="text-text-gray">{t('dashboard.analytics.empty')}</p>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <h4 className="text-lg font-semibold text-text-dark">{t('dashboard.analytics.spendDeals')}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {t('dashboard.analytics.spend')} • {formatPrice(completedSpend, language)}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            {t('dashboard.analytics.deals')} • {formatCompactNumber(totalDeals)}
                          </span>
                        </div>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1A73E8" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#1A73E8" stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="dealCountGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00C853" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#00C853" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
                            <YAxis
                              yAxisId="left"
                              axisLine={false}
                              tickLine={false}
                              tick={axisTick}
                              tickFormatter={formatCompactNumber}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              axisLine={false}
                              tickLine={false}
                              tick={axisTick}
                              tickFormatter={formatCompactNumber}
                            />
                            <Tooltip
                              contentStyle={tooltipStyles}
                              labelStyle={tooltipLabelStyle}
                              formatter={tooltipFormatter}
                            />
                            <Legend verticalAlign="top" height={24} iconType="circle" />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="spend"
                              name={t('dashboard.analytics.spend')}
                              stroke="#1A73E8"
                              fill="url(#spendGradient)"
                              strokeWidth={3}
                            />
                            <Area
                              yAxisId="right"
                              type="monotone"
                              dataKey="deals"
                              name={t('dashboard.analytics.deals')}
                              stroke="#00C853"
                              fill="url(#dealCountGradient)"
                              strokeWidth={3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-text-dark">{t('dashboard.analytics.dealStatus')}</h4>
                        <span className="text-sm text-text-gray">
                          {formatCompactNumber(totalDeals)} {t('dashboard.analytics.deals')}
                        </span>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dealStatusData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={70}
                              outerRadius={110}
                              paddingAngle={3}
                              stroke="transparent"
                            >
                              {dealStatusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyles} labelStyle={tooltipLabelStyle} formatter={tooltipFormatter} />
                            <Legend verticalAlign="bottom" iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-text-dark">{t('dashboard.analytics.dealValueTrend')}</h4>
                        <span className="text-sm text-text-gray">
                          {t('dashboard.analytics.avgDealValue')}
                        </span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
                            <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={formatCompactNumber} />
                            <Tooltip
                              contentStyle={tooltipStyles}
                              labelStyle={tooltipLabelStyle}
                              formatter={tooltipFormatter}
                            />
                            <Line
                              type="monotone"
                              dataKey="avgDealValue"
                              name={t('dashboard.analytics.avgDealValue')}
                              stroke="#8B5CF6"
                              strokeWidth={3}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-text-dark">{t('dashboard.analytics.requestsOffers')}</h4>
                        <span className="text-sm text-text-gray">
                          {formatCompactNumber(totalRequests + totalOffers)} {t('dashboard.analytics.requests')}
                        </span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
                            <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={formatCompactNumber} />
                            <Tooltip
                              contentStyle={tooltipStyles}
                              labelStyle={tooltipLabelStyle}
                              formatter={tooltipFormatter}
                            />
                            <Legend verticalAlign="top" height={24} iconType="circle" />
                            <Bar
                              dataKey="requests"
                              name={t('dashboard.analytics.requests')}
                              fill="#1A73E8"
                              radius={[8, 8, 0, 0]}
                              barSize={20}
                            />
                            <Bar
                              dataKey="offers"
                              name={t('dashboard.analytics.offers')}
                              fill="#00C853"
                              radius={[8, 8, 0, 0]}
                              barSize={20}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* AI Supplier Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-cairo font-bold text-text-dark">
                    {t('dashboard.manufacturer.aiSuggestions')}
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {topSuppliers.length > 0 ? topSuppliers.map((suggestion, index) => (
                  <div key={suggestion.supplierId || index} className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-text-dark">{suggestion.name}</h3>
                        <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} mt-1`}>
                          <span className="text-sm text-text-gray">{t('dashboard.manufacturer.rating')}: {suggestion.rating.toFixed(1)}</span>
                          {suggestion.verified && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {t('marketplace.verified')}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">{suggestion.match} {t('dashboard.manufacturer.match')}</span>
                    </div>
                    <p className="text-sm text-text-gray">{suggestion.reason}</p>
                    <Link to={`/supplier/${suggestion.supplierId}`}>
                      <Button variant="outline" className="mt-3 w-full text-sm py-2">
                        {t('dashboard.manufacturer.viewSupplier')}
                      </Button>
                    </Link>
                  </div>
                )) : (
                  <p className="text-text-gray text-center py-4">{t('dashboard.manufacturer.noSuggestions')}</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ManufacturerDashboard

