import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tt_token');
      localStorage.removeItem('tt_user');
    }
    return Promise.reject(err);
  }
);

/* ── AUTH ── */
export const registerUser     = (data) => API.post('/auth/register', data);
export const loginUser        = (data) => API.post('/auth/login', data);
export const getMe            = ()     => API.get('/auth/me');
export const updateProfile    = (data) => API.put('/auth/profile', data);
export const changePassword   = (data) => API.put('/auth/password', data);

/* ── ADDRESS BOOK ── */
export const getAddresses        = ()           => API.get('/auth/addresses');
export const addAddress          = (data)       => API.post('/auth/addresses', data);
export const updateAddress       = (id, data)   => API.put(`/auth/addresses/${id}`, data);
export const deleteAddress       = (id)         => API.delete(`/auth/addresses/${id}`);
export const setDefaultAddress   = (id)         => API.patch(`/auth/addresses/${id}/default`);

/* ── PRODUCTS ── */
export const getProducts        = (params) => API.get('/products', { params });
export const getProduct         = (id)     => API.get(`/products/${id}`);
export const getFeaturedProducts= ()       => API.get('/products/featured');
export const getCategories      = ()       => API.get('/products/categories');
export const addReview          = (id, data) => API.post(`/products/${id}/reviews`, data);

/* ── CART ── */
export const getCart           = ()              => API.get('/cart');
export const addToCart         = (data)          => API.post('/cart', data);
export const updateCartItem    = (itemId, data)  => API.put(`/cart/${itemId}`, data);
export const removeFromCart    = (itemId)        => API.delete(`/cart/${itemId}`);
export const clearCart         = ()              => API.delete('/cart');

/* ── ORDERS ── */
export const createOrder          = (data) => API.post('/orders', data);
export const getMyOrders          = ()     => API.get('/orders/my');
export const getOrderById         = (id)   => API.get(`/orders/${id}`);
export const updateOrderPayment   = (id, data) => API.put(`/orders/${id}/pay`, data);

/* ── WISHLIST ── */
export const getWishlist      = ()          => API.get('/wishlist');
export const toggleWishlist   = (productId) => API.post(`/wishlist/${productId}`);

/* ── PAYMENT ── */
export const createRazorpayOrder   = (data) => API.post('/payment/razorpay/create', data);
export const verifyRazorpayPayment = (data) => API.post('/payment/razorpay/verify', data);
export const createStripeIntent    = (data) => API.post('/payment/stripe/intent', data);

/* ── ADMIN – Dashboard ── */
export const getAdminStats    = ()     => API.get('/admin/stats');
export const getAllUsers       = ()     => API.get('/admin/users');

/* ── ADMIN – Products ── */
export const createProduct  = (data)       => API.post('/admin/products', data);
export const updateProduct  = (id, data)   => API.put(`/admin/products/${id}`, data);
export const deleteProduct  = (id)         => API.delete(`/admin/products/${id}`);

/* ── ADMIN – Orders ── */
export const getAdminOrders         = (params)       => API.get('/admin/orders', { params });
export const getAdminOrderById      = (id)           => API.get(`/admin/orders/${id}`);
export const updateOrderStatus      = (id, data)     => API.put(`/admin/orders/${id}/status`, data);
export const updateShippingDetails  = (id, data)     => API.put(`/admin/orders/${id}/shipping`, data);

export default API;
