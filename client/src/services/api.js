function getAuthHeader() {
  const token = localStorage.getItem('bgc_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Server request failed');
  }
  return data;
}

function buildQueryString(params = {}) {
  const cleanParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'undefined' &&
      value !== 'null'
    ) {
      cleanParams[key] = value;
    }
  }
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `?${query}` : '';
}

export const api = {
  // Public APIs
  getProducts: (params = {}) => {
    return request(`/api/products${buildQueryString(params)}`);
  },
  getProduct: (slug) => request(`/api/products/${slug}`),
  getCategories: () => request('/api/categories'),
  getGallery: (category) => request(`/api/gallery${category ? `?category=${category}` : ''}`),
  getFaqs: () => request('/api/faqs'),
  getTestimonials: () => request('/api/testimonials'),
  getCms: () => request('/api/cms'),
  
  // Public Submissions
  submitOrderRequest: (data) => request('/api/order-requests', { method: 'POST', body: JSON.stringify(data) }),
  submitWholesaleRequest: (data) => request('/api/wholesale-requests', { method: 'POST', body: JSON.stringify(data) }),
  submitContact: (data) => request('/api/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Admin APIs
  getDashboardStats: () => request('/api/admin/dashboard/stats'),
  getAdminOrders: (params = {}) => {
    return request(`/api/order-requests/admin${buildQueryString(params)}`);
  },
  getAdminOrder: (id) => request(`/api/order-requests/admin/${id}`),
  updateAdminOrder: (id, data) => request(`/api/order-requests/admin/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAdminOrder: (id) => request(`/api/order-requests/admin/${id}`, { method: 'DELETE' }),

  getAdminWholesale: (params = {}) => {
    return request(`/api/wholesale-requests/admin${buildQueryString(params)}`);
  },
  updateAdminWholesale: (id, data) => request(`/api/wholesale-requests/admin/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAdminWholesale: (id) => request(`/api/wholesale-requests/admin/${id}`, { method: 'DELETE' }),

  getAdminMessages: () => request('/api/contact/admin'),
  updateAdminMessage: (id, data) => request(`/api/contact/admin/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAdminMessage: (id) => request(`/api/contact/admin/${id}`, { method: 'DELETE' }),

  getAdminProducts: () => request('/api/products/admin/all'),
  createAdminProduct: (data) => request('/api/products/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminProduct: (id, data) => request(`/api/products/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminProduct: (id) => request(`/api/products/admin/${id}`, { method: 'DELETE' }),

  createAdminCategory: (data) => request('/api/categories/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminCategory: (id, data) => request(`/api/categories/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminCategory: (id) => request(`/api/categories/admin/${id}`, { method: 'DELETE' }),

  createAdminFaq: (data) => request('/api/faqs/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminFaq: (id, data) => request(`/api/faqs/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminFaq: (id) => request(`/api/faqs/admin/${id}`, { method: 'DELETE' }),

  createAdminGallery: (data) => request('/api/gallery/admin', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminGallery: (id) => request(`/api/gallery/admin/${id}`, { method: 'DELETE' }),

  createAdminTestimonial: (data) => request('/api/testimonials/admin', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminTestimonial: (id) => request(`/api/testimonials/admin/${id}`, { method: 'DELETE' }),

  updateSiteSettings: (data) => request('/api/cms/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateCmsSection: (data) => request('/api/cms/admin/section', { method: 'PUT', body: JSON.stringify(data) }),

  getNotificationSettings: () => request('/api/notifications/settings'),
  updateNotificationSettings: (data) => request('/api/notifications/settings', { method: 'PUT', body: JSON.stringify(data) }),
  testNotification: (channel) => request('/api/notifications/test', { method: 'POST', body: JSON.stringify({ channel }) }),
  getNotificationLogs: () => request('/api/notifications/logs'),
  getUnreadNotifications: () => request('/api/notifications/unread'),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'PATCH' }),

  getMediaLibrary: () => request('/api/media'),
  deleteMedia: (id) => request(`/api/media/${id}`, { method: 'DELETE' }),
  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('bgc_admin_token');
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Failed to upload image from device');
    }
    return data;
  },
};
