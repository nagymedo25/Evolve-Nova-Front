import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const registerUser = (userData) => apiClient.post('/auth/register', userData); 
export const logoutUser = () => apiClient.post('/auth/logout');
export const getUserProfile = () => apiClient.get('/auth/profile');
export const updateUserProfile = (userData) => apiClient.put('/auth/profile', userData);
export const changePassword = (passwords) => apiClient.put('/auth/change-password', passwords); 

export const getAllCourses = (params) => apiClient.get('/courses', { params }); 
export const getCourseById = (courseId) => apiClient.get(`/courses/${courseId}`);

export const getCourseLessons = (courseId) => apiClient.get(`/courses/${courseId}/lessons`);
export const getLessonById = (courseId, lessonId) => apiClient.get(`/courses/${courseId}/lessons/${lessonId}`); 

export const getCourseReviews = (courseId) => apiClient.get(`/courses/${courseId}/reviews`);
export const submitReview = (courseId, reviewData) => apiClient.post(`/courses/${courseId}/reviews`, reviewData);

export const getMyPayments = () => apiClient.get('/payments/my-payments');
export const submitPayment = (formData) => apiClient.post('/payments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
});

export const createCourse = (courseData) => apiClient.post('/courses', courseData); 
export const updateCourse = (courseId, courseData) => apiClient.put(`/courses/${courseId}`, courseData); 
export const deleteCourse = (courseId) => apiClient.delete(`/courses/${courseId}`); 
export const addLesson = (courseId, lessonData) => apiClient.post(`/courses/${courseId}/lessons`, lessonData); 
export const updateLesson = (lessonId, lessonData) => apiClient.put(`/courses/lessons/${lessonId}`, lessonData); 
export const deleteLesson = (lessonId) => apiClient.delete(`/courses/lessons/${lessonId}`); 
export const getAdminCourseLessons = (courseId) => apiClient.get(`/courses/${courseId}/lessons-admin`);

export const getPendingPayments = () => apiClient.get('/payments/pending'); 
export const approvePayment = (paymentId) => apiClient.put(`/payments/${paymentId}/approve`);
export const rejectPayment = (paymentId) => apiClient.put(`/payments/${paymentId}/reject`); 
export const getAllPaymentsAdmin = (params) => apiClient.get('/payments', { params }); 
export const deletePaymentAdmin = (paymentId) => apiClient.delete(`/payments/${paymentId}`); 

export const getAllUsersAdmin = (params) => apiClient.get('/admin/users', { params });
export const searchUsersAdmin = (query) => apiClient.get('/admin/users/search', { params: { q: query } });
export const getUserDetailsAdmin = (userId) => apiClient.get(`/admin/users/${userId}`);
export const updateUserAdmin = (userId, userData) => apiClient.put(`/admin/users/${userId}`, userData);
export const updateUserStatusAdmin = (userId, status) => apiClient.patch(`/admin/users/${userId}/status`, { status });
export const deleteUserAdmin = (userId) => apiClient.delete(`/admin/users/${userId}`); 
export const getDashboardStatsAdmin = () => apiClient.get('/admin/dashboard'); 
export const resetPaymentsAdmin = () => apiClient.delete('/admin/payments/reset'); 


export default apiClient;