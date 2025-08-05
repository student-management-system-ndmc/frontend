<template>
  <div class="student-detail-view">
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">← Back</button>
        <h1 v-if="student">{{ student.name }}</h1>
        <h1 v-else>Student Details</h1>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading student details...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchStudentData" class="btn btn-sm btn-primary">Try Again</button>
    </div>

    <div v-else-if="student" class="student-details">
      <!-- Basic Information -->
      <div class="info-card">
        <h2>Basic Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Full Name</label>
            <span>{{ student.name }}</span>
          </div>
          <div class="info-item">
            <label>Date of Birth</label>
            <span>{{ formatDate(student.dob) }}</span>
          </div>
          <div class="info-item">
            <label>Age</label>
            <span>{{ calculateAge(student.dob) }} years old</span>
          </div>
          <div class="info-item">
            <label>Gender</label>
            <span>{{ student.gender }}</span>
          </div>
          <div class="info-item">
            <label>Current Grade</label>
            <span>{{ student.current_grade }}</span>
          </div>
          <div class="info-item">
            <label>Student ID</label>
            <span>#{{ student.id }}</span>
          </div>
        </div>
      </div>

      <!-- Parent Information -->
      <div class="info-card">
        <h2>Parent Information</h2>
        <div v-if="parent" class="parent-info">
          <div class="info-grid">
            <div class="info-item">
              <label>Parent Name</label>
              <span>{{ parent.name }}</span>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <span>{{ parent.phone }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ parent.email }}</span>
            </div>
          </div>
        </div>
        <div v-else class="loading">Loading parent information...</div>
      </div>

      <!-- Subscriptions -->
      <div class="info-card">
        <div class="card-header">
          <h2>Subscriptions</h2>
          <button @click="createNewSubscription" class="btn btn-primary">Add Subscription</button>
        </div>

        <div v-if="loadingSubscriptions" class="loading">Loading subscriptions...</div>

        <div v-else-if="subscriptions.length === 0" class="empty-state">
          <p>No subscriptions found for this student.</p>
          <button @click="createNewSubscription" class="btn btn-primary">
            Create First Subscription
          </button>
        </div>

        <div v-else class="subscriptions-list">
          <div
            v-for="subscription in subscriptions"
            :key="subscription.id"
            class="subscription-item"
          >
            <div class="subscription-header">
              <h3>{{ subscription.package_name }}</h3>
              <span class="subscription-status" :class="getSubscriptionStatusClass(subscription)">
                {{ getSubscriptionStatus(subscription) }}
              </span>
            </div>

            <div class="subscription-details">
              <div class="detail-row">
                <span
                  ><strong>Period:</strong> {{ formatDate(subscription.start_date) }} -
                  {{ formatDate(subscription.end_date) }}</span
                >
              </div>
              <div class="detail-row">
                <span
                  ><strong>Sessions:</strong> {{ subscription.used_sessions }}/{{
                    subscription.total_sessions
                  }}</span
                >
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
                @click="viewSubscriptionDetails(subscription.id)"
                class="btn btn-sm btn-secondary"
              >
                View Details
              </button>
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
            </div>
          </div>
        </div>
      </div>

      <!-- Class Registrations -->
      <div class="info-card">
        <div class="card-header">
          <h2>Class Registrations</h2>
          <button @click="registerToClass" class="btn btn-primary">Register to Class</button>
        </div>

        <div v-if="loadingClasses" class="loading">Loading class registrations...</div>

        <div v-else-if="studentClasses.length === 0" class="empty-state">
          <p>This student is not registered to any classes.</p>
          <button @click="registerToClass" class="btn btn-primary">Register to First Class</button>
        </div>

        <div v-else class="classes-list">
          <div v-for="classItem in studentClasses" :key="classItem.id" class="class-item">
            <div class="class-header">
              <h3>{{ classItem.name }}</h3>
              <span class="class-subject">{{ classItem.subject }}</span>
            </div>

            <div class="class-details">
              <div class="detail-row">
                <span><strong>Teacher:</strong> {{ classItem.teacher_name }}</span>
              </div>
              <div class="detail-row">
                <span
                  ><strong>Schedule:</strong> {{ classItem.day_of_week }} at
                  {{ classItem.time_slot }}</span
                >
              </div>
              <div class="detail-row">
                <span><strong>Capacity:</strong> {{ classItem.max_students }} students max</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-message">Student not found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useParentsStore } from '@/stores/parents'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useClassesStore } from '@/stores/classes'
import type { Student, Parent, Subscription, Class } from '@/types'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const studentsStore = useStudentsStore()
const parentsStore = useParentsStore()
const subscriptionsStore = useSubscriptionsStore()
const classesStore = useClassesStore()

// State
const student = ref<Student | null>(null)
const parent = ref<Parent | null>(null)
const subscriptions = ref<Subscription[]>([])
const studentClasses = ref<Class[]>([])

const loading = ref(false)
const loadingSubscriptions = ref(false)
const loadingClasses = ref(false)
const error = ref<string | null>(null)
const usingSession = ref(0)

// Computed
const studentId = computed(() => {
  return parseInt(route.params.id as string)
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const calculateAge = (dateString: string) => {
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
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

const fetchStudentData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch student details
    student.value = await studentsStore.fetchStudent(studentId.value)

    // Fetch parent information
    if (student.value.parent_id) {
      parent.value = await parentsStore.fetchParent(student.value.parent_id)
    }

    // Fetch subscriptions
    await fetchSubscriptions()

    // TODO: Fetch class registrations (need backend API endpoint)
    await fetchClassRegistrations()
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to load student details'
    console.error('Error fetching student data:', err)
  } finally {
    loading.value = false
  }
}

const fetchSubscriptions = async () => {
  loadingSubscriptions.value = true
  try {
    subscriptions.value = await subscriptionsStore.fetchSubscriptionsByStudent(studentId.value)
  } catch (err: unknown) {
    console.error('Error fetching subscriptions:', err)
  } finally {
    loadingSubscriptions.value = false
  }
}

const fetchClassRegistrations = async () => {
  loadingClasses.value = true
  try {
    // For now, just get all classes and filter by registrations
    // In a real app, you'd have a specific API endpoint for student's classes
    await classesStore.fetchAllClasses()
    studentClasses.value = [] // TODO: Filter classes where student is registered
  } catch (err: unknown) {
    console.error('Error fetching class registrations:', err)
  } finally {
    loadingClasses.value = false
  }
}

const useSubscriptionSession = async (subscriptionId: number) => {
  usingSession.value = subscriptionId

  try {
    const updatedSubscription = await subscriptionsStore.useSession(subscriptionId)

    // Force reactive update using array replacement
    const index = subscriptions.value.findIndex((s) => s.id === subscriptionId)
    if (index >= 0) {
      // Create new array to trigger reactivity
      subscriptions.value = [
        ...subscriptions.value.slice(0, index),
        updatedSubscription,
        ...subscriptions.value.slice(index + 1),
      ]
    }
  } catch (error) {
    console.error('Error using session:', error)
  } finally {
    usingSession.value = 0
  }
}

const viewSubscriptionDetails = (subscriptionId: number) => {
  router.push(`/subscriptions/${subscriptionId}`)
}

const createNewSubscription = () => {
  router.push(`/subscriptions?student_id=${studentId.value}`)
}

const registerToClass = () => {
  router.push('/classes')
}

const goBack = () => {
  router.go(-1)
}

// Load data on mount
onMounted(() => {
  fetchStudentData()
})
</script>

<style scoped>
.student-detail-view {
  width: 100%;
  padding: 0;
}

.page-header {
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  margin: 0;
  color: #333;
  font-size: 2.5rem;
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

.student-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.info-item span {
  font-size: 16px;
  color: #333;
}

.parent-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.subscriptions-list,
.classes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subscription-item,
.class-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
}

.subscription-header,
.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subscription-header h3,
.class-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.subscription-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.class-subject {
  background: #e3f2fd;
  color: #1976d2;
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

.subscription-details,
.class-details {
  margin-bottom: 12px;
}

.detail-row {
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
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
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left h1 {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .subscription-header,
  .class-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
