import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

console.log('🔧 API Client initialized with baseURL:', API_URL)

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
})

// Generate unique session key for tracking
function getOrCreateSessionKey(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    let sessionKey = localStorage.getItem('session_key');
    if (!sessionKey) {
      // Generate unique session key: timestamp + random string
      sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_key', sessionKey);
      console.log('🆕 Generated new session key:', sessionKey.substring(0, 20) + '...')
    }
    return sessionKey;
  } catch (error) {
    console.error('❌ Failed to access localStorage:', error)
    return ''
  }
}

// Request interceptor - add token and session key to headers
client.interceptors.request.use((config) => {
  // Only log non-routine requests for debugging
  const isRoutineRequest = config.url?.includes('/view/') || config.url?.includes('/endorse/')
  if (!isRoutineRequest) {
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url)
  }
  
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Add session key for view tracking
      const sessionKey = getOrCreateSessionKey();
      if (sessionKey) {
        config.headers = config.headers || {}
        config.headers['X-Session-Key'] = sessionKey;
      }
    } catch (error) {
      console.warn('⚠️ Interceptor warning:', error)
      // Continue anyway
    }
  }
  
  return config
}, (error) => {
  console.error('❌ Request interceptor error:', error)
  return Promise.reject(error)
})

// Response interceptor - handle token refresh
client.interceptors.response.use(
  response => {
    // Only log non-routine successful responses
    const isRoutineRequest = response.config.url?.includes('/view/') || response.config.url?.includes('/endorse/')
    if (!isRoutineRequest) {
      console.log('✅ Response:', response.status, response.config.url)
    }
    return response
  },
  async error => {
    const url = error.config?.url || 'unknown'
    const status = error.response?.status
    
    // Only log unexpected errors (not 400/401 for known endpoints)
    const isExpectedError = (
      (status === 400 || status === 401) && 
      (url.includes('/view/') || url.includes('/endorse/'))
    )
    
    if (!isExpectedError) {
      console.error('❌ Response error:', error.message, url)
    }
    
    const originalRequest = error.config;
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accounts/token/refresh/`,
          { refresh: refreshToken }
        );
        
        // Update access token
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        // Retry original request
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default client