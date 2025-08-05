<template>
  <div class="subscription-detail-view">
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">← Back</button>
        <h1 v-if="subscription">{{ subscription.package_name }}</h1>
        <h1 v-else>Subscription Details</h1>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading subscription details...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchSubscriptionData" class="btn btn-sm btn-primary">Try Again</button>
    </div>

    <div v-else-if="subscription" class="subscription-details">
      <!-- Subscription Overview -->
      <div class="info-card">
        <div class="card-header">
          <h2>Subscription Overview</h2>
          <span class="subscription-status" :class="getSubscriptionStatusClass(subscription)">
            {{ getSubscriptionStatus(subscription) }}
          </span>
        </div>

        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-icon">📦</div>
            <div class="overview-content">
              <h3>{{ subscription.package_name }}</h3>
              <p>Package Name</p>
            </div>
          </div>

          <div class="overview-item">
            <div class="overview-icon">🎓</div>
            <div class="overview-content">
              <h3>{{ student?.name || 'Loading...' }}</h3>
              <p>Student</p>
            </div>
          </div>

          <div class="overview-item">
            <div class="overview-icon">📅</div>
            <div class="overview-content">
              <h3>{{ formatDateRange(subscription.start_date, subscription.end_date) }}</h3>
              <p>Subscription Period</p>
            </div>
          </div>

          <div class="overview-item">
            <div class="overview-icon">📊</div>
            <div class="overview-content">
              <h3>{{ subscription.used_sessions }}/{{ subscription.total_sessions }}</h3>
              <p>Sessions Used</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Details -->
      <div class="info-card">
        <h2>Progress Details</h2>

        <div class="progress-overview">
          <div class="progress-circle">
            <svg class="progress-ring" width="120" height="120">
              <circle
                class="progress-ring-background"
                cx="60"
                cy="60"
                r="52"
                fill="transparent"
                stroke="#e9ecef"
                stroke-width="8"
              />
              <circle
                class="progress-ring-progress"
                cx="60"
                cy="60"
                r="52"
                fill="transparent"
                stroke="#28a745"
                stroke-width="8"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-percentage">{{ getProgressPercentage(subscription) }}%</span>
              <span class="progress-label">Complete</span>
            </div>
          </div>

          <div class="progress-stats">
            <div class="stat">
              <div class="stat-value">{{ subscription.used_sessions }}</div>
              <div class="stat-label">Sessions Used</div>
            </div>
            <div class="stat">
              <div class="stat-value">
                {{ subscription.total_sessions - subscription.used_sessions }}
              </div>
              <div class="stat-label">Sessions Remaining</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ subscription.total_sessions }}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ getDaysRemaining() }}</div>
              <div class="stat-label">Days Remaining</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Timeline -->
      <div class="info-card">
        <h2>Timeline</h2>

        <div class="timeline">
          <div class="timeline-item" :class="{ active: isDatePassed(subscription.start_date) }">
            <div class="timeline-icon">🚀</div>
            <div class="timeline-content">
              <h4>Subscription Started</h4>
              <p>{{ formatDate(subscription.start_date) }}</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ active: subscription.used_sessions > 0 }">
            <div class="timeline-icon">📚</div>
            <div class="timeline-content">
              <h4>First Session Used</h4>
              <p>{{ subscription.used_sessions > 0 ? 'Completed' : 'Not started yet' }}</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ active: getProgressPercentage(subscription) >= 50 }">
            <div class="timeline-icon">🎯</div>
            <div class="timeline-content">
              <h4>50% Milestone</h4>
              <p>{{ getProgressPercentage(subscription) >= 50 ? 'Achieved' : 'In progress' }}</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ active: isSubscriptionCompleted() }">
            <div class="timeline-icon">🏆</div>
            <div class="timeline-content">
              <h4>Subscription Complete</h4>
              <p>{{ formatDate(subscription.end_date) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="info-card">
        <h2>Actions</h2>

        <div class="actions-grid">
          <button
            v-if="canUseSession()"
            @click="useSession"
            class="action-btn use-session"
            :disabled="usingSession"
          >
            <div class="action-icon">✅</div>
            <div class="action-content">
              <h4>{{ usingSession ? 'Using Session...' : 'Use Session' }}</h4>
              <p>Mark one session as completed</p>
            </div>
          </button>

          <button @click="viewStudent" class="action-btn view-student">
            <div class="action-icon">👨‍🎓</div>
            <div class="action-content">
              <h4>View Student</h4>
              <p>See {{ student?.name }}'s profile</p>
            </div>
          </button>

          <button @click="extendSubscription" class="action-btn extend" :disabled="!canExtend()">
            <div class="action-icon">🔄</div>
            <div class="action-content">
              <h4>Extend Subscription</h4>
              <p>Add more sessions or extend period</p>
            </div>
          </button>

          <button
            v-if="getSubscriptionStatus(subscription) === 'Expired'"
            @click="renewSubscription"
            class="action-btn renew"
          >
            <div class="action-icon">🆕</div>
            <div class="action-content">
              <h4>Renew Subscription</h4>
              <p>Create a new subscription package</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="error-message">Subscription not found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useStudentsStore } from '@/stores/students'
import type { Subscription, Student } from '@/types'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const subscriptionsStore = useSubscriptionsStore()
const studentsStore = useStudentsStore()

// State
const subscription = ref<Subscription | null>(null)
const student = ref<Student | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const usingSession = ref(false)

// Computed
const subscriptionId = computed(() => {
  return parseInt(route.params.id as string)
})

const circumference = 2 * Math.PI * 52 // radius = 52

const progressOffset = computed(() => {
  if (!subscription.value) return circumference
  const progress = getProgressPercentage(subscription.value) / 100
  return circumference - progress * circumference
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${start} - ${end}`
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

const getDaysRemaining = () => {
  if (!subscription.value) return 0
  const now = new Date()
  const endDate = new Date(subscription.value.end_date)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const isDatePassed = (dateString: string) => {
  return new Date() >= new Date(dateString)
}

const isSubscriptionCompleted = () => {
  if (!subscription.value) return false
  return (
    subscription.value.used_sessions >= subscription.value.total_sessions ||
    new Date() > new Date(subscription.value.end_date)
  )
}

const canUseSession = () => {
  if (!subscription.value) return false
  const status = getSubscriptionStatus(subscription.value)
  return status === 'Active' && subscription.value.used_sessions < subscription.value.total_sessions
}

const canExtend = () => {
  if (!subscription.value) return false
  const status = getSubscriptionStatus(subscription.value)
  return status === 'Active' || status === 'Completed'
}

const fetchSubscriptionData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch subscription details
    subscription.value = await subscriptionsStore.fetchSubscription(subscriptionId.value)

    // Fetch student information
    if (subscription.value.student_id) {
      student.value = await studentsStore.fetchStudent(subscription.value.student_id)
    }
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to load subscription details'
    console.error('Error fetching subscription data:', err)
  } finally {
    loading.value = false
  }
}

const useSession = async () => {
  if (!subscription.value || !canUseSession()) return

  usingSession.value = true
  try {
    const updatedSubscription = await subscriptionsStore.useSession(subscription.value.id)
    subscription.value = updatedSubscription
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to use session'
  } finally {
    usingSession.value = false
  }
}

const viewStudent = () => {
  if (student.value) {
    router.push(`/students/${student.value.id}`)
  }
}

const extendSubscription = async () => {
  if (!subscription.value) return

  const additionalSessions = prompt('How many additional sessions to add?', '5')
  if (!additionalSessions || isNaN(parseInt(additionalSessions))) return

  const sessionCount = parseInt(additionalSessions)
  if (sessionCount <= 0) {
    alert('Please enter a positive number')
    return
  }

  try {
    const updatedSubscription = await subscriptionsStore.extendSessions(
      subscription.value.id,
      sessionCount,
    )
    subscription.value = updatedSubscription
    alert(`Successfully added ${sessionCount} sessions!`)
  } catch (err: unknown) {
    alert(`Failed to extend subscription: ${(err as Error).message}`)
  }
}

const renewSubscription = () => {
  // TODO: Implement renew subscription functionality
  router.push(`/subscriptions?student_id=${subscription.value?.student_id}&renew=true`)
}

const goBack = () => {
  router.go(-1)
}

// Load data on mount
onMounted(() => {
  fetchSubscriptionData()
})
</script>

<style scoped>
.subscription-detail-view {
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

.subscription-details {
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

.subscription-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.overview-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.overview-content h3 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 1.2rem;
}

.overview-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.progress-overview {
  display: flex;
  align-items: center;
  gap: 40px;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #28a745;
}

.progress-label {
  font-size: 0.8rem;
  color: #666;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  flex: 1;
}

.stat {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  opacity: 0.6;
}

.timeline-item.active {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  opacity: 1;
  border-left: 4px solid #28a745;
}

.timeline-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-content h4 {
  margin: 0 0 4px 0;
  color: #333;
}

.timeline-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.use-session {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #e8f5e8 100%);
}

.action-btn.view-student {
  border-color: #3498db;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
}

.action-btn.extend {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.action-btn.renew {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #ffeaea 0%, #ffe0e0 100%);
}

.action-icon {
  font-size: 1.8rem;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-content h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 1.1rem;
}

.action-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left h1 {
    font-size: 2rem;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .progress-overview {
    flex-direction: column;
    gap: 20px;
  }

  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
