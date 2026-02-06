import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'

const EmailVerification = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      error(t('auth.emailVerification.enterFullCode'))
      return
    }

    setIsVerifying(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      // In real app, verify code with backend
      success(t('auth.emailVerification.success'))
      navigate('/dashboard/manufacturer')
    } catch (err) {
      error(t('auth.emailVerification.invalidCode'))
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTimeLeft(300)
      setCode(['', '', '', '', '', ''])
      success(t('auth.emailVerification.resent'))
    } catch (err) {
      error(t('auth.emailVerification.resendFailed'))
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-large p-8 md:p-12 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-cairo font-bold text-text-dark mb-3">
              {t('auth.emailVerification.title')}
            </h1>
            <p className="text-text-gray mb-8">
              {t('auth.emailVerification.subtitle')}<br />
              <strong className="text-text-dark">{searchParams.get('email') || t('auth.emailVerification.yourEmail')}</strong>
            </p>

            <form onSubmit={handleVerify} className="mb-6">
              <div className={`flex justify-center ${language === 'ar' ? 'space-x-reverse' : ''} space-x-2 mb-6`}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-secondary rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                ))}
              </div>

              <div className="mb-6">
                {timeLeft > 0 ? (
                  <p className="text-sm text-text-gray">
                    {t('auth.emailVerification.expiresIn')} <strong className="text-primary">{formatTime(timeLeft)}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">{t('auth.emailVerification.expired')}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mb-4"
                disabled={isVerifying || code.join('').length !== 6}
              >
                {isVerifying ? t('auth.emailVerification.verifying') : t('auth.emailVerification.submit')}
              </Button>
            </form>

            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={isResending || timeLeft > 0}
                className="text-primary hover:underline font-medium disabled:text-text-light disabled:cursor-not-allowed"
              >
                {isResending ? t('auth.emailVerification.resending') : t('auth.emailVerification.resend')}
              </button>

              <div className="pt-4 border-t border-secondary">
                <Link to="/login" className="text-sm text-text-gray hover:text-primary">
                  {t('auth.common.backToLogin')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification

