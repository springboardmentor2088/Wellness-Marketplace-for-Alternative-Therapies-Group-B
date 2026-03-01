import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const API_BASE = 'http://localhost:8080/api'

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN'
  specialization?: string
  city?: string
  country?: string
}
export interface AuthResponse {
  accessToken: string;
  role: string;
  name: string;
  emailVerified: boolean;
}
export interface Profile {
  id: number
  name: string
  email: string
  password?: string
  role: string
  city?: string
  country?: string
  specialization?: string
  verificationStatus?: string
  degreeFile?: string
  verified?: boolean
  emailVerified: boolean
  adminComment?: string
  sessionFee?: number
  profileImage?: string
}

export interface UserDTO {
  id: number;
  fullName: string;
  specialization: string;
  profileImage: string;
}

export interface Booking {
  id: number
  userId: number
  clientName?: string
  clientEmail?: string
  bookingDate: string
  startTime?: string
  duration?: number
  notes?: string
  practitionerComment?: string
  status: string
  sessionFee?: number
  practitioner?: UserDTO
}

export interface BookingRequest {
  userId: number
  practitionerId: number
  bookingDate?: string
  notes?: string
}

export interface Product {
  productId?: number
  name: string
  description: string
  price: number
  imageUrl?: string
  providerId: number
  createdAt?: string
}

export interface OrderRequest {
  productId: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  orderId: number
  productName: string
  productImage: string
  price: number
  quantity: number
  totalAmount: number
  orderDate: string
  deliveryDate: string
  deliveryStatus: string
  status: string
}

export interface PractitionerStats {
  totalOrders: number;
  totalProductsSold: number;
  totalRevenue: number;
  monthlyRevenue: Record<string, number>;
}

export interface SessionBooking {
  id?: number
  clientId: number
  clientName?: string
  clientEmail?: string
  providerId: number
  providerName?: string
  providerSpecialization?: string
  providerProfileImage?: string
  sessionDate: string
  startTime: string
  endTime: string
  duration: number
  issueDescription: string
  status: 'PENDING' | 'ACCEPTED' | 'RESCHEDULE_REQUESTED' | 'REJECTED' | 'COMPLETED'
  providerMessage?: string
  reminderSent?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Notification {
  id: number
  type: 'BOOKING_REQUEST' | 'SESSION_CONFIRMED' | 'SESSION_REJECTED' | 'SESSION_RESCHEDULE_SUGGESTED' | 'SESSION_REMINDER'
  message: string
  read: boolean
  relatedBookingId?: number
  createdAt: string
}

export interface PractitionerAnalytics {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  allTimeRevenue: number;

  dailyGrowthPercent: number;
  weeklyGrowthPercent: number;
  monthlyGrowthPercent: number;
  yearlyGrowthPercent: number;

  sessionRevenueDaily: number;
  productRevenueDaily: number;
  sessionRevenueMonthly: number;
  productRevenueMonthly: number;
  sessionRevenueAllTime: number;
  productRevenueAllTime: number;

  totalSessionRevenue: number;
  totalProductRevenue: number;
  accumulatedRevenue: number;
}

export interface PatientAnalytics {
  sessionsAttended: number;
  totalSessionSpent: number;
  totalProductSpent: number;
  totalSpent: number;

  monthlySpent: number;
  yearlySpent: number;

  recentSessions: Booking[];
  recentOrders: Order[];
}

const apiClient = axios.create({ baseURL: API_BASE, withCredentials: true })

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const publicPaths = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/resend-otp', '/auth/forgot-password']
    const isPublic = publicPaths.some(path => config.url?.endsWith(path))

    if (!isPublic) {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const publicPaths = ['/auth/', '/degree/']
    const isPublic = publicPaths.some(path => error.config?.url?.includes(path))

    if (!isPublic && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('emailVerified', String(response.data.emailVerified))
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('emailVerified', String(response.data.emailVerified))
    return response.data
  },

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get('/user/profile')
    return response.data
  },

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await apiClient.put('/user/profile', data)
    return response.data
  },

  async uploadDegree(file: File, userId: number) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId.toString())
    const response = await apiClient.post('/degree/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  async getAllUsers(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/all-users')
    return response.data
  },

  async approvePractitioner(id: number) { await apiClient.put(`/admin/approve/${id}`) },
  async rejectPractitioner(id: number) { await apiClient.put(`/admin/reject/${id}`) },

  // Bookings
  async createBooking(data: BookingRequest): Promise<Booking> {
    const response = await apiClient.post('/bookings', data)
    return response.data
  },

  async getUserBookings(userId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/user/${userId}`)
    return response.data
  },

  async getPractitionerBookings(practitionerId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/practitioner/${practitionerId}`)
    return response.data
  },

  async acceptBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/accept`)
    return response.data
  },

  async rejectBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/reject`)
    return response.data
  },

  async rescheduleBooking(id: number, data: { newSessionDate?: string, newStartTime?: string }): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/reschedule`, data)
    return response.data
  },

  async completeBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/complete`)
    return response.data
  },

  async cancelBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/cancel`)
    return response.data
  },

  async acceptRescheduleBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/accept-reschedule`)
    return response.data
  },

  async getAllPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/user/all-practitioners')
    return response.data
  },

  async getApprovedPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/user/practitioners')
    return response.data
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products')
    return response.data
  },

  async getProviderProducts(providerId: number): Promise<Product[]> {
    const response = await apiClient.get(`/products/provider/${providerId}`)
    return response.data
  },

  async createProduct(data: FormData): Promise<Product> {
    const response = await apiClient.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async updateProduct(id: number, data: FormData): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteProduct(id: number, providerId: number) {
    await apiClient.delete(`/products/${id}?providerId=${providerId}`)
  },

  // Orders
  async createOrder(data: OrderRequest): Promise<Order> {
    const response = await apiClient.post('/orders', data)
    return response.data
  },

  async getUserOrders(userId: number): Promise<Order[]> {
    const response = await apiClient.get(`/orders/user/${userId}`)
    return response.data
  },

  async getProviderOrders(providerId: number): Promise<Order[]> {
    const response = await apiClient.get(`/orders/provider/${providerId}`)
    return response.data
  },

  async getPractitionerStats(providerId: number): Promise<PractitionerStats> {
    const response = await apiClient.get(`/orders/practitioner/${providerId}/stats`)
    return response.data
  },

  // Sessions (Smart Booking)
  async bookSession(data: {
    providerId: number
    sessionDate: string
    startTime: string
    endTime: string
    duration: number
    issueDescription: string
  }): Promise<SessionBooking> {
    const response = await apiClient.post('/sessions/book', data)
    return response.data
  },

  async getProviderSessions(providerId: number): Promise<SessionBooking[]> {
    const response = await apiClient.get(`/sessions/provider/${providerId}`)
    return response.data
  },

  async getClientSessions(clientId: number): Promise<SessionBooking[]> {
    const response = await apiClient.get(`/sessions/client/${clientId}`)
    return response.data
  },

  async acceptSession(id: number, providerMessage?: string): Promise<SessionBooking> {
    const response = await apiClient.put(`/sessions/${id}/accept`, { providerMessage })
    return response.data
  },

  async rescheduleSession(id: number, data: {
    newSessionDate?: string
    newStartTime?: string
    newEndTime?: string
    providerMessage: string
  }): Promise<SessionBooking> {
    const response = await apiClient.put(`/sessions/${id}/reschedule`, data)
    return response.data
  },

  async rejectSession(id: number, providerMessage?: string): Promise<SessionBooking> {
    const response = await apiClient.put(`/sessions/${id}/reject`, { providerMessage })
    return response.data
  },

  async confirmReschedule(id: number): Promise<SessionBooking> {
    const response = await apiClient.put(`/sessions/${id}/confirm-reschedule`)
    return response.data
  },

  async getUpcomingSessionReminders(): Promise<SessionBooking[]> {
    const response = await apiClient.get('/sessions/upcoming-reminders')
    return response.data
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications')
    return response.data
  },

  async markNotificationRead(id: number): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`)
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.get(`/auth/verify?token=${token}`)
    return response.data
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/verify-otp', { email, otp })
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('emailVerified', String(response.data.emailVerified))
    return response.data
  },

  async resendOtp(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/resend-otp', { email })
    return response.data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  // Analytics
  async getPractitionerAnalytics(id: number): Promise<PractitionerAnalytics> {
    const response = await apiClient.get(`/analytics/practitioner/${id}`)
    return response.data
  },

  async getPatientAnalytics(id: number): Promise<PatientAnalytics> {
    const response = await apiClient.get(`/analytics/patient/${id}`)
    return response.data
  }
}
