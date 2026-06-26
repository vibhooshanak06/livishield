const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ProposalService {
  async submitProposal(proposalData) {
    try {
      // Get authentication token
      const token = localStorage.getItem('liveshield_token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/proposals/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(proposalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proposal');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerDashboard(userId) {
    try {
      const url = `${API_BASE_URL}/proposals/dashboard/${userId}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserProposals(userId, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.status) queryParams.append('status', options.status);

      const response = await fetch(`${API_BASE_URL}/proposals/user/${userId}?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch proposals');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async getProposalById(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch proposal details');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusDisplayName(status) {
    const statusMap = {
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'documents_required': 'Documents Required',
      'documents_expired': 'Documents Expired',
      'medical_checkup_required': 'Medical Checkup Required',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'policy_issued': 'Policy Issued',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('liveshield_token');
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Upload a single document file for a proposal.
   * @param {string} proposalId
   * @param {string} docType  - matches required_documents[].type
   * @param {File}   file
   * @param {function} onProgress - optional (loaded, total) callback
   */
  uploadDocument(proposalId, docType, file, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);

      const token = localStorage.getItem('liveshield_token');
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) onProgress(e.loaded, e.total);
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const result = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && result.success) {
            resolve(result);
          } else {
            reject(new Error(result.message || 'Upload failed'));
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      xhr.open('POST', `${API_BASE_URL}/proposals/${proposalId}/documents`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  async deleteDocument(proposalId, docType) {
    const res = await fetch(`${API_BASE_URL}/proposals/${proposalId}/documents/${docType}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to remove document');
    return data;
  }

  async submitDocuments(proposalId) {
    const res = await fetch(`${API_BASE_URL}/proposals/${proposalId}/documents/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to submit documents');
    return data;
  }
}

export default new ProposalService();