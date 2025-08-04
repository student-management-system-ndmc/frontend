import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Student, CreateStudentDto } from '@/types'
import { ApiService } from '@/services/api'

export const useStudentsStore = defineStore('students', () => {
  // State
  const students = ref<Student[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getStudentById = computed(() => {
    return (id: number) => students.value.find((student) => student.id === id)
  })

  const getStudentsByParent = computed(() => {
    return (parentId: number) => students.value.filter((student) => student.parent_id === parentId)
  })

  // Actions
  const fetchAllStudents = async () => {
    loading.value = true
    error.value = null
    try {
      students.value = await ApiService.getAllStudents()
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch students'
      console.error('Error fetching students:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchStudent = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const student = await ApiService.getStudent(id)

      // Update or add to students array
      const existingIndex = students.value.findIndex((s) => s.id === id)
      if (existingIndex >= 0) {
        students.value[existingIndex] = student
      } else {
        students.value.push(student)
      }

      return student
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch student'
      console.error('Error fetching student:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createStudent = async (data: CreateStudentDto) => {
    loading.value = true
    error.value = null
    try {
      const newStudent = await ApiService.createStudent(data)
      students.value.push(newStudent)
      return newStudent
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to create student'
      console.error('Error creating student:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    students,
    loading,
    error,

    // Getters
    getStudentById,
    getStudentsByParent,

    // Actions
    fetchAllStudents,
    fetchStudent,
    createStudent,
    clearError,
  }
})
