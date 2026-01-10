const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class HealthInsuranceService {
  async getFeaturedPlans(limit = 3) {
    try {
      const response = await fetch(`${API_BASE_URL}/health-insurance/plans/featured?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured plans');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching featured plans:', error);
      throw error;
    }
  }

  async getAllPlans(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/health-insurance/plans?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch health insurance plans');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching health insurance plans:', error);
      throw error;
    }
  }

  async getPlanById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/health-insurance/plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan details');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching plan details:', error);
      throw error;
    }
  }

  async comparePlans(planIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/health-insurance/plans/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to compare plans');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error comparing plans:', error);
      throw error;
    }
  }

  async getPlanStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/health-insurance/plans/statistics`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan statistics');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching plan statistics:', error);
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

  formatNumber(number) {
    return new Intl.NumberFormat('en-IN').format(number);
  }
}

export default new HealthInsuranceService();