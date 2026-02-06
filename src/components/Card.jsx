import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick,
  variant = 'default',
  padding = 'default'
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }
  
  const variantClasses = {
    default: 'bg-white shadow-soft',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-secondary shadow-none',
    flat: 'bg-white shadow-none',
  }
  
  return (
    <motion.div
      whileHover={hover && onClick ? { 
        y: -4, 
        scale: 1.01,
        transition: { duration: 0.2, ease: 'easeOut' } 
      } : {}}
      className={`
        rounded-xl 
        ${variantClasses[variant]} 
        ${paddingClasses[padding]} 
        ${hover && onClick ? 'card-hover cursor-pointer' : ''} 
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export default Card

