import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const LogoPlaceholder = ({ size = 'default', showText = true, className = '' }) => {
  const { t } = useTranslation()

  const sizes = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  }

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  }

  const textSizes = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
  }

  return (
    <Link 
      to="/" 
      className={`flex items-center justify-center gap-2 group ${className}`}
      aria-label={t('aria.home')}
    >
      {/* Logo Container - 100x100 safe area */}
      <div 
        className="bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
        style={{ 
          width: '100px', 
          height: '100px',
          minWidth: '100px', 
          minHeight: '100px' 
        }}
      >
        {/* Logo Image Placeholder - Replace this div with <img src="..." className="w-full h-full object-contain" /> when you have the logo */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <ShoppingBag className="w-12 h-12 text-white" />
        </div>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-cairo font-bold text-text-dark whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]`}>
          DealZone
        </span>
      )}
    </Link>
  )
}

export default LogoPlaceholder

