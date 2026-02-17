const API_BASE = 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;       // must match backend 'name'
  email: string;
  password: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  specialization?: string;
  city?: string;
  country?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  role: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  city?: string;
  country?: string;
  specialization?: string;
  verificationStatus?: string;
}

export interface DashboardData {
  profile: Profile;
  sessionHistory?: any[];
  productOrders?: any[];
}

class ApiService {
  get baseURL() {
    return API_BASE;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Registration failed');
    }
    return response.json();
  }

  async getProfile(): Promise<Profile> {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    const response = await fetch(`${API_BASE}/user/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }

  async uploadDegree(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/user/uploadDegree`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload degree');
    return response.text();
  }
}

export const api = new ApiService();
