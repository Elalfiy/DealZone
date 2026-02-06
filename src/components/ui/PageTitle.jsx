import { motion } from 'framer-motion'

const PageTitle = ({ title, subtitle, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 ${className}`}
    >
      <h1 className="text-3xl sm:text-4xl font-cairo font-bold text-text-dark mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-text-gray">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

export default PageTitle

