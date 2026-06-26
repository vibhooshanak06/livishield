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

const adminService = {
  /* ── Dashboard ── */
  getDashboardStats: () =>
    fetch(`${API}/admin/stats`, { headers: authHeaders() }).then(handle),

  /* ── Proposal queue ── */
  getProposals: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && q.append(k, v));
    return fetch(`${API}/admin/proposals?${q}`, { headers: authHeaders() }).then(handle);
  },

  /* ── Single proposal ── */
  getProposalDetail: (id) =>
    fetch(`${API}/admin/proposals/${id}`, { headers: authHeaders() }).then(handle),

  /* ── Status transitions ── */
  approveProposal: (id, body) =>
    fetch(`${API}/admin/proposals/${id}/approve`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  rejectProposal: (id, body) =>
    fetch(`${API}/admin/proposals/${id}/reject`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  requestDocuments: (id, body) =>
    fetch(`${API}/admin/proposals/${id}/request-documents`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  requireMedicalCheckup: (id, body) =>
    fetch(`${API}/admin/proposals/${id}/medical-checkup`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  moveToUnderReview: (id, body = {}) =>
    fetch(`${API}/admin/proposals/${id}/under-review`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  /* ── Document verification ── */
  verifyDocument: (proposalId, docType) =>
    fetch(`${API}/admin/proposals/${proposalId}/documents/${docType}/verify`, {
      method: 'POST', headers: authHeaders(),
    }).then(handle),

  rejectDocument: (proposalId, docType, reason) =>
    fetch(`${API}/admin/proposals/${proposalId}/documents/${docType}/reject`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ reason }),
    }).then(handle),

  /* ── Audit log (MongoDB) ── */
  getAuditLog: (proposalId) =>
    fetch(`${API}/admin/proposals/${proposalId}/audit-log`, { headers: authHeaders() }).then(handle),

  /* ── Assign agent ── */
  assignAgent: (proposalId, agentData) =>
    fetch(`${API}/admin/proposals/${proposalId}/assign`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(agentData),
    }).then(handle),

  /* ── User management ── */
  getUsers: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && q.append(k, v));
    return fetch(`${API}/admin/users?${q}`, { headers: authHeaders() }).then(handle);
  },

  updateUserRole: (userId, role) =>
    fetch(`${API}/admin/users/${userId}/role`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ role }),
    }).then(handle),

  /* ── Plan management ── */
  getPlans: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && q.append(k, v));
    return fetch(`${API}/admin/plans?${q}`, { headers: authHeaders() }).then(handle);
  },

  createPlan: (body) =>
    fetch(`${API}/admin/plans`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  updatePlan: (id, body) =>
    fetch(`${API}/admin/plans/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handle),

  deletePlan: (id) =>
    fetch(`${API}/admin/plans/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    }).then(handle),

  /* ── Helpers ── */
  formatCurrency: (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0),

  formatDate: (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',

  formatDateTime: (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',

  statusLabel: (s) => ({
    submitted: 'Submitted', under_review: 'Under Review',
    documents_required: 'Docs Required', documents_expired: 'Docs Expired',
    medical_checkup_required: 'Medical Checkup', approved: 'Approved',
    rejected: 'Rejected', policy_issued: 'Policy Issued', cancelled: 'Cancelled',
  }[s] || s),

  statusColor: (s) => ({
    submitted:                  'bg-blue-100 text-blue-800 border-blue-200',
    under_review:               'bg-yellow-100 text-yellow-800 border-yellow-200',
    documents_required:         'bg-orange-100 text-orange-800 border-orange-200',
    documents_expired:          'bg-red-100 text-red-800 border-red-200',
    medical_checkup_required:   'bg-purple-100 text-purple-800 border-purple-200',
    approved:                   'bg-green-100 text-green-800 border-green-200',
    rejected:                   'bg-red-100 text-red-800 border-red-200',
    policy_issued:              'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled:                  'bg-gray-100 text-gray-600 border-gray-200',
  }[s] || 'bg-gray-100 text-gray-600 border-gray-200'),
};

export default adminService;
