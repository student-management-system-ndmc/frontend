<template>
  <div class="subscriptions-view">
    <div class="page-header">
      <h1>Subscriptions Management</h1>
      <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
        {{ showCreateForm ? 'Hide Form' : 'Create New Subscription' }}
      </button>
    </div>

    <!-- Create Subscription Form -->
    <div v-if="showCreateForm" class="form-section">
      <div class="subscription-form">
        <h3>Create New Subscription</h3>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="student_id">Student <span class="required">*</span></label>
            <select id="student_id" v-model="form.student_id" required class="form-input">
              <option value="">Select student</option>
              <option
                v-for="student in studentsStore.students"
                :key="student.id"
                :value="student.id"
              >
                {{ student.name }} ({{ student.current_grade }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="package_name">Package Name <span class="required">*</span></label>
            <input
              id="package_name"
              v-model="form.package_name"
              type="text"
              required
              class="form-input"
              placeholder="e.g., Basic Package, Premium Package"
            />
          </div>

          <div class="form-group">
            <label for="start_date">Start Date <span class="required">*</span></label>
            <input
              id="start_date"
              v-model="form.start_date"
              type="date"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="end_date">End Date <span class="required">*</span></label>
            <input id="end_date" v-model="form.end_date" type="date" required class="form-input" />
          </div>

          <div class="form-group">
            <label for="total_sessions">Total Sessions <span class="required">*</span></label>
            <input
              id="total_sessions"
              v-model.number="form.total_sessions"
              type="number"
              required
              min="1"
              max="100"
              class="form-input"
              placeholder="Enter total number of sessions"
            />
          </div>

          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="resetForm"
              class="btn btn-secondary"
              :disabled="formLoading"
            >
              Reset
            </button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading || !isFormValid">
              {{ formLoading ? 'Creating...' : 'Create Subscription' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subscriptions List -->
    <div class="list-section">
      <div class="section-header">
        <h2>All Subscriptions</h2>
        <div class="filter-actions">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="not-started">Not Started</option>
          </select>
        </div>
      </div>

      <div v-if="subscriptionsStore.loading" class="loading">Loading subscriptions...</div>

      <div v-else-if="subscriptionsStore.error" class="error-message">
        {{ subscriptionsStore.error }}
        <button @click="refreshSubscriptions" class="btn btn-sm btn-primary">Try Again</button>
      </div>

      <div v-else-if="filteredSubscriptions.length === 0" class="empty-state">
        <p>No subscriptions found.</p>
        <button @click="showCreateForm = true" class="btn btn-primary">
          Create First Subscription
        </button>
      </div>

      <div v-else class="subscriptions-grid">
        <div
          v-for="subscription in filteredSubscriptions"
          :key="subscription.id"
          class="subscription-card"
        >
          <div class="subscription-header">
            <h3>{{ subscription.package_name }}</h3>
            <span class="subscription-status" :class="getSubscriptionStatusClass(subscription)">
              {{ getSubscriptionStatus(subscription) }}
            </span>
          </div>

          <div class="subscription-details">
            <div class="detail-item">
              <strong>Student:</strong>
              <span v-if="getStudentById(subscription.student_id)">
                {{ getStudentById(subscription.student_id)?.name }}
              </span>
              <span v-else class="text-muted">Loading...</span>
            </div>

            <div class="detail-item">
              <strong>Period:</strong> {{ formatDate(subscription.start_date) }} -
              {{ formatDate(subscription.end_date) }}
            </div>

            <div class="detail-item">
              <strong>Sessions:</strong> {{ subscription.used_sessions }}/{{
                subscription.total_sessions
              }}
            </div>

            <div class="progress-section">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: getProgressPercentage(subscription) + '%' }"
                ></div>
              </div>
              <span class="progress-text"
                >{{ getProgressPercentage(subscription) }}% completed</span
              >
            </div>
          </div>

          <div class="subscription-actions">
            <button
              v-if="
                subscription.used_sessions < subscription.total_sessions &&
                isSubscriptionActive(subscription)
              "
              @click="useSubscriptionSession(subscription.id)"
              class="btn btn-sm btn-warning"
              :disabled="usingSession === subscription.id"
            >
              {{ usingSession === subscription.id ? 'Using...' : 'Use Session' }}
            </button>

            <button
              @click="viewSubscriptionDetails(subscription.id)"
              class="btn btn-sm btn-secondary"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useStudentsStore } from '@/stores/students'
import type { CreateSubscriptionDto, Subscription } from '@/types'

// Route
const route = useRoute()
const router = useRouter()

// Stores
const subscriptionsStore = useSubscriptionsStore()
const studentsStore = useStudentsStore()

// State
const showCreateForm = ref(false)
const statusFilter = ref('')
const usingSession = ref(0)

// Form state
const form = ref<CreateSubscriptionDto>({
  student_id: 0,
  package_name: '',
  start_date: '',
  end_date: '',
  total_sessions: 10,
})

const formLoading = ref(false)
const formError = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  return (
    form.value.student_id > 0 &&
    form.value.package_name.trim() !== '' &&
    form.value.start_date !== '' &&
    form.value.end_date !== '' &&
    form.value.total_sessions > 0 &&
    new Date(form.value.end_date) > new Date(form.value.start_date)
  )
})

const getStudentById = computed(() => {
  return (id: number) => studentsStore.getStudentById(id)
})

const filteredSubscriptions = computed(() => {
  if (!statusFilter.value) return subscriptionsStore.subscriptions

  return subscriptionsStore.subscriptions.filter((subscription) => {
    const status = getSubscriptionStatus(subscription).toLowerCase().replace(' ', '-')
    return status === statusFilter.value
  })
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getSubscriptionStatus = (subscription: Subscription) => {
  const now = new Date()
  const startDate = new Date(subscription.start_date)
  const endDate = new Date(subscription.end_date)

  if (now < startDate) return 'Not Started'
  if (now > endDate) return 'Expired'
  if (subscription.used_sessions >= subscription.total_sessions) return 'Completed'
  return 'Active'
}

const getSubscriptionStatusClass = (subscription: Subscription) => {
  const status = getSubscriptionStatus(subscription)
  return {
    'status-active': status === 'Active',
    'status-completed': status === 'Completed',
    'status-expired': status === 'Expired',
    'status-not-started': status === 'Not Started',
  }
}

const getProgressPercentage = (subscription: Subscription) => {
  return Math.round((subscription.used_sessions / subscription.total_sessions) * 100)
}

const isSubscriptionActive = (subscription: Subscription) => {
  const now = new Date()
  const startDate = new Date(subscription.start_date)
  const endDate = new Date(subscription.end_date)

  return now >= startDate && now <= endDate
}

const refreshSubscriptions = async () => {
  await subscriptionsStore.fetchAllSubscriptions()
}

const resetForm = () => {
  form.value = {
    student_id: 0,
    package_name: '',
    start_date: '',
    end_date: '',
    total_sessions: 10,
  }
  formError.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  formLoading.value = true
  formError.value = null

  try {
    await subscriptionsStore.createSubscription(form.value)
    showCreateForm.value = false
    resetForm()
  } catch (err: unknown) {
    formError.value = (err as Error).message || 'Failed to create subscription'
  } finally {
    formLoading.value = false
  }
}

const useSubscriptionSession = async (subscriptionId: number) => {
  usingSession.value = subscriptionId

  try {
    await subscriptionsStore.useSession(subscriptionId)

    // Force refresh the entire subscriptions list to ensure reactivity
    await subscriptionsStore.fetchAllSubscriptions()
  } catch (error) {
    console.error('Error using session:', error)
  } finally {
    usingSession.value = 0
  }
}

const viewSubscriptionDetails = (subscriptionId: number) => {
  router.push(`/subscriptions/${subscriptionId}`)
}

// Load data on mount
onMounted(async () => {
  await Promise.all([subscriptionsStore.fetchAllSubscriptions(), studentsStore.fetchAllStudents()])

  // Check if student_id is provided in query params
  const studentId = route.query.student_id
  if (studentId) {
    form.value.student_id = parseInt(studentId as string)
    showCreateForm.value = true
  }
})
</script>

<style scoped>
.subscriptions-view {
  width: 100%;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-size: 2.5rem;
}

.form-section {
  margin-bottom: 40px;
}

.subscription-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subscription-form h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.required {
  color: #e74c3c;
}

.form-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #555;
  font-size: 1.8rem;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  background: #ffeaea;
  color: #e74c3c;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e74c3c;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.subscription-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.subscription-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.subscription-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.subscription-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-expired {
  background: #f8d7da;
  color: #721c24;
}

.status-not-started {
  background: #fff3cd;
  color: #856404;
}

.subscription-details {
  margin-bottom: 16px;
}

.detail-item {
  margin-bottom: 8px;
  color: #555;
  font-size: 0.95rem;
}

.detail-item strong {
  color: #333;
}

.text-muted {
  color: #999;
  font-style: italic;
}

.progress-section {
  margin-top: 12px;
}

.progress-bar {
  background: #e9ecef;
  border-radius: 4px;
  height: 8px;
  margin-bottom: 4px;
  overflow: hidden;
}

.progress-fill {
  background: #28a745;
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.subscription-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #e67e22;
}

@media (max-width: 768px) {
  .page-header,
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .subscriptions-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: center;
  }
}
</style>
