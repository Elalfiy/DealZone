import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, 
  ArrowRight,
  CheckCircle,
  Package,
  Truck,
  Clock
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateRequired } from '../utils/validation'

const RatingReview = () => {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const { deals, updateDeal, user } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [onTimeDelivery, setOnTimeDelivery] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const getCompanyText = (enValue, arValue) => {
    return getText({ en: enValue, ar: arValue })
  }

  const deal = deals.find(d => d.id === parseInt(dealId))

  if (!deal) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">{t('review.dealNotFound')}</h3>
                <p className="text-text-gray">{t('review.dealNotFoundDesc')}</p>
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      error(t('review.errorRating'))
      return
    }
    
    if (!validateRequired(review)) {
      error(t('review.errorReview'))
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      updateDeal(parseInt(dealId), {
        review: {
          rating,
          review,
          onTimeDelivery,
          submittedAt: new Date().toISOString(),
        },
        status: 'completed',
      })

      success(t('review.success'))
      setTimeout(() => {
        navigate(user?.type === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier')
      }, 1500)
    } catch (err) {
      error(t('review.errorSubmit'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
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
              {t('review.title')}
            </h1>
            <p className="text-text-gray">{t('review.subtitle')}</p>
          </motion.div>

          <Card>
            <div className="mb-8">
              <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">{t('review.dealInfo')}</h3>
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                      <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'}`}>
                        <Package className="w-5 h-5 text-text-gray" />
                        <span className="font-semibold text-text-dark">{getCompanyText(deal.productName, deal.productNameAr)}</span>
                      </div>
                      <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'}`}>
                        <CheckCircle className="w-5 h-5 text-text-gray" />
                        <span className="text-text-gray">{t('deal.supplier')}: {getCompanyText(deal.supplierName, deal.supplierNameAr)}</span>
                      </div>
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'}`}>
                  <Truck className="w-5 h-5 text-text-gray" />
                  <span className="text-text-gray">{t('review.deliveredOn', { date: deal.deliveryDate })}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating */}
              <div>
                <label className="block text-lg font-semibold text-text-dark mb-4">
                  {t('review.overallRating')}
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-12 h-12 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className={`text-lg font-semibold text-text-dark ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                      {rating} {rating === 1 ? t('review.star') : t('review.stars')}
                    </span>
                  )}
                </div>
              </div>

              {/* On-Time Delivery */}
              <div>
                <label className="block text-lg font-semibold text-text-dark mb-4">
                  {t('review.onTimeDelivery')}
                </label>
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-4'}`}>
                  <label className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} cursor-pointer`}>
                    <input
                      type="radio"
                      name="onTime"
                      checked={onTimeDelivery}
                      onChange={() => setOnTimeDelivery(true)}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <span className="text-text-dark">{t('review.yes')}</span>
                  </label>
                  <label className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} cursor-pointer`}>
                    <input
                      type="radio"
                      name="onTime"
                      checked={!onTimeDelivery}
                      onChange={() => setOnTimeDelivery(false)}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <span className="text-text-dark">{t('review.no')}</span>
                  </label>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-lg font-semibold text-text-dark mb-4">
                  {t('review.writeReview')}
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="6"
                  placeholder={t('review.placeholder')}
                  className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
                <p className="text-sm text-text-gray mt-2">
                  {t('review.characters', { count: review.length })}
                </p>
              </div>

              {/* Additional Metrics */}
              <div>
                <label className="block text-lg font-semibold text-text-dark mb-4">
                  {t('review.additionalFeedback')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-gray mb-2">{t('review.productQuality')}</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-gray mb-2">{t('review.communication')}</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-gray mb-2">{t('review.packaging')}</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-gray mb-2">{t('review.valueForMoney')}</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(user?.type === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier')}
                  disabled={isSubmitting}
                >
                  {t('review.skip')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={rating === 0 || !review.trim() || isSubmitting}
                >
                  {isSubmitting ? t('review.submitting') : t('review.submit')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RatingReview

