import axios, { type AxiosResponse } from 'axios'
import type {
  Parent,
  Student,
  Class,
  Subscription,
  CreateParentDto,
  CreateStudentDto,
  CreateClassDto,
  CreateSubscriptionDto,
  RegisterClassDto,
} from '@/types'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// API service class for all endpoints
export class ApiService {
  // Parents API
  static async createParent(data: CreateParentDto): Promise<Parent> {
    const response: AxiosResponse<Parent> = await api.post('/api/parents', data)
    return response.data
  }

  static async getParent(id: number): Promise<Parent> {
    const response: AxiosResponse<Parent> = await api.get(`/api/parents/${id}`)
    return response.data
  }

  static async getAllParents(): Promise<Parent[]> {
    const response: AxiosResponse<Parent[]> = await api.get('/api/parents')
    return response.data
  }

  // Students API
  static async createStudent(data: CreateStudentDto): Promise<Student> {
    const response: AxiosResponse<Student> = await api.post('/api/students', data)
    return response.data
  }

  static async getStudent(id: number): Promise<Student> {
    const response: AxiosResponse<Student> = await api.get(`/api/students/${id}`)
    return response.data
  }

  static async getAllStudents(): Promise<Student[]> {
    const response: AxiosResponse<Student[]> = await api.get('/api/students')
    return response.data
  }

  // Classes API
  static async createClass(data: CreateClassDto): Promise<Class> {
    const response: AxiosResponse<Class> = await api.post('/api/classes', data)
    return response.data
  }

  static async getClass(id: number): Promise<Class> {
    const response: AxiosResponse<Class> = await api.get(`/api/classes/${id}`)
    return response.data
  }

  static async getAllClasses(): Promise<Class[]> {
    const response: AxiosResponse<Class[]> = await api.get('/api/classes')
    return response.data
  }

  static async getClassesByDay(day: string): Promise<Class[]> {
    const response: AxiosResponse<Class[]> = await api.get(`/api/classes?day=${day}`)
    return response.data
  }

  static async registerStudentToClass(classId: number, data: RegisterClassDto): Promise<unknown> {
    const response = await api.post(`/api/classes/${classId}/register`, data)
    return response.data
  }

  // Subscriptions API
  static async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    const response: AxiosResponse<Subscription> = await api.post('/api/subscriptions', data)
    return response.data
  }

  static async getSubscription(id: number): Promise<Subscription> {
    const response: AxiosResponse<Subscription> = await api.get(`/api/subscriptions/${id}`)
    return response.data
  }

  static async getAllSubscriptions(): Promise<Subscription[]> {
    const response: AxiosResponse<Subscription[]> = await api.get('/api/subscriptions')
    return response.data
  }

  static async getSubscriptionsByStudent(studentId: number): Promise<Subscription[]> {
    const response: AxiosResponse<Subscription[]> = await api.get(
      `/api/subscriptions/student/${studentId}`,
    )
    return response.data
  }

  static async useSubscriptionSession(id: number): Promise<Subscription> {
    const response: AxiosResponse<Subscription> = await api.patch(`/api/subscriptions/${id}/use`)
    return response.data
  }
}

export default ApiService
