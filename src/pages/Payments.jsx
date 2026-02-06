import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const Payments = () => {
  const { user, deals } = useApp()
  const { t, language } = useTranslation()
  const payments = deals.filter(d => 
    (user?.type === 'manufacturer' && d.manufacturerId === user?.id) ||
    (user?.type === 'supplier' && d.supplierId === user?.id)
  ) || []

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
            {t('payments.title')}
          </h1>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((deal) => (
                <Card key={deal.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {getCompanyText(deal.productName, deal.productNameAr)}
                      </h3>
                      <p className="text-text-gray">
                        {user?.type === 'manufacturer' 
                          ? t('payments.to', { name: getCompanyText(deal.supplierName, deal.supplierNameAr) })
                          : t('payments.from', { name: getCompanyText(deal.manufacturerName, deal.manufacturerNameAr) })
                        }
                      </p>
                    </div>
                    <div className={`text-right ${language === 'ar' ? 'text-left ml-6' : 'mr-6'}`}>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(deal.amount, language)}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        deal.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        deal.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deal.paymentStatus === 'completed' 
                          ? t('payments.completed')
                          : t('payments.pending')
                        }
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/deal/${deal.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('payments.viewDetails')}
                      </Button>
                    </Link>
                    {deal.paymentStatus === 'pending' && user?.type === 'manufacturer' && (
                      <Link to={`/escrow/${deal.id}`} className="flex-1">
                        <Button variant="primary" className="w-full">
                          {t('payments.payNow')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                  {t('payments.noPayments')}
                </h3>
                <p className="text-text-gray">
                  {t('payments.noPaymentsYet')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Payments

