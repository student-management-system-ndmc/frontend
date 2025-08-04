import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Parent, CreateParentDto } from '@/types'
import { ApiService } from '@/services/api'

export const useParentsStore = defineStore('parents', () => {
  // State
  const parents = ref<Parent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getParentById = computed(() => {
    return (id: number) => parents.value.find((parent) => parent.id === id)
  })

  // Actions
  const fetchAllParents = async () => {
    loading.value = true
    error.value = null
    try {
      parents.value = await ApiService.getAllParents()
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch parents'
      console.error('Error fetching parents:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchParent = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const parent = await ApiService.getParent(id)

      // Update or add to parents array
      const existingIndex = parents.value.findIndex((p) => p.id === id)
      if (existingIndex >= 0) {
        parents.value[existingIndex] = parent
      } else {
        parents.value.push(parent)
      }

      return parent
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch parent'
      console.error('Error fetching parent:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createParent = async (data: CreateParentDto) => {
    loading.value = true
    error.value = null
    try {
      const newParent = await ApiService.createParent(data)
      parents.value.push(newParent)
      return newParent
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to create parent'
      console.error('Error creating parent:', err)
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
    parents,
    loading,
    error,

    // Getters
    getParentById,

    // Actions
    fetchAllParents,
    fetchParent,
    createParent,
    clearError,
  }
})
