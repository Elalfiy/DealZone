import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'

const CreateTenderPage = () => {
  const navigate = useNavigate()
  const { user, addTender } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()

  const [form, setForm] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    categoryKey: 'metals',
    quantity: '',
    unitEn: 'kg',
    unitAr: 'كجم',
    targetPrice: '',
    startDate: '',
    endDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = useMemo(() => ([
    { key: 'metals', label: t('category.metals') },
    { key: 'textiles', label: t('category.textiles') },
    { key: 'food', label: t('category.food') },
  ]), [t])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()

    if (!form.titleEn.trim() || !form.titleAr.trim()) {
      error(t('common.error') || 'Error')
      return
    }

    if (!form.targetPrice || Number.isNaN(parseFloat(form.targetPrice))) {
      error(t('common.error') || 'Error')
      return
    }

    if (!form.quantity || Number.isNaN(parseFloat(form.quantity))) {
      error(t('common.error') || 'Error')
      return
    }

    if (!form.startDate || !form.endDate) {
      error(t('common.error') || 'Error')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 400))

      addTender({
        title: { en: form.titleEn.trim(), ar: form.titleAr.trim() },
        description: { en: form.descriptionEn.trim(), ar: form.descriptionAr.trim() },
        categoryKey: form.categoryKey,
        quantity: parseFloat(form.quantity),
        unit: { en: form.unitEn.trim() || 'kg', ar: form.unitAr.trim() || 'كجم' },
        targetPrice: parseFloat(form.targetPrice),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        specifications: {},
        manufacturerId: user?.id,
        manufacturerName: user?.companyName || user?.name || 'Manufacturer',
        status: 'active',
        bids: [],
      })

      success(t('tenders.create.submit'))
      navigate('/tenders')
    } catch (e) {
      error(t('common.error') || 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <MobileDrawer userType={user?.type} />

      <div className={`pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`inline-flex items-center text-text-gray hover:text-primary transition-colors ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              >
                <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                <span>{t('tenders.back')}</span>
              </button>

              <div className={`mt-2 flex items-center ${language === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-cairo font-bold text-text-dark">{t('tenders.createTender')}</h1>
                  <p className="text-sm text-text-gray mt-1">{t('tenders.subtitle')}</p>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.titleEn')}
                  </label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => update('titleEn', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('tenders.create.titleEnPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.titleAr')}
                  </label>
                  <input
                    type="text"
                    value={form.titleAr}
                    onChange={(e) => update('titleAr', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('tenders.create.titleArPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.descriptionEn')}
                  </label>
                  <textarea
                    rows={4}
                    value={form.descriptionEn}
                    onChange={(e) => update('descriptionEn', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('tenders.create.descriptionPlaceholder')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.descriptionAr')}
                  </label>
                  <textarea
                    rows={4}
                    value={form.descriptionAr}
                    onChange={(e) => update('descriptionAr', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('tenders.create.descriptionPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.category')}
                  </label>
                  <select
                    value={form.categoryKey}
                    onChange={(e) => update('categoryKey', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.quantity')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('tenders.create.quantityPlaceholder')}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('tenders.create.unitEn')}
                    </label>
                    <input
                      type="text"
                      value={form.unitEn}
                      onChange={(e) => update('unitEn', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('tenders.create.unitAr')}
                    </label>
                    <input
                      type="text"
                      value={form.unitAr}
                      onChange={(e) => update('unitAr', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.targetPrice')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.targetPrice}
                    onChange={(e) => update('targetPrice', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('tenders.create.targetPricePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.startDate')}
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-text-dark mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('tenders.create.endDate')}
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => update('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/tenders')}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                  {t('tenders.create.submit')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateTenderPage
