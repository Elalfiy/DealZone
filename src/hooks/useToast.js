import { useCallback } from 'react'
import { useApp } from '../context/AppContext'

export const useToast = () => {
  const { addNotification, removeNotification } = useApp()

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = addNotification({ message, type })
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [addNotification, removeNotification])

  const success = useCallback((message) => showToast(message, 'success'), [showToast])
  const error = useCallback((message) => showToast(message, 'error'), [showToast])
  const info = useCallback((message) => showToast(message, 'info'), [showToast])
  const warning = useCallback((message) => showToast(message, 'warning'), [showToast])

  return { showToast, success, error, info, warning }
}

