import { useState } from 'react'
import { Upload, Check, AlertCircle } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import kycService from '../services/kycService'
import Button from './Button'

const KycUploadWidget = ({ onSuccess, companyId, currentStatus = null }) => {
  const [file, setFile] = useState(null)
  const [docType, setDocType] = useState('business_license')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const { success, error } = useToast()

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      error('File size must be less than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(selectedFile.type)) {
      error('Only JPG, PNG, and PDF files are allowed')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      error('Please select a file first')
      return
    }

    setIsLoading(true)
    try {
      const result = await kycService.uploadKycFile(file, docType)
      setStatus(result.status)
      setFile(null)
      success('KYC document uploaded successfully')
      if (onSuccess) onSuccess(result)
    } catch (err) {
      error(err.message || 'Failed to upload KYC document')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="border border-secondary rounded-lg p-6">
      <h3 className="font-bold text-lg text-text-dark mb-4">KYC Verification</h3>

      {status && (
        <div className={`p-3 rounded-lg mb-4 ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {status?.toLowerCase() === 'approved' && <Check className="w-5 h-5" />}
            {status?.toLowerCase() === 'pending' && <AlertCircle className="w-5 h-5" />}
            {status?.toLowerCase() === 'rejected' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium capitalize">{status} for verification</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="business_license">Business License</option>
            <option value="tax_certificate">Tax Certificate</option>
            <option value="registration_document">Registration Document</option>
            <option value="id_document">ID Document</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Upload Document</label>
          <div className="border-2 border-dashed border-secondary rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="kyc-file"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={isLoading}
              className="hidden"
            />
            <label htmlFor="kyc-file" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-text-gray" />
              <p className="text-sm text-text-gray">
                {file ? file.name : 'Click to select or drag and drop'}
              </p>
              <p className="text-xs text-text-light mt-1">JPG, PNG, or PDF (Max 5MB)</p>
            </label>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || isLoading}
          variant="primary"
          className="w-full"
        >
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </div>
  )
}

export default KycUploadWidget
