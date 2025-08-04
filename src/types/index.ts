// API Response types
export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

// Error type for catch blocks
export interface ApiError {
  message: string
  status?: number
}

// Entity types based on backend entities
export interface Parent {
  id: number
  name: string
  phone: string
  email: string
  students?: Student[]
}

export interface Student {
  id: number
  name: string
  dob: string // Date as string from API
  gender: string
  current_grade: string
  parent_id: number
  parent?: Parent
  classRegistrations?: ClassRegistration[]
  subscriptions?: Subscription[]
}

export interface Class {
  id: number
  name: string
  subject: string
  day_of_week: string
  time_slot: string
  teacher_name: string
  max_students: number
  registrations?: ClassRegistration[]
}

export interface ClassRegistration {
  id: number
  class_id: number
  student_id: number
  class?: Class
  student?: Student
}

export interface Subscription {
  id: number
  student_id: number
  package_name: string
  start_date: string
  end_date: string
  total_sessions: number
  used_sessions: number
  student?: Student
}

// DTO types for creating/updating
export interface CreateParentDto {
  name: string
  phone: string
  email: string
}

export interface CreateStudentDto {
  name: string
  dob: string
  gender: string
  current_grade: string
  parent_id: number
}

export interface CreateClassDto {
  name: string
  subject: string
  day_of_week: string
  time_slot: string
  teacher_name: string
  max_students: number
}

export interface CreateSubscriptionDto {
  student_id: number
  package_name: string
  start_date: string
  end_date: string
  total_sessions: number
}

export interface RegisterClassDto {
  student_id: number
}

// Days of week for schedule
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]
