import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin,
  ArrowRight,
  Package,
  Phone,
  Mail
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'

const ShippingTracking = () => {
  const { trackingId } = useParams()
  const { deals, user } = useApp()
  const { t, language } = useTranslation()
  
  // Find deal by tracking ID (extract deal ID from tracking number)
  const dealId = trackingId?.replace('TRK', '')
  const deal = deals.find(d => d.id === parseInt(dealId)) || deals[0]

  // Calculate tracking steps based on deal status
  const getTrackingSteps = () => {
    const steps = [
      { 
        step: t('shipping.pickedUp'), 
        date: deal?.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '2024-01-15', 
        time: deal?.createdAt ? new Date(deal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2:45 PM', 
        status: 'completed', 
        location: t('shipping.cairoWarehouse')
      },
    ]
    
    if (deal?.status === 'shipped' || deal?.status === 'delivered' || deal?.status === 'completed') {
      steps.push({
        step: t('shipping.inTransit'),
        date: deal?.shippedAt ? new Date(deal.shippedAt).toLocaleDateString() : '2024-01-16',
        time: deal?.shippedAt ? new Date(deal.shippedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM',
        status: deal?.status === 'delivered' || deal?.status === 'completed' ? 'completed' : 'current',
        location: t('shipping.alexandriaHub')
      })
    } else {
      steps.push({
        step: t('shipping.inTransit'),
        date: null,
        time: null,
        status: 'pending',
        location: t('shipping.alexandriaHub')
      })
    }
    
    if (deal?.status === 'delivered' || deal?.status === 'completed') {
      steps.push({
        step: t('shipping.outForDelivery'),
        date: deal?.deliveredAt ? new Date(deal.deliveredAt).toLocaleDateString() : '2024-01-17',
        time: deal?.deliveredAt ? new Date(deal.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2:00 PM',
        status: 'completed',
        location: t('shipping.gizaDistribution')
      })
      steps.push({
        step: t('shipping.delivered'),
        date: deal?.deliveredAt ? new Date(deal.deliveredAt).toLocaleDateString() : '2024-01-17',
        time: deal?.deliveredAt ? new Date(deal.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '3:30 PM',
        status: 'completed',
        location: t('shipping.yourAddress')
      })
    } else {
      steps.push({
        step: t('shipping.outForDelivery'),
        date: null,
        time: null,
        status: 'pending',
        location: t('shipping.gizaDistribution')
      })
      steps.push({
        step: t('shipping.delivered'),
        date: null,
        time: null,
        status: 'pending',
        location: t('shipping.yourAddress')
      })
    }
    
    return steps
  }

  const trackingSteps = getTrackingSteps()

  // Calculate estimated delivery
  const calculateEstimatedDelivery = () => {
    if (deal?.deliveredAt) {
      return new Date(deal.deliveredAt).toLocaleDateString()
    }
    if (deal?.shippedAt) {
      const shipped = new Date(deal.shippedAt)
      const estimated = new Date(shipped.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      return estimated.toLocaleDateString()
    }
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }

  const shipmentInfo = {
    trackingNumber: trackingId || `TRK${deal?.id || '123456789'}`,
    courier: deal?.courier || 'Express Logistics',
    estimatedDelivery: calculateEstimatedDelivery(),
    weight: deal?.weight || '500 kg',
    dimensions: deal?.dimensions || '120 x 80 x 60 cm',
    origin: deal?.origin || t('shipping.cairoEgypt'),
    destination: deal?.destination || user?.address || t('shipping.gizaEgypt'),
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'current':
        return <Clock className="w-6 h-6 text-primary animate-pulse" />
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-secondary" />
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            to={deal ? `/deal/${deal.id}` : '/dashboard'} 
            className={`inline-flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary mb-6 transition-colors`}
          >
            <ArrowRight className={`w-5 h-5 ${language === 'ar' ? '' : 'rotate-180'}`} />
            <span>{t('shipping.backToDeal')}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('shipping.title')}
            </h1>
            <p className="text-text-gray">
              {t('shipping.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tracking Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">
                  {t('shipping.trackingTimeline')}
                </h2>
                <div className="space-y-6">
                  {trackingSteps.map((item, index) => (
                    <div key={index} className={`flex items-start ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={language === 'ar' ? 'ml-4' : 'mr-4'}>
                        {getStatusIcon(item.status)}
                        {index < trackingSteps.length - 1 && (
                          <div className={`w-0.5 h-16 ${
                            item.status === 'completed' ? 'bg-green-600' : 'bg-secondary'
                          } mt-2 ${language === 'ar' ? 'mr-2.5' : 'ml-2.5'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : ''} justify-between mb-1`}>
                          <h3 className={`font-semibold ${
                            item.status === 'current' ? 'text-primary' : 
                            item.status === 'completed' ? 'text-green-600' : 'text-text-gray'
                          }`}>
                            {item.step}
                          </h3>
                          {item.date && (
                            <span className="text-sm text-text-gray">
                              {item.date} {t('shipping.at')} {item.time}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm text-text-gray flex items-center space-x-1 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <h2 className="text-2xl font-cairo font-bold text-text-dark mb-4">
                  {t('shipping.locationMap')}
                </h2>
                <div className="bg-secondary rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-text-light mx-auto mb-2" />
                    <p className="text-text-gray">
                      {t('shipping.mapPlaceholder')}
                    </p>
                    <p className="text-sm text-text-light">
                      {t('shipping.currentLocation')}{' '}
                      {trackingSteps.find(s => s.status === 'current')?.location || trackingSteps[trackingSteps.length - 1]?.location}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Shipment Details */}
            <div className="space-y-6">
              <Card>
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} mb-6`}>
                  <Package className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-cairo font-bold text-text-dark">
                    {t('shipping.shipmentDetails')}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-gray mb-1">
                      {t('shipping.trackingNumber')}
                    </p>
                    <p className="font-semibold text-text-dark font-mono">{shipmentInfo.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-gray mb-1">
                      {t('shipping.courier')}
                    </p>
                    <p className="font-semibold text-text-dark">{shipmentInfo.courier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-gray mb-1">
                      {t('shipping.estimatedDelivery')}
                    </p>
                    <p className="font-semibold text-text-dark">{shipmentInfo.estimatedDelivery}</p>
                  </div>
                  <div className="border-t border-secondary pt-4">
                    <p className="text-sm text-text-gray mb-2">
                      {t('shipping.packageInfo')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-gray">
                          {t('shipping.weight')}
                        </span>
                        <span className="font-semibold">{shipmentInfo.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-gray">
                          {t('shipping.dimensions')}
                        </span>
                        <span className="font-semibold">{shipmentInfo.dimensions}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-secondary pt-4">
                    <p className="text-sm text-text-gray mb-2">
                      {t('shipping.route')}
                    </p>
                    <div className="space-y-2">
                      <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-sm">{shipmentInfo.origin}</span>
                      </div>
                      <div className={`w-0.5 h-4 bg-secondary ${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
                      <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{shipmentInfo.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-4">
                  {t('shipping.courierContact')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-text-gray" />
                    <span className="text-text-dark">+20 123 456 7890</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-text-gray" />
                    <span className="text-text-dark">support@expresslogistics.com</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    {t('shipping.contactCourier')}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingTracking

