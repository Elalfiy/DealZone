import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'
import Card from '../Card'
import { useTranslation } from '../../hooks/useTranslation'

const InfoCard = ({ 
  title, 
  description, 
  items = [],
  className = '',
  collapsible = true 
}) => {
  const [isOpen, setIsOpen] = useState(!collapsible)
  const { t, language } = useTranslation()

  return (
    <Card className={`${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center space-x-3 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-cairo font-bold text-text-dark">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-text-gray mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {collapsible && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            <X className={`w-5 h-5 text-text-gray transition-transform ${isOpen ? 'rotate-0' : 'rotate-45'}`} />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {items.length > 0 && (
              <ul className={`space-y-2 ${language === 'ar' ? 'pr-4' : 'pl-4'}`}>
                {items.map((item, index) => (
                  <li key={index} className="text-sm text-text-gray list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default InfoCard

