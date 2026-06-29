import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const getProducts = () => api.get('/products/');
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCustomers = () => api.get('/customers/');
export const createCustomer = (data) => api.post('/customers/', data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const getOrders = () => api.get('/orders/');
export const createOrder = (data) => api.post('/orders/', data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export default api;
