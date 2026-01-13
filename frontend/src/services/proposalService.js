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
      
      const response = await fetch(url);
      
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
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`);
      
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
      'medical_checkup_required': 'Medical Checkup Required',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'policy_issued': 'Policy Issued',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }
}

export default new ProposalService();