// API service client for IIIT Bhubaneswar Mess Management System

const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Session & Roles
  getSession: () => fetchJSON('/session'),
  switchSession: (role, studentId) => fetchJSON('/session/switch', {
    method: 'POST',
    body: JSON.stringify({ role, studentId }),
  }),

  // Overview
  getOverview: () => fetchJSON('/overview'),

  // Members
  getMembers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.hostel) params.append('hostel', filters.hostel);
    if (filters.plan) params.append('plan', filters.plan);
    if (filters.status) params.append('status', filters.status);
    const q = params.toString();
    return fetchJSON(`/members${q ? `?${q}` : ''}`);
  },
  getMemberById: (id) => fetchJSON(`/members/${id}`),
  addMember: (memberData) => fetchJSON('/members', {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),
  updateMember: (id, updates) => fetchJSON(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deleteMember: (id) => fetchJSON(`/members/${id}`, {
    method: 'DELETE',
  }),

  // Menu
  getMenu: () => fetchJSON('/menu'),
  updateMeal: (day, mealType, mealData) => fetchJSON(`/menu/${day}/${mealType}`, {
    method: 'PUT',
    body: JSON.stringify(mealData),
  }),
  resetMenu: () => fetchJSON('/menu/reset', {
    method: 'POST',
  }),

  // Pricing & Guest Tokens
  getPricing: () => fetchJSON('/pricing'),
  updatePricing: (pricingData) => fetchJSON('/pricing', {
    method: 'PUT',
    body: JSON.stringify(pricingData),
  }),
  buyGuestToken: (tokenData) => fetchJSON('/pricing/buy-token', {
    method: 'POST',
    body: JSON.stringify(tokenData),
  }),

  // Rebates & Refunds
  getRebates: (studentId) => fetchJSON(`/rebates${studentId ? `?studentId=${studentId}` : ''}`),
  applyRebate: (rebateData) => fetchJSON('/rebates', {
    method: 'POST',
    body: JSON.stringify(rebateData),
  }),
  updateRebateStatus: (id, status, adminComment) => fetchJSON(`/rebates/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminComment }),
  }),

  // Billing
  getBilling: (studentId) => fetchJSON(`/billing${studentId ? `?studentId=${studentId}` : ''}`),
  generateBills: (month, year) => fetchJSON('/billing/generate', {
    method: 'POST',
    body: JSON.stringify({ month, year }),
  }),
  payBill: (id, paymentMethod) => fetchJSON(`/billing/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod }),
  }),

  // Feedback
  getFeedback: () => fetchJSON('/feedback'),
  submitFeedback: (feedbackData) => fetchJSON('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  }),
  respondFeedback: (id, adminResponse, status) => fetchJSON(`/feedback/${id}/respond`, {
    method: 'PUT',
    body: JSON.stringify({ adminResponse, status }),
  }),

  // Attendance
  getAttendance: () => fetchJSON('/attendance'),
  checkInMeal: (rollNo, mealType) => fetchJSON('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ rollNo, mealType }),
  }),

  // Notices
  getNotices: () => fetchJSON('/notices'),
  addNotice: (noticeData) => fetchJSON('/notices', {
    method: 'POST',
    body: JSON.stringify(noticeData),
  }),
  deleteNotice: (id) => fetchJSON(`/notices/${id}`, {
    method: 'DELETE',
  }),
};
