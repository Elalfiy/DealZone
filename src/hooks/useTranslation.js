import { useLanguage } from '../context/LanguageContext'
import { translations } from '../utils/translations'

export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations.en[key] || key
    
    // Replace placeholders like {count}, {name}, etc.
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param])
      })
    }
    
    return text
  }
  
  return { t, language }
}

