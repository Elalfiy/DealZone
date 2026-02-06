import { motion } from 'framer-motion'
import Card from '../Card'
import Button from '../Button'

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <div className="text-center py-12 px-4">
          {Icon && (
            <div className="mb-4 flex justify-center">
              <Icon className="w-16 h-16 text-text-light" />
            </div>
          )}
          <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-text-gray mb-6 max-w-md mx-auto">
              {description}
            </p>
          )}
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default EmptyState

