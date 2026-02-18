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
export interface AuthResponse { accessToken: string; role: string }
export interface Profile {
  id: number
  name: string
  email: string
  role: string
  city?: string
  country?: string
  specialization?: string
  verificationStatus?: string
  degreeFile?: string
  verified?: boolean
}

export interface Booking {
  id?: number
  userId: number
  practitionerId: number
  bookingDate?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  notes?: string
}

const apiClient = axios.create({ baseURL: API_BASE, withCredentials: true })

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
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
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data)
    localStorage.setItem('accessToken', response.data.accessToken)
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
    const response = await apiClient.get('/admin/practitioners')
    return response.data
  },

  async approvePractitioner(id: number) { await apiClient.put(`/admin/approve/${id}`) },
  async rejectPractitioner(id: number) { await apiClient.put(`/admin/reject/${id}`) },

  // Bookings
  async createBooking(data: Booking): Promise<Booking> {
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

  async getAllPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/practitioners')
    return response.data
  }
}
