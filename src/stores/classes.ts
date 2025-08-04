import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Class, CreateClassDto, RegisterClassDto, DayOfWeek } from '@/types'
import { ApiService } from '@/services/api'

export const useClassesStore = defineStore('classes', () => {
  // State
  const classes = ref<Class[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getClassById = computed(() => {
    return (id: number) => classes.value.find((cls) => cls.id === id)
  })

  const getClassesByDay = computed(() => {
    return (day: DayOfWeek) => classes.value.filter((cls) => cls.day_of_week === day)
  })

  const getClassesGroupedByDay = computed(() => {
    const grouped: Record<string, Class[]> = {}
    classes.value.forEach((cls) => {
      if (!grouped[cls.day_of_week]) {
        grouped[cls.day_of_week] = []
      }
      grouped[cls.day_of_week].push(cls)
    })
    return grouped
  })

  // Actions
  const fetchAllClasses = async () => {
    loading.value = true
    error.value = null
    try {
      classes.value = await ApiService.getAllClasses()
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch classes'
      console.error('Error fetching classes:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchClassesByDay = async (day: string) => {
    loading.value = true
    error.value = null
    try {
      const dayClasses = await ApiService.getClassesByDay(day)

      // Update classes array with day-specific classes
      dayClasses.forEach((dayClass) => {
        const existingIndex = classes.value.findIndex((c) => c.id === dayClass.id)
        if (existingIndex >= 0) {
          classes.value[existingIndex] = dayClass
        } else {
          classes.value.push(dayClass)
        }
      })

      return dayClasses
    } catch (err: unknown) {
      error.value = (err as Error).message || `Failed to fetch classes for ${day}`
      console.error('Error fetching classes by day:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchClass = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const classItem = await ApiService.getClass(id)

      // Update or add to classes array
      const existingIndex = classes.value.findIndex((c) => c.id === id)
      if (existingIndex >= 0) {
        classes.value[existingIndex] = classItem
      } else {
        classes.value.push(classItem)
      }

      return classItem
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch class'
      console.error('Error fetching class:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createClass = async (data: CreateClassDto) => {
    loading.value = true
    error.value = null
    try {
      const newClass = await ApiService.createClass(data)
      classes.value.push(newClass)
      return newClass
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to create class'
      console.error('Error creating class:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerStudentToClass = async (classId: number, data: RegisterClassDto) => {
    loading.value = true
    error.value = null
    try {
      const result = await ApiService.registerStudentToClass(classId, data)

      // Optionally refresh the class data to get updated registrations
      await fetchClass(classId)

      return result
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to register student to class'
      console.error('Error registering student to class:', err)
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
    classes,
    loading,
    error,

    // Getters
    getClassById,
    getClassesByDay,
    getClassesGroupedByDay,

    // Actions
    fetchAllClasses,
    fetchClassesByDay,
    fetchClass,
    createClass,
    registerStudentToClass,
    clearError,
  }
})
