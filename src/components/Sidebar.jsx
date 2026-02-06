import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Package,
  Settings,
  LogOut,
  ClipboardList
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'

const Sidebar = ({ userType = 'manufacturer' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useApp()
  const { t, language } = useTranslation()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Manufacturer Menu - Only what manufacturer should see
  const manufacturerMenu = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/dashboard/manufacturer' },
    { icon: FileText, label: t('sidebar.myRFQs'), path: '/my-rfqs' },
    { icon: FileText, label: t('sidebar.receivedOffers'), path: '/received-offers' },
    { icon: ClipboardList, label: t('sidebar.tenders'), path: '/tenders' },
    { icon: Package, label: t('sidebar.activeDeals'), path: '/deal-tracking' },
  ]

  // Supplier Menu - Only what supplier should see
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
    <aside className={`hidden md:block w-64 bg-white ${language === 'ar' ? 'border-l border-r-0' : 'border-r'} border-secondary min-h-screen fixed ${language === 'ar' ? 'right-0' : 'left-0'} top-0 pt-20 z-30`}>
      <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
        <div className="pt-4 border-t border-secondary">
          <button 
            onClick={handleLogout}
            className={`flex items-center space-x-3 ${language === 'ar' ? 'space-x-reverse' : ''} px-4 py-3 rounded-lg text-text-gray hover:bg-secondary hover:text-text-dark w-full transition-all`}
          >
            <LogOut className="w-5 h-5" />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

