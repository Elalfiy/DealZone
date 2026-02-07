import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Package,
  Settings,
  LogOut,
  ClipboardList,
  Menu,
  X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'

const MobileDrawer = ({ userType = 'manufacturer' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useApp()
  const { t, language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  
  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  // Manufacturer Menu
  const manufacturerMenu = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/dashboard/manufacturer' },
    { icon: FileText, label: t('sidebar.myRFQs'), path: '/my-rfqs' },
    { icon: FileText, label: t('sidebar.receivedOffers'), path: '/received-offers' },
    { icon: ClipboardList, label: t('sidebar.tenders'), path: '/tenders' },
    { icon: Package, label: t('sidebar.activeDeals'), path: '/deal-tracking' },
  ]

  // Supplier Menu
  const supplierMenu = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/dashboard/supplier' },
    { icon: Package, label: t('sidebar.myProducts'), path: '/my-products' },
    { icon: FileText, label: t('sidebar.incomingRFQs'), path: '/incoming-rfqs' },
    { icon: FileText, label: t('sidebar.myOffers'), path: '/my-offers' },
    { icon: ClipboardList, label: t('sidebar.tenders'), path: '/tenders' },
    { icon: Package, label: t('sidebar.activeDeals'), path: '/deal-tracking' },
  ]

  // Admin Menu
  const adminMenu = [
    { icon: LayoutDashboard, label: t('sidebar.adminDashboard'), path: '/admin' },
    { icon: Settings, label: t('sidebar.settings'), path: '/profile' },
  ]

  const menu = userType === 'admin' 
    ? adminMenu 
    : userType === 'manufacturer' 
      ? manufacturerMenu 
      : supplierMenu

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-24 z-40 p-2 bg-white rounded-lg shadow-md"
        style={{ [language === 'ar' ? 'left' : 'right']: '1rem' }}
        aria-label={t('aria.openMenu')}
      >
        <Menu className="w-6 h-6 text-text-dark" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-64 bg-white z-50 shadow-2xl md:hidden overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-secondary">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                  aria-label={t('aria.home')}
                >
                  <img
                    src="/DealZone%20Logo.jpeg"
                    alt={t('aria.home')}
                    className="w-10 h-10 object-contain flex-shrink-0"
                    loading="eager"
                  />
                  <span className="text-lg font-cairo font-bold text-text-dark whitespace-nowrap">DealZone</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label={t('aria.closeMenu')}
                >
                  <X className="w-6 h-6 text-text-dark" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {menu.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'} px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-gray hover:bg-secondary hover:text-text-dark'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
                
                {/* Logout */}
                <div className="pt-4 border-t border-secondary">
                  <button 
                    onClick={handleLogout}
                    className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-3'} px-4 py-3 rounded-lg text-text-gray hover:bg-secondary hover:text-text-dark w-full transition-all`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('sidebar.logout')}</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileDrawer

