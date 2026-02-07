import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Send } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'

const IncomingRFQs = () => {
  const { user, requests } = useApp()
  const { t, language } = useTranslation()
  const incomingRFQs = requests.filter(r => r.manufacturerId !== user?.id) || []

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <MobileDrawer userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-8`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-cairo font-bold text-text-dark mb-8">
            {t('rfq.incoming')}
          </h1>
          {incomingRFQs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingRFQs.map((rfq) => (
                <Card key={rfq.id} hover>
                  <Link to={`/request/${rfq.id}`}>
                    <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">{getText(rfq.title)}</h3>
                    <p className="text-text-gray text-sm mb-4 line-clamp-2">{getText(rfq.description)}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-text-gray">
                        {t('rfq.budget')}: {rfq.budget}
                      </span>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {t(`category.${rfq.categoryKey || rfq.category}`)}
                      </span>
                    </div>
                    <Button variant="primary" className="w-full">
                      <Send className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('rfq.sendQuote')}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                  {t('rfq.noIncoming')}
                </h3>
                <p className="text-text-gray">
                  {t('rfq.noIncomingYet')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default IncomingRFQs

