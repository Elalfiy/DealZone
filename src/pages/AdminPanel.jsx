import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  Search,
  Filter,
  Download
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
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const AdminPanel = () => {
  const { user, deals, offers, products, requests } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [activeTab, setActiveTab] = useState('verification')
  const [searchTerm, setSearchTerm] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [showUserFilters, setShowUserFilters] = useState(false)
  const [userTypeFilter, setUserTypeFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [showAnalytics, setShowAnalytics] = useState(false)

  const locale = language === 'ar' ? 'ar-EG' : 'en-US'
  
  // Redirect if not admin

  const getKycDocuments = (userItem) => {
    if (userItem?.type === 'supplier') {
      return [t('admin.document.businessLicense'), t('admin.document.taxCertificate')]
    }
    if (userItem?.type === 'manufacturer') {
      return [t('admin.document.businessLicense')]
    }
    return [t('admin.document.businessLicense')]
  }

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('dealzone_users') || '[]')
    setUsers(savedUsers)
  }, [])

  const pendingVerifications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return users
      .filter((userItem) => !userItem.verified && !userItem.kycRejected)
      .filter((userItem) => {
        if (!query) return true
        return (
          userItem.companyName?.toLowerCase().includes(query) ||
          userItem.email?.toLowerCase().includes(query) ||
          userItem.type?.toLowerCase().includes(query)
        )
      })
      .map((userItem) => ({
        id: userItem.id,
        rawUser: userItem,
        companyName: userItem.companyName || t('admin.unknownUser'),
        email: userItem.email || '-',
        type: userItem.type || '-',
        submittedAt: userItem.createdAt
          ? new Date(userItem.createdAt).toLocaleDateString(locale)
          : '-',
      }))
  }, [users, searchTerm, t, locale])

  const disputes = useMemo(() => {
    return deals
      .filter((deal) => deal.disputeStatus === 'open')
      .map((deal) => ({
        id: deal.id,
        dealId: deal.id,
        type: deal.disputeType || 'delivery',
        status: 'open',
        reportedBy: deal.disputeFiledByName || deal.manufacturerName || deal.supplierName || '-',
        reportedAt: deal.disputeCreatedAt
          ? new Date(deal.disputeCreatedAt).toLocaleDateString(locale)
          : (deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString(locale) : '-'),
        description: deal.disputeReason || t('admin.disputeDefaultDescription'),
      }))
  }, [deals, t, locale])

  const filteredUsers = users.filter((userItem) => {
    const query = userSearchTerm.trim().toLowerCase()
    const matchesSearch =
      !query ||
      userItem.companyName?.toLowerCase().includes(query) ||
      userItem.email?.toLowerCase().includes(query) ||
      userItem.type?.toLowerCase().includes(query)

    const matchesType = userTypeFilter === 'all' || userItem.type === userTypeFilter
    const isVerified = Boolean(userItem.verified)
    const matchesStatus =
      userStatusFilter === 'all' || (userStatusFilter === 'verified' ? isVerified : !isVerified)

    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate real stats
  const totalUsers = users.length
  const verifiedUsers = users.filter((userItem) => userItem.verified).length
  const activeDealsCount = deals.filter(d => 
    ['created', 'paid', 'shipped'].includes(d.status)
  ).length
  const totalRevenue = deals
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + (typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount || '0').replace(/[^0-9.]/g, '') || '0')), 0)
  const disputesCount = deals.filter(d => d.disputeStatus === 'open').length

  const stats = {
    totalUsers,
    verifiedUsers,
    pendingVerifications: pendingVerifications.length,
    activeDeals: activeDealsCount,
    totalRevenue: formatPrice(totalRevenue, language),
    disputes: disputesCount,
  }

  const chartPalette = ['#1A73E8', '#00C853', '#FBBC05', '#EA4335', '#8E24AA']
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
        requests: 0,
        offers: 0,
        users: 0,
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

  addToSeries(deals, (deal) => deal.createdAt, (entry, deal) => {
    entry.deals += 1
    if (deal.status === 'completed') {
      entry.revenue += parseAmount(deal.amount)
    }
  })

  addToSeries(requests, (request) => request.createdAt, (entry) => {
    entry.requests += 1
  })

  addToSeries(offers, (offer) => offer.createdAt, (entry) => {
    entry.offers += 1
  })

  addToSeries(users, (userItem) => userItem.createdAt, (entry) => {
    entry.users += 1
  })

  const dealStatusLabels = {
    created: t('admin.statusCreated'),
    paid: t('admin.statusPaid'),
    shipped: t('admin.statusShipped'),
    completed: t('admin.statusCompleted'),
    cancelled: t('admin.statusCancelled'),
  }

  const dealStatusColors = {
    created: chartPalette[0],
    paid: chartPalette[1],
    shipped: chartPalette[2],
    completed: chartPalette[3],
    cancelled: '#9CA3AF',
  }

  const dealStatusCounts = deals.reduce((acc, deal) => {
    const status = deal.status || 'created'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const dealStatusData = Object.keys(dealStatusLabels).map((status) => ({
    name: dealStatusLabels[status],
    value: dealStatusCounts[status] || 0,
    color: dealStatusColors[status],
  }))

  const hasAnalyticsData = deals.length || users.length || requests.length || offers.length
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
  const totalDeals = deals.length
  const totalRequests = requests.length
  const totalOffers = offers.length
  const tooltipFormatter = (value, name) => {
    if (name === t('admin.analyticsRevenue')) {
      return [formatCurrencyCompact(value), name]
    }
    return [formatCompactNumber(value), name]
  }

  const handleApprove = async (userId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(prev => {
        const updated = prev.map(u => (u.id === userId ? { ...u, verified: true, verifiedAt: new Date().toISOString() } : u))
        localStorage.setItem('dealzone_users', JSON.stringify(updated))
        return updated
      })
      success(t('admin.userVerified'))
    } catch (err) {
      error(t('admin.userVerifyFailed'))
    }
  }

  const handleReject = async (userId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(prev => {
        const updated = prev.map(u => (u.id === userId ? { ...u, kycRejected: true, kycRejectedAt: new Date().toISOString() } : u))
        localStorage.setItem('dealzone_users', JSON.stringify(updated))
        return updated
      })
      success(t('admin.verificationRejected'))
    } catch (err) {
      error(t('admin.rejectFailed'))
    }
  }

  const handleResolveDispute = async (disputeId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      success(t('admin.disputeResolved'))
    } catch (err) {
      error(t('admin.disputeResolveFailed'))
    }
  }

  const handleClearUserFilters = () => {
    setUserTypeFilter('all')
    setUserStatusFilter('all')
  }

  const tabs = [
    { id: 'overview', label: t('admin.overview'), icon: TrendingUp },
    { id: 'verification', label: t('admin.kycVerification'), icon: FileCheck },
    { id: 'disputes', label: t('admin.disputes'), icon: AlertTriangle },
    { id: 'users', label: t('admin.users'), icon: Users },
  ]

  // Admin check is handled by ProtectedRoute in App.jsx

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('admin.title')}
            </h1>
            <p className="text-text-gray">
              {t('admin.subtitle')}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: t('admin.totalUsers'), 
                value: stats.totalUsers, 
                icon: Users, 
                color: 'primary' 
              },
              { 
                label: t('admin.verifiedUsers'), 
                value: stats.verifiedUsers, 
                icon: CheckCircle, 
                color: 'green' 
              },
              { 
                label: t('admin.pendingKYC'), 
                value: stats.pendingVerifications, 
                icon: Clock, 
                color: 'yellow' 
              },
              { 
                label: t('admin.activeDeals'), 
                value: stats.activeDeals, 
                icon: TrendingUp, 
                color: 'blue' 
              },
            ].map((stat, index) => {
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
                      <div className={`w-12 h-12 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-4 mb-6 border-b border-secondary">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-gray hover:text-text-dark'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('admin.platformStats')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-secondary">
                      <span className="text-text-gray">
                        {t('admin.totalRevenue')}
                      </span>
                      <span className="font-bold text-text-dark">{stats.totalRevenue}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-secondary">
                      <span className="text-text-gray">
                        {t('admin.activeDisputes')}
                      </span>
                      <span className="font-bold text-text-dark">{stats.disputes}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-text-gray">
                        {t('admin.verificationRate')}
                      </span>
                      <span className="font-bold text-text-dark">
                        {stats.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </Card>
                <Card>
                  <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('admin.quickActions')}</h3>
                  <div className="space-y-3">
                    <Button variant="primary" className="w-full">
                      <Download className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('admin.exportReports')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAnalytics(prev => !prev)}
                    >
                      {showAnalytics ? t('admin.hideAnalytics') : t('admin.viewAnalytics')}
                    </Button>
                  </div>
                </Card>
              </div>

              {showAnalytics && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-cairo font-bold text-text-dark">
                        {t('admin.analyticsTitle')}
                      </h3>
                      <p className="text-text-gray">{t('admin.analyticsSubtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
                      <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span>{t('admin.analyticsRevenue')}</span>
                        <span className="font-semibold text-text-dark">{stats.totalRevenue}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                        <span>{t('admin.analyticsDeals')}</span>
                        <span className="font-semibold text-text-dark">{formatCompactNumber(totalDeals)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-secondary px-3 py-2 rounded-full shadow-soft">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-light" />
                        <span>{t('admin.analyticsUsers')}</span>
                        <span className="font-semibold text-text-dark">{formatCompactNumber(totalUsers)}</span>
                      </div>
                    </div>
                  </div>

                  {!hasAnalyticsData ? (
                    <Card className="text-center py-10">
                      <p className="text-text-gray">{t('admin.analyticsEmpty')}</p>
                    </Card>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <Card className="xl:col-span-2">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <h4 className="text-lg font-semibold text-text-dark">{t('admin.analyticsRevenueDeals')}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {t('admin.analyticsRevenue')} • {stats.totalRevenue}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                {t('admin.analyticsDeals')} • {formatCompactNumber(totalDeals)}
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
                                  <linearGradient id="dealsGradient" x1="0" y1="0" x2="0" y2="1">
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
                                  name={t('admin.analyticsRevenue')}
                                  stroke="#1A73E8"
                                  fill="url(#revenueGradient)"
                                  strokeWidth={3}
                                />
                                <Area
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="deals"
                                  name={t('admin.analyticsDeals')}
                                  stroke="#00C853"
                                  fill="url(#dealsGradient)"
                                  strokeWidth={3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                        <Card>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-text-dark">{t('admin.analyticsDealStatus')}</h4>
                            <span className="text-sm text-text-gray">
                              {formatCompactNumber(totalDeals)} {t('admin.analyticsDeals')}
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
                                <Tooltip contentStyle={tooltipStyles} labelStyle={tooltipLabelStyle} />
                                <Legend verticalAlign="bottom" iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-text-dark">{t('admin.analyticsUserGrowth')}</h4>
                            <span className="text-sm text-text-gray">
                              {formatCompactNumber(totalUsers)} {t('admin.analyticsUsers')}
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
                                  dataKey="users"
                                  name={t('admin.analyticsUsers')}
                                  stroke="#1A73E8"
                                  strokeWidth={3}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                        <Card>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-text-dark">{t('admin.analyticsRequestsOffers')}</h4>
                            <span className="text-sm text-text-gray">
                              {formatCompactNumber(totalRequests + totalOffers)} {t('admin.analyticsRequests')}
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
                                  name={t('admin.analyticsRequests')}
                                  fill="#1A73E8"
                                  radius={[8, 8, 0, 0]}
                                  barSize={20}
                                />
                                <Bar
                                  dataKey="offers"
                                  name={t('admin.analyticsOffers')}
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
            </div>
          )}

          {activeTab === 'verification' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-cairo font-bold text-text-dark">{t('admin.pendingKYC')}</h3>
                <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                  <div className="relative">
                    <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('common.search')}
                      className={`${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {pendingVerifications.map((verification) => (
                  <div key={verification.id} className="bg-secondary/50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-text-dark">{verification.companyName}</h4>
                        <p className="text-sm text-text-gray">{verification.email}</p>
                        <p className="text-xs text-text-light mt-1">
                          {t('admin.kycLine', { type: t(`admin.role.${verification.type}`) || verification.type, date: verification.submittedAt })}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        {t('admin.pending')}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-text-dark mb-2">{t('admin.documents')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {getKycDocuments(verification.rawUser).map((doc, i) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-lg text-sm text-text-gray">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => handleApprove(verification.id)}
                      >
                        <CheckCircle className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('admin.approve')}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(verification.id)}
                      >
                        <XCircle className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('admin.reject')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'disputes' && (
            <Card>
              <h3 className="text-xl font-cairo font-bold text-text-dark mb-6">{t('admin.activeDisputes')}</h3>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="bg-secondary/50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-text-dark">{t('admin.dealLabel', { id: dispute.dealId })}</h4>
                        <p className="text-sm text-text-gray">{dispute.description}</p>
                        <p className="text-xs text-text-light mt-1">
                          {t('admin.disputeReportedLine', { by: dispute.reportedBy, date: dispute.reportedAt })}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {dispute.status === 'open' ? t('admin.disputeOpen') : dispute.status}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="primary" className="flex-1">
                        {t('admin.viewDetails')}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleResolveDispute(dispute.id)}
                      >
                        {t('admin.resolve')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <h3 className="text-xl font-cairo font-bold text-text-dark mb-6">{t('admin.userManagement')}</h3>
              <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-4'} mb-6`}>
                <div className="flex-1 relative">
                  <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light`} />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder={t('admin.searchUsers')}
                    className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary`}
                  />
                </div>
                <Button variant="outline" onClick={() => setShowUserFilters(prev => !prev)}>
                  <Filter className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('common.filter')}
                </Button>
              </div>

              {showUserFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-secondary/40 border border-secondary rounded-lg p-4">
                  <div>
                    <label className={`block text-sm text-text-gray mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.userType')}
                    </label>
                    <select
                      value={userTypeFilter}
                      onChange={(e) => setUserTypeFilter(e.target.value)}
                      className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} py-2 px-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary bg-white`}
                    >
                      <option value="all">{t('admin.filterAll')}</option>
                      <option value="supplier">{t('admin.roleSupplier')}</option>
                      <option value="manufacturer">{t('admin.roleManufacturer')}</option>
                      <option value="admin">{t('admin.roleAdmin')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm text-text-gray mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.userStatus')}
                    </label>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} py-2 px-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary bg-white`}
                    >
                      <option value="all">{t('admin.filterAll')}</option>
                      <option value="verified">{t('supplier.kycVerified')}</option>
                      <option value="pending">{t('supplier.kycPending')}</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full" onClick={handleClearUserFilters}>
                      {t('admin.clearFilters')}
                    </Button>
                  </div>
                </div>
              )}

              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-text-gray border-b border-secondary">
                        <th className="pb-3 font-medium">{t('admin.userName')}</th>
                        <th className="pb-3 font-medium">{t('admin.userEmail')}</th>
                        <th className="pb-3 font-medium">{t('admin.userType')}</th>
                        <th className="pb-3 font-medium">{t('admin.userStatus')}</th>
                        <th className="pb-3 font-medium">{t('admin.userJoined')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="text-text-dark">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className={`w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                                {(userItem.companyName || userItem.email || 'U')[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold">{userItem.companyName || t('admin.unknownUser')}</p>
                                <p className="text-xs text-text-light">#{userItem.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-text-gray">{userItem.email}</td>
                          <td className="py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-text-gray">
                              {userItem.type === 'supplier'
                                ? t('admin.roleSupplier')
                                : userItem.type === 'manufacturer'
                                  ? t('admin.roleManufacturer')
                                  : t('admin.roleAdmin')}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${userItem.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {userItem.verified ? t('supplier.kycVerified') : t('supplier.kycPending')}
                            </span>
                          </td>
                          <td className="py-4 text-text-gray">
                            {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-gray text-center py-8">
                  {t('admin.noUsers')}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel

