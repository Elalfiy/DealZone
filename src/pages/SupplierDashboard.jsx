import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  FileText, 
  Send, 
  DollarSign, 
  Truck,
  Package,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  ClipboardList,
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

const SupplierDashboard = () => {
  const { user, deals, offers, products } = useApp()
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
  
  // Calculate real stats
  const supplierDeals = deals.filter(d => d.supplierId === user?.id)
  const activeDealItems = supplierDeals.filter(d =>
    ['created', 'paid', 'shipped'].includes(d.status)
  )
  const completedDeals = supplierDeals.filter(d =>
    ['delivered', 'completed'].includes(d.status)
  )
  const offersSent = offers.filter(o => 
    o.supplierId === user?.id
  ).length
  
  const wonDeals = completedDeals.length
  
  const pendingEscrow = supplierDeals
    .filter(d => d.escrowStatus === 'held')
    .reduce((sum, d) => sum + (typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount || '0').replace(/[^0-9.]/g, '') || '0')), 0)
  
  const activeProducts = products.filter(p => 
    p.supplierId === user?.id
  ).length

  const stats = [
    { 
      label: t('dashboard.supplier.offersSent'), 
      value: offersSent.toString(), 
      icon: Send, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: t('dashboard.supplier.wonDeals'), 
      value: wonDeals.toString(), 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
    { 
      label: t('dashboard.supplier.pendingEscrow'), 
      value: formatPrice(pendingEscrow, language), 
      icon: DollarSign, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: t('dashboard.supplier.activeProducts'), 
      value: activeProducts.toString(), 
      icon: Package, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
  ]

  const quickActions = [
    { icon: Plus, label: t('dashboard.addProduct'), path: '/my-products', color: 'primary' },
    { icon: FileText, label: t('dashboard.supplier.viewRequests'), path: '/marketplace?tab=requests', color: 'secondary' },
    { icon: Send, label: t('dashboard.sendOffer'), path: '/marketplace?tab=requests', color: 'accent' },
    { icon: ClipboardList, label: t('tenders.availableTenders'), path: '/tenders', color: 'secondary' },
  ]

  const activeDealsList = [...activeDealItems]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const recentOffers = offers
    .filter(o => o.supplierId === user?.id)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)
    .map(offer => ({
      id: offer.id,
      manufacturer: getCompanyText(offer.manufacturerName, offer.manufacturerNameAr),
      product: getCompanyText(offer.productName || offer.requestTitle, offer.productNameAr || offer.requestTitleAr),
      status: offer.status,
      amount: formatPrice(offer.totalAmount || (offer.pricePerUnit * offer.quantity) || offer.price, language),
      date: offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : t('common.na')
    }))

  const performanceMetrics = {
    rating: 4.8,
    onTimeDelivery: 96,
    responseTime: t('dashboard.responseTimeExample', { hours: '2.5' }),
    totalDeals: completedDeals.length,
  }

  const getOfferStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getDealStatusIcon = (status) => {
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
        return <X className="w-4 h-4 text-gray-600" />
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
        revenue: 0,
        deals: 0,
        offers: 0,
        products: 0,
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

  const supplierOffers = offers.filter(o => o.supplierId === user?.id)
  const supplierProducts = products.filter(p => p.supplierId === user?.id)

  addToSeries(supplierDeals, (deal) => deal.createdAt, (entry, deal) => {
    entry.deals += 1
    if (['completed', 'delivered'].includes(deal.status)) {
      entry.revenue += parseAmount(deal.amount)
    }
  })

  addToSeries(supplierOffers, (offer) => offer.createdAt, (entry) => {
    entry.offers += 1
  })

  addToSeries(supplierProducts, (product) => product.createdAt, (entry) => {
    entry.products += 1
  })

  monthlySeries.forEach((entry) => {
    entry.avgDealValue = entry.deals ? entry.revenue / entry.deals : 0
  })

  const completedRevenue = supplierDeals
    .filter(d => ['completed', 'delivered'].includes(d.status))
    .reduce((sum, deal) => sum + parseAmount(deal.amount), 0)
  const totalDeals = supplierDeals.length
  const totalOffers = supplierOffers.length
  const totalProducts = supplierProducts.length

  const dealStatusCounts = supplierDeals.reduce((acc, deal) => {
    const status = deal.status || 'created'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const dealStatusData = Object.keys(dealStatusLabels).map((status) => ({
    name: dealStatusLabels[status],
    value: dealStatusCounts[status] || 0,
    color: chartPalette[Object.keys(dealStatusLabels).indexOf(status) % chartPalette.length],
  }))

  const hasAnalyticsData = totalDeals || totalOffers || totalProducts
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
    t('dashboard.analytics.revenue'),
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
      <Navbar isAuthenticated={true} userType="supplier" />
      <Sidebar userType="supplier" />
      <MobileDrawer userType="supplier" />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8`}>        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('dashboard.supplier.title')}
            </h1>
            <p className="text-text-gray">
              {t('dashboard.supplier.manage')}
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
                    {t('dashboard.supplier.activeDeals')}
                  </h2>
                  <span className="text-sm text-text-gray">
                    {activeDealsList.length} {t('dashboard.supplier.activeDeals')}
                  </span>
                </div>
                {activeDealsList.length > 0 ? (
                  <div className="space-y-4">
                    {activeDealsList.map((deal) => (
                      <div key={deal.id} className="p-4 bg-secondary/50 rounded-lg border border-secondary/60">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {getDealStatusIcon(deal.status)}
                            <div>
                              <h3 className="font-semibold text-text-dark">
                                {getCompanyText(deal.productName, deal.productNameAr)}
                              </h3>
                              <p className="text-sm text-text-gray">
                                {t('deal.manufacturer')}: {getCompanyText(deal.manufacturerName || '-', deal.manufacturerNameAr)}
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
                    {t('dashboard.supplier.performanceRating')}
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
                      <p className="text-2xl font-bold text-text-dark">{performanceMetrics.onTimeDelivery}%</p>
                      <p className="text-sm text-text-gray">
                        {t('dashboard.supplier.onTimeDelivery')}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-text-dark">{performanceMetrics.responseTime}</p>
                      <p className="text-sm text-text-gray">
                        {t('dashboard.supplier.avgResponse')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{performanceMetrics.totalDeals}</p>
                    <p className="text-sm text-text-gray">
                      {t('dashboard.supplier.totalCompletedDeals')}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowAnalytics((prev) => !prev)}
                  >
                    <TrendingUp className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {showAnalytics ? t('dashboard.analytics.hide') : t('dashboard.supplier.viewFullAnalytics')}
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
                    <span>{t('dashboard.analytics.revenue')}</span>
                    <span className="font-semibold text-text-dark">{formatPrice(completedRevenue, language)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span>{t('dashboard.analytics.deals')}</span>
                    <span className="font-semibold text-text-dark">{formatCompactNumber(totalDeals)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-light" />
                    <span>{t('dashboard.analytics.offers')}</span>
                    <span className="font-semibold text-text-dark">{formatCompactNumber(totalOffers)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span>{t('dashboard.analytics.products')}</span>
                    <span className="font-semibold text-text-dark">{formatCompactNumber(totalProducts)}</span>
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
                        <h4 className="text-lg font-semibold text-text-dark">{t('dashboard.analytics.revenueDeals')}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {t('dashboard.analytics.revenue')} • {formatPrice(completedRevenue, language)}
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
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1A73E8" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#1A73E8" stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="supplierDealsGradient" x1="0" y1="0" x2="0" y2="1">
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
                              dataKey="revenue"
                              name={t('dashboard.analytics.revenue')}
                              stroke="#1A73E8"
                              fill="url(#revenueGradient)"
                              strokeWidth={3}
                            />
                            <Area
                              yAxisId="right"
                              type="monotone"
                              dataKey="deals"
                              name={t('dashboard.analytics.deals')}
                              stroke="#00C853"
                              fill="url(#supplierDealsGradient)"
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
                        <h4 className="text-lg font-semibold text-text-dark">{t('dashboard.analytics.offersProducts')}</h4>
                        <span className="text-sm text-text-gray">
                          {formatCompactNumber(totalOffers + totalProducts)} {t('dashboard.analytics.offers')}
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
                              dataKey="offers"
                              name={t('dashboard.analytics.offers')}
                              fill="#1A73E8"
                              radius={[8, 8, 0, 0]}
                              barSize={20}
                            />
                            <Bar
                              dataKey="products"
                              name={t('dashboard.analytics.products')}
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

          {/* Recent Offers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-cairo font-bold text-text-dark">
                  {t('dashboard.supplier.recentOffers')}
                </h2>
                <Link to="/my-offers" className="text-primary hover:underline text-sm font-medium">
                  {t('common.viewAll')}
                </Link>
              </div>
              <div className="space-y-4">
                {recentOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex-1">
                      <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} mb-1`}>
                        {getOfferStatusIcon(offer.status)}
                        <h3 className="font-semibold text-text-dark">{offer.product}</h3>
                      </div>
                      <p className="text-sm text-text-gray">{offer.manufacturer}</p>
                      <p className="text-xs text-text-light mt-1">{offer.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-dark">{offer.amount}</p>
                      <Link to={`/deal/${offer.id}`} className="text-sm text-primary hover:underline">
                        {t('dashboard.supplier.viewDetails')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SupplierDashboard

