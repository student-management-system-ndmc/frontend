<template>
  <div class="parent-detail-view">
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">← Back</button>
        <h1 v-if="parent">{{ parent.name }}</h1>
        <h1 v-else>Parent Details</h1>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading parent details...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchParentData" class="btn btn-sm btn-primary">Try Again</button>
    </div>

    <div v-else-if="parent" class="parent-details">
      <!-- Basic Information -->
      <div class="info-card">
        <h2>Contact Information</h2>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">👤</div>
            <div class="contact-content">
              <h3>{{ parent.name }}</h3>
              <p>Full Name</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">📱</div>
            <div class="contact-content">
              <h3>{{ parent.phone }}</h3>
              <p>Phone Number</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">📧</div>
            <div class="contact-content">
              <h3>{{ parent.email }}</h3>
              <p>Email Address</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">🆔</div>
            <div class="contact-content">
              <h3>#{{ parent.id }}</h3>
              <p>Parent ID</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Children Information -->
      <div class="info-card">
        <div class="card-header">
          <h2>Children</h2>
          <button @click="addNewStudent" class="btn btn-primary">Add Child</button>
        </div>

        <div v-if="loadingStudents" class="loading">Loading children...</div>

        <div v-else-if="children.length === 0" class="empty-state">
          <div class="empty-icon">👶</div>
          <p>No children registered yet.</p>
          <button @click="addNewStudent" class="btn btn-primary">Add First Child</button>
        </div>

        <div v-else class="children-grid">
          <div
            v-for="child in children"
            :key="child.id"
            class="child-card"
            @click="viewStudentDetails(child.id)"
          >
            <div class="child-header">
              <h3>{{ child.name }}</h3>
              <span class="child-grade">{{ child.current_grade }}</span>
            </div>

            <div class="child-details">
              <div class="detail-row">
                <span class="detail-icon">🎂</span>
                <span>{{ formatDate(child.dob) }} ({{ calculateAge(child.dob) }} years old)</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">⚧</span>
                <span>{{ child.gender }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">📚</span>
                <span>{{ getChildSubscriptionsCount(child.id) }} active subscriptions</span>
              </div>
            </div>

            <div class="child-actions">
              <button @click.stop="viewStudentDetails(child.id)" class="btn btn-sm btn-primary">
                View Details
              </button>
              <button @click.stop="manageSubscriptions(child.id)" class="btn btn-sm btn-secondary">
                Subscriptions
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Summary -->
      <div class="info-card">
        <h2>Subscription Overview</h2>

        <div v-if="loadingSubscriptions" class="loading">Loading subscriptions...</div>

        <div v-else-if="allSubscriptions.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No subscriptions found for any children.</p>
        </div>

        <div v-else class="subscription-summary">
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">{{ allSubscriptions.length }}</div>
              <div class="stat-label">Total Subscriptions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getActiveSubscriptions().length }}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getTotalSessions() }}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getUsedSessions() }}</div>
              <div class="stat-label">Sessions Used</div>
            </div>
          </div>

          <div class="recent-subscriptions">
            <h3>Recent Subscriptions</h3>
            <div class="subscription-list">
              <div
                v-for="subscription in getRecentSubscriptions()"
                :key="subscription.id"
                class="subscription-item"
                @click="viewSubscriptionDetails(subscription.id)"
              >
                <div class="subscription-info">
                  <h4>{{ subscription.package_name }}</h4>
                  <p>{{ getStudentName(subscription.student_id) }}</p>
                </div>
                <div class="subscription-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: getProgressPercentage(subscription) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text"
                    >{{ subscription.used_sessions }}/{{ subscription.total_sessions }}</span
                  >
                </div>
                <div class="subscription-status" :class="getSubscriptionStatusClass(subscription)">
                  {{ getSubscriptionStatus(subscription) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="info-card">
        <h2>Quick Actions</h2>
        <div class="quick-actions-grid">
          <button @click="addNewStudent" class="action-card">
            <div class="action-icon">👶</div>
            <div class="action-content">
              <h4>Add New Child</h4>
              <p>Register a new child to this parent</p>
            </div>
          </button>

          <button @click="createSubscription" class="action-card">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h4>New Subscription</h4>
              <p>Create subscription for any child</p>
            </div>
          </button>

          <button @click="viewAllClasses" class="action-card">
            <div class="action-icon">📚</div>
            <div class="action-content">
              <h4>Browse Classes</h4>
              <p>View available classes for children</p>
            </div>
          </button>

          <button @click="editParent" class="action-card">
            <div class="action-icon">✏️</div>
            <div class="action-content">
              <h4>Edit Information</h4>
              <p>Update parent contact details</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="error-message">Parent not found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useParentsStore } from '@/stores/parents'
import { useStudentsStore } from '@/stores/students'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import type { Parent, Student, Subscription } from '@/types'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const parentsStore = useParentsStore()
const studentsStore = useStudentsStore()
const subscriptionsStore = useSubscriptionsStore()

// State
const parent = ref<Parent | null>(null)
const children = ref<Student[]>([])
const allSubscriptions = ref<Subscription[]>([])

const loading = ref(false)
const loadingStudents = ref(false)
const loadingSubscriptions = ref(false)
const error = ref<string | null>(null)

// Computed
const parentId = computed(() => {
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

const getChildSubscriptionsCount = (studentId: number) => {
  return allSubscriptions.value.filter(
    (sub) => sub.student_id === studentId && getSubscriptionStatus(sub) === 'Active',
  ).length
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

const getActiveSubscriptions = () => {
  return allSubscriptions.value.filter((sub) => getSubscriptionStatus(sub) === 'Active')
}

const getTotalSessions = () => {
  return allSubscriptions.value.reduce((total, sub) => total + sub.total_sessions, 0)
}

const getUsedSessions = () => {
  return allSubscriptions.value.reduce((total, sub) => total + sub.used_sessions, 0)
}

const getRecentSubscriptions = () => {
  return allSubscriptions.value
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 5)
}

const getStudentName = (studentId: number) => {
  const student = children.value.find((s) => s.id === studentId)
  return student?.name || 'Unknown'
}

const fetchParentData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch parent details
    parent.value = await parentsStore.fetchParent(parentId.value)

    // Fetch children
    await fetchChildren()

    // Fetch all subscriptions for children
    await fetchAllSubscriptions()
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to load parent details'
    console.error('Error fetching parent data:', err)
  } finally {
    loading.value = false
  }
}

const fetchChildren = async () => {
  loadingStudents.value = true
  try {
    await studentsStore.fetchAllStudents()
    children.value = studentsStore.getStudentsByParent(parentId.value)
  } catch (err: unknown) {
    console.error('Error fetching children:', err)
  } finally {
    loadingStudents.value = false
  }
}

const fetchAllSubscriptions = async () => {
  loadingSubscriptions.value = true
  try {
    const allSubs: Subscription[] = []
    for (const child of children.value) {
      const childSubs = await subscriptionsStore.fetchSubscriptionsByStudent(child.id)
      allSubs.push(...childSubs)
    }
    allSubscriptions.value = allSubs
  } catch (err: unknown) {
    console.error('Error fetching subscriptions:', err)
  } finally {
    loadingSubscriptions.value = false
  }
}

const viewStudentDetails = (studentId: number) => {
  router.push(`/students/${studentId}`)
}

const manageSubscriptions = (studentId: number) => {
  router.push(`/subscriptions?student_id=${studentId}`)
}

const viewSubscriptionDetails = (subscriptionId: number) => {
  router.push(`/subscriptions/${subscriptionId}`)
}

const addNewStudent = () => {
  router.push(`/students?parent_id=${parentId.value}`)
}

const createSubscription = () => {
  router.push('/subscriptions')
}

const viewAllClasses = () => {
  router.push('/classes')
}

const editParent = () => {
  // TODO: Implement edit parent functionality
  alert('Edit parent feature coming soon!')
}

const goBack = () => {
  router.go(-1)
}

// Load data on mount
onMounted(() => {
  fetchParentData()
})
</script>

<style scoped>
.parent-detail-view {
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

.parent-details {
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

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.contact-icon {
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

.contact-content h3 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 1.2rem;
}

.contact-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.child-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.child-card:hover {
  background: #e3f2fd;
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.child-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.child-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.child-grade {
  background: #27ae60;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.child-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
}

.detail-icon {
  width: 16px;
  text-align: center;
}

.child-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.subscription-summary {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #3498db;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.recent-subscriptions h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscription-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.subscription-item:hover {
  background: #e3f2fd;
  border-color: #3498db;
}

.subscription-info {
  flex: 1;
}

.subscription-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 1rem;
}

.subscription-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.subscription-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.progress-bar {
  width: 80px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.subscription-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
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

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.action-card:hover {
  border-color: #3498db;
  background: #e3f2fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
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

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .children-grid {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
