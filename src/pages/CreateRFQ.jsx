import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, ArrowLeft, Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateRequired, validateNumber } from '../utils/validation'

const CreateRFQ = () => {
  const navigate = useNavigate()
  const { user, addRequest } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    categoryKey: '',
    description: '',
    quantity: '',
    unit: 'kg',
    budget: '',
    deliveryDate: '',
    specifications: '',
    location: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})

    const errors = {}
    if (!validateRequired(formData.title)) errors.title = t('rfq.create.titleRequired')
    if (!validateRequired(formData.categoryKey)) errors.category = t('rfq.create.categoryRequired')
    if (!validateRequired(formData.description)) errors.description = t('rfq.create.descriptionRequired')
    if (!validateRequired(formData.quantity) || !validateNumber(formData.quantity, 1)) {
      errors.quantity = t('rfq.create.quantityRequired')
    }
    if (!validateRequired(formData.deliveryDate)) errors.deliveryDate = t('rfq.create.deliveryDateRequired')

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      error(t('rfq.create.fillRequired'))
      setIsSubmitting(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      addRequest({
        title: formData.title,
        manufacturerId: user.id,
        manufacturer: user.companyName,
        categoryKey: formData.categoryKey,
        location: formData.location || user.address,
        budget: formData.budget || 'Negotiable',
        description: formData.description,
        specifications: {
          'Quantity': `${formData.quantity} ${formData.unit}`,
          'Delivery Time': formData.deliveryDate,
          'Additional Specifications': formData.specifications,
        },
        verified: user.verified,
      })
      success(t('rfq.create.success'))
      navigate('/dashboard/manufacturer')
    } catch (err) {
      error(t('rfq.create.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.type !== 'manufacturer') {
    navigate('/dashboard/manufacturer')
    return null
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType="manufacturer" />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-8`}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard/manufacturer')}
            className={`inline-flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'} text-text-gray hover:text-primary mb-6 transition-colors`}
          >
            <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t('rfq.create.backToDashboard')}</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('rfq.create.title')}
            </h1>
            <p className="text-text-gray">{t('rfq.create.subtitle')}</p>
          </motion.div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('rfq.create.rfqTitle')} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                    formErrors.title ? 'border-red-500' : 'border-secondary'
                  }`}
                  placeholder={t('rfq.create.titlePlaceholder')}
                  required
                />
                {formErrors.title && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('rfq.create.category')} *
                  </label>
                  <select
                    name="categoryKey"
                    value={formData.categoryKey}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                      formErrors.category ? 'border-red-500' : 'border-secondary'
                    }`}
                    required
                  >
                    <option value="">{t('rfq.create.selectCategory')}</option>
                    <option value="textiles">{t('category.textiles')}</option>
                    <option value="food">{t('category.food')}</option>
                    <option value="metals">{t('category.metals')}</option>
                  </select>
                  {formErrors.category && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('rfq.create.location')}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={user.address || t('rfq.create.locationPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('rfq.create.description')} *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                    formErrors.description ? 'border-red-500' : 'border-secondary'
                  }`}
                  placeholder={t('rfq.create.descriptionPlaceholder')}
                  required
                />
                {formErrors.description && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('rfq.create.quantity')} *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                      formErrors.quantity ? 'border-red-500' : 'border-secondary'
                    }`}
                    required
                  />
                  {formErrors.quantity && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('rfq.create.unit')}
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="kg">kg</option>
                    <option value="tons">{t('rfq.create.tons')}</option>
                    <option value="units">{t('rfq.create.units')}</option>
                    <option value="pieces">{t('rfq.create.pieces')}</option>
                    <option value="meters">{t('rfq.create.meters')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {t('rfq.create.budget')}
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('rfq.create.budgetPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('rfq.create.deliveryDate')} *
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                    formErrors.deliveryDate ? 'border-red-500' : 'border-secondary'
                  }`}
                  required
                />
                {formErrors.deliveryDate && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.deliveryDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {t('rfq.create.additionalSpecs')}
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder={t('rfq.create.specsPlaceholder')}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/dashboard/manufacturer')}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                  <FileText className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {isSubmitting ? t('rfq.create.creating') : t('rfq.create.createRFQ')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateRFQ

