import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Lock, 
  Bell, 
  CreditCard,
  Save,
  ArrowLeft,
  Upload,
  X,
  CheckCircle
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { validateEmail, validatePhone, validateRequired, validatePassword } from '../utils/validation'

const ProfileSettings = () => {
  const navigate = useNavigate()
  const { user, login } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [profileData, setProfileData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    taxId: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    dealUpdates: true,
    newOffers: true,
    paymentAlerts: true,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        companyName: user.companyName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        contactPerson: user.contactPerson || '',
        taxId: user.taxId || '',
      })
    }
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const errors = {}
    if (!validateRequired(profileData.companyName)) errors.companyName = t('profile.required')
    if (!validateEmail(profileData.email)) errors.email = t('profile.invalidEmail')
    if (!validatePhone(profileData.phone)) errors.phone = t('profile.invalidPhone')
    if (!validateRequired(profileData.address)) errors.address = t('profile.required')

    if (Object.keys(errors).length > 0) {
      error(t('profile.fixErrors'))
      setIsSaving(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const updatedUser = { ...user, ...profileData }
      login(updatedUser)
      success(t('profile.updateSuccess'))
    } catch (err) {
      error(t('profile.updateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    if (!validatePassword(passwordData.newPassword)) {
      error(t('profile.passwordMinLength'))
      setIsSaving(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error(t('profile.passwordsNotMatch'))
      setIsSaving(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      success(t('profile.passwordChangedSuccess'))
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      error(t('profile.passwordChangeFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: t('profile.companyProfile'), icon: Building2 },
    { id: 'kyc', label: t('profile.kycDocuments'), icon: FileText },
    { id: 'password', label: t('profile.password'), icon: Lock },
    { id: 'notifications', label: t('profile.notifications'), icon: Bell },
    { id: 'payment', label: t('profile.paymentMethods'), icon: CreditCard },
  ]

  const notificationCopy = {
    emailNotifications: {
      title: t('profile.notifications.email.title'),
      desc: t('profile.notifications.email.desc'),
    },
    dealUpdates: {
      title: t('profile.notifications.dealUpdates.title'),
      desc: t('profile.notifications.dealUpdates.desc'),
    },
    newOffers: {
      title: t('profile.notifications.newOffers.title'),
      desc: t('profile.notifications.newOffers.desc'),
    },
    paymentAlerts: {
      title: t('profile.notifications.paymentAlerts.title'),
      desc: t('profile.notifications.paymentAlerts.desc'),
    },
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} pt-20 p-8`}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} text-text-gray hover:text-primary mb-6 transition-colors`}
          >
            <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t('profile.back')}</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-cairo font-bold text-text-dark mb-2">
              {t('profile.title')}
            </h1>
            <p className="text-text-gray">{t('profile.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-soft p-2 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 ${language === 'ar' ? 'space-x-reverse' : ''} px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-gray hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('profile.companyProfile')}</h2>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          {t('profile.companyName')} *
                        </label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          {t('profile.contactPerson')} *
                        </label>
                        <input
                          type="text"
                          value={profileData.contactPerson}
                          onChange={(e) => setProfileData(prev => ({ ...prev, contactPerson: e.target.value }))}
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          {t('profile.email')} *
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          {t('profile.phone')} *
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          {t('profile.address')} *
                        </label>
                        <textarea
                          value={profileData.address}
                          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                          rows="3"
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          {t('profile.taxId')}
                        </label>
                        <input
                          type="text"
                          value={profileData.taxId}
                          onChange={(e) => setProfileData(prev => ({ ...prev, taxId: e.target.value }))}
                          className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="primary" disabled={isSaving}>
                      <Save className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {isSaving ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                  </form>
                </Card>
              )}

              {/* KYC Tab */}
              {activeTab === 'kyc' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('profile.kycDocuments')}</h2>
                  <div className="space-y-6">
                    <div className="bg-secondary/50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-text-dark">{t('profile.businessLicense')}</h3>
                          <p className="text-sm text-text-gray">{t('profile.status')}: {user.verified ? t('profile.verified') : t('profile.pending')}</p>
                        </div>
                        {user.verified && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            setSelectedFile(file)
                            if (file.type.startsWith('image/')) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setFilePreview(reader.result)
                              }
                              reader.readAsDataURL(file)
                            } else {
                              setFilePreview(null)
                            }
                          }
                        }}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('profile.uploadNewDocument')}
                      </Button>
                      {selectedFile && (
                        <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                          <div className={`flex items-center justify-between mb-2`}>
                            <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-2'}`}>
                              {filePreview ? (
                                <img src={filePreview} alt={t('profile.filePreviewAlt')} className="w-12 h-12 rounded" />
                              ) : (
                                <FileText className="w-8 h-8 text-text-gray" />
                              )}
                              <div>
                                <p className="font-semibold text-text-dark">{selectedFile.name}</p>
                                <p className="text-xs text-text-gray">
                                  {(selectedFile.size / 1024).toFixed(2)} {t('profile.fileSizeKb')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedFile(null)
                                setFilePreview(null)
                                if (fileInputRef.current) fileInputRef.current.value = ''
                              }}
                              className="p-1 hover:bg-secondary rounded"
                            >
                              <X className="w-4 h-4 text-text-gray" />
                            </button>
                          </div>
                          <Button
                            variant="primary"
                            className="w-full mt-2"
                            onClick={async () => {
                              setIsSaving(true)
                              try {
                                await new Promise(resolve => setTimeout(resolve, 1500))
                                success(t('profile.documentUploadSuccess'))
                                setSelectedFile(null)
                                setFilePreview(null)
                                if (fileInputRef.current) fileInputRef.current.value = ''
                              } catch (err) {
                                error(t('profile.documentUploadFailed'))
                              } finally {
                                setIsSaving(false)
                              }
                            }}
                            disabled={isSaving}
                          >
                            {isSaving 
                              ? t('profile.uploading') 
                              : t('profile.saveDocument')
                            }
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>{t('profile.note')}:</strong> {t('profile.verificationNote')}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('profile.changePassword')}</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        {t('profile.currentPassword')} *
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        {t('profile.newPassword')} *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      />
                      <p className="text-xs text-text-gray mt-1">{t('profile.passwordMinLength')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        {t('profile.confirmPassword')} *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary" disabled={isSaving}>
                      {isSaving ? t('profile.changing') : t('profile.changePassword')}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('profile.notificationSettings')}</h2>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-text-dark">
                            {(notificationCopy[key]?.title) || key}
                          </h3>
                          <p className="text-sm text-text-gray">{(notificationCopy[key]?.desc) || ''}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                    <Button variant="primary" onClick={() => success(t('profile.notificationSettingsSaved'))}>
                      <Save className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('profile.saveSettings')}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <Card>
                  <h2 className="text-2xl font-cairo font-bold text-text-dark mb-6">{t('profile.paymentMethods')}</h2>
                  <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
                      <div className={`flex items-center space-x-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                        <CreditCard className="w-8 h-8 text-text-gray" />
                        <div>
                          <p className="font-semibold text-text-dark">{t('profile.creditCard')}</p>
                          <p className="text-sm text-text-gray">{t('profile.maskedCardExample')}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-sm">
                        {t('profile.remove')}
                      </Button>
                    </div>
                    <Button variant="primary">
                      <CreditCard className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('profile.addPaymentMethod')}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings

