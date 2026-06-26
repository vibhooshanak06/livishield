const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const authHeaders = () => {
  const token = localStorage.getItem('liveshield_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = async (res) => {
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
};

const paymentService = {
  /* Create Razorpay order — returns orderId, amount, keyId */
  createOrder: (proposalId) =>
    fetch(`${API}/payments/orders/${proposalId}`, {
      method: 'POST', headers: authHeaders(),
    }).then(handle),

  /* Verify after Razorpay callback */
  verifyPayment: (payload) =>
    fetch(`${API}/payments/verify`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handle),

  /* All payments for current user */
  getUserPayments: () =>
    fetch(`${API}/payments/my`, { headers: authHeaders() }).then(handle),

  /* Payment status for a specific proposal */
  getPaymentByProposal: (proposalId) =>
    fetch(`${API}/payments/proposal/${proposalId}`, { headers: authHeaders() }).then(handle),

  formatCurrency: (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0),

  /* Load Razorpay SDK dynamically */
  loadRazorpaySDK: () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    }),
};

export default paymentService;
