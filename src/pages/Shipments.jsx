import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, Package, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'

const Shipments = () => {
  const { user, deals } = useApp()
  const { t, language } = useTranslation()
  const shipments = deals.filter(d => 
    ((user?.type === 'manufacturer' && d.manufacturerId === user?.id) ||
     (user?.type === 'supplier' && d.supplierId === user?.id)) &&
    (d.status === 'shipped' || d.status === 'delivered' || d.status === 'completed')
  ) || []

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-8`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-cairo font-bold text-text-dark mb-8">
            {t('shipments.title')}
          </h1>
          {shipments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shipments.map((shipment) => (
                <Card key={shipment.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                        {shipment.productName}
                      </h3>
                      <p className="text-sm text-text-gray mb-4">
                        {t('shipments.tracking')}TRK{shipment.id}
                      </p>
                      <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-4'} text-sm text-text-gray`}>
                        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                          <MapPin className="w-4 h-4" />
                          <span>
                            {shipment.status === 'delivered' || shipment.status === 'completed'
                              ? t('shipments.delivered')
                              : t('shipments.inTransit')
                            }
                          </span>
                        </div>
                        {shipment.quantity && (
                          <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'}`}>
                            <Package className="w-4 h-4" />
                            <span>{shipment.quantity} {t('shipments.units')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      shipment.status === 'delivered' || shipment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {shipment.status === 'delivered' || shipment.status === 'completed'
                        ? t('shipments.delivered')
                        : t('shipments.shipped')
                      }
                    </span>
                  </div>
                  <Link to={`/shipping/TRK${shipment.id}`}>
                    <Button variant="primary" className="w-full">
                      <Truck className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('shipments.trackShipment')}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
                  {t('shipments.noShipments')}
                </h3>
                <p className="text-text-gray">
                  {t('shipments.noShipmentsYet')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Shipments

