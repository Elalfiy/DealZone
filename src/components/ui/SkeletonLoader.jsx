import { motion } from 'framer-motion'

const SkeletonLoader = ({ 
  variant = 'default', 
  className = '',
  lines = 1,
  width = '100%',
  height = '1rem'
}) => {
  const baseClasses = 'animate-pulse bg-secondary rounded'
  
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={baseClasses}
            style={{ 
              width: i === lines - 1 ? '80%' : width,
              height 
            }}
          />
        ))}
      </div>
    )
  }
  
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${baseClasses} ${className}`}
      >
        <div className={`${baseClasses} w-full h-48 mb-4`} />
        <div className="space-y-2">
          <div className={`${baseClasses} h-6 w-3/4`} />
          <div className={`${baseClasses} h-4 w-1/2`} />
        </div>
      </motion.div>
    )
  }
  
  if (variant === 'avatar') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width, height }}
      />
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${className}`}
      style={{ width, height }}
    />
  )
}

export default SkeletonLoader

