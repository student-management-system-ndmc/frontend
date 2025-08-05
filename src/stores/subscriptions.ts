import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription, CreateSubscriptionDto } from '@/types'
import { ApiService } from '@/services/api'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  // State
  const subscriptions = ref<Subscription[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getSubscriptionById = computed(() => {
    return (id: number) => subscriptions.value.find((sub) => sub.id === id)
  })

  const getSubscriptionsByStudent = computed(() => {
    return (studentId: number) => subscriptions.value.filter((sub) => sub.student_id === studentId)
  })

  const getActiveSubscriptions = computed(() => {
    const now = new Date()
    return subscriptions.value.filter((sub) => {
      const startDate = new Date(sub.start_date)
      const endDate = new Date(sub.end_date)
      return startDate <= now && now <= endDate && sub.used_sessions < sub.total_sessions
    })
  })

  // Actions
  const fetchAllSubscriptions = async () => {
    loading.value = true
    error.value = null
    try {
      subscriptions.value = await ApiService.getAllSubscriptions()
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch subscriptions'
      console.error('Error fetching subscriptions:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSubscription = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const subscription = await ApiService.getSubscription(id)

      // Update or add to subscriptions array
      const existingIndex = subscriptions.value.findIndex((s) => s.id === id)
      if (existingIndex >= 0) {
        subscriptions.value[existingIndex] = subscription
      } else {
        subscriptions.value.push(subscription)
      }

      return subscription
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch subscription'
      console.error('Error fetching subscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSubscriptionsByStudent = async (studentId: number) => {
    loading.value = true
    error.value = null
    try {
      const studentSubscriptions = await ApiService.getSubscriptionsByStudent(studentId)

      // Update subscriptions array
      studentSubscriptions.forEach((subscription) => {
        const existingIndex = subscriptions.value.findIndex((s) => s.id === subscription.id)
        if (existingIndex >= 0) {
          subscriptions.value[existingIndex] = subscription
        } else {
          subscriptions.value.push(subscription)
        }
      })

      return studentSubscriptions
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch student subscriptions'
      console.error('Error fetching student subscriptions:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSubscription = async (data: CreateSubscriptionDto) => {
    loading.value = true
    error.value = null
    try {
      const newSubscription = await ApiService.createSubscription(data)
      subscriptions.value.push(newSubscription)
      return newSubscription
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to create subscription'
      console.error('Error creating subscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const useSession = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const updatedSubscription = await ApiService.useSubscriptionSession(id)

      // Update in subscriptions array
      const existingIndex = subscriptions.value.findIndex((s) => s.id === id)
      if (existingIndex >= 0) {
        subscriptions.value[existingIndex] = updatedSubscription
      }

      return updatedSubscription
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to use subscription session'
      console.error('Error using subscription session:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const extendSessions = async (id: number, additionalSessions: number) => {
    loading.value = true
    error.value = null
    try {
      const updatedSubscription = await ApiService.extendSubscriptionSessions(
        id,
        additionalSessions,
      )

      // Update in subscriptions array
      const existingIndex = subscriptions.value.findIndex((s) => s.id === id)
      if (existingIndex >= 0) {
        subscriptions.value[existingIndex] = updatedSubscription
      }

      return updatedSubscription
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to extend subscription'
      console.error('Error extending subscription:', err)
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
    subscriptions,
    loading,
    error,

    // Getters
    getSubscriptionById,
    getSubscriptionsByStudent,
    getActiveSubscriptions,

    // Actions
    fetchAllSubscriptions,
    fetchSubscription,
    fetchSubscriptionsByStudent,
    createSubscription,
    useSession,
    extendSessions,
    clearError,
  }
})
