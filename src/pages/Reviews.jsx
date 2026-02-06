import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, CheckCircle, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'

const Reviews = () => {
  const { user, deals } = useApp()
  const { t, language } = useTranslation()
  const reviews = deals.filter(d => 
    d.review && 
    ((user?.type === 'manufacturer' && d.manufacturerId === user?.id) ||
     (user?.type === 'supplier' && d.supplierId === user?.id))
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
            {t('reviews.title')}
          </h1>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((deal) => (
                <Card key={deal.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {getCompanyText(deal.productName, deal.productNameAr)}
                      </h3>
                      <p className="text-text-gray mb-4">
                        {user?.type === 'manufacturer' 
                          ? t('reviews.supplier', { name: getCompanyText(deal.supplierName, deal.supplierNameAr) })
                          : t('reviews.manufacturer', { name: getCompanyText(deal.manufacturerName, deal.manufacturerNameAr) })
                        }
                      </p>
                      <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} mb-2`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < (deal.review?.rating || 0)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`${language === 'ar' ? 'mr-2' : 'ml-2'} text-sm text-text-gray`}>
                          ({deal.review?.rating || 0}/5)
                        </span>
                      </div>
                      {deal.review?.review && (
                        <p className="text-text-gray mb-2">{deal.review.review}</p>
                      )}
                      {deal.review?.onTimeDelivery && (
                        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} text-green-600 text-sm`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {t('reviews.onTimeDelivery')}
                          </span>
                        </div>
                      )}
                    </div>
                    {deal.review?.onTimeDelivery && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <Link to={`/deal/${deal.id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('reviews.viewDeal')}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                  {t('reviews.noReviews')}
                </h3>
                <p className="text-text-gray">
                  {t('reviews.noReviewsYet')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reviews

