import api from '../config/api';

export const kycService = {
  /**
   * Upload KYC document file
   * @param {File} file - The file to upload
   * @param {string} docType - Type of document (e.g., 'business_license', 'tax_certificate')
   * @returns {Promise} Response from backend
   */
  uploadKycFile: async (file, docType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);

      const response = await api.post('/companies/kyc/upload', formData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload KYC file');
    }
  },

  /**
   * Get KYC status for current user
   * @returns {Promise} KYC status
   */
  getKycStatus: async () => {
    try {
      const response = await api.get('/companies/kyc/status');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  },
};

export default kycService;
