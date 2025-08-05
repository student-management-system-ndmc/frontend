<template>
  <div class="students-view">
    <div class="page-header">
      <h1>Students Management</h1>
      <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
        {{ showCreateForm ? 'Hide Form' : 'Add New Student' }}
      </button>
    </div>

    <!-- Create Student Form -->
    <div v-if="showCreateForm" class="form-section">
      <StudentForm @success="handleStudentCreated" />
    </div>

    <!-- Students List -->
    <div class="list-section">
      <h2>All Students</h2>

      <div v-if="studentsStore.loading" class="loading">Loading students...</div>

      <div v-else-if="studentsStore.error" class="error-message">
        {{ studentsStore.error }}
        <button @click="refreshStudents" class="btn btn-sm btn-primary">Try Again</button>
      </div>

      <div v-else-if="studentsStore.students.length === 0" class="empty-state">
        <p>No students found.</p>
        <button @click="showCreateForm = true" class="btn btn-primary">Add First Student</button>
      </div>

      <div v-else class="students-grid">
        <div v-for="student in studentsStore.students" :key="student.id" class="student-card">
          <div class="student-header">
            <h3>{{ student.name }}</h3>
            <span class="student-id">#{{ student.id }}</span>
          </div>

          <div class="student-details">
            <div class="detail-item">
              <strong>Date of Birth:</strong> {{ formatDate(student.dob) }}
            </div>
            <div class="detail-item"><strong>Gender:</strong> {{ student.gender }}</div>
            <div class="detail-item">
              <strong>Current Grade:</strong> {{ student.current_grade }}
            </div>
            <div class="detail-item">
              <strong>Parent:</strong>
              <span v-if="getParentById(student.parent_id)">
                {{ getParentById(student.parent_id)?.name }}
              </span>
              <span v-else class="text-muted">Loading...</span>
            </div>
          </div>

          <div class="student-actions">
            <button @click="viewStudentDetails(student.id)" class="btn btn-sm btn-secondary">
              View Details
            </button>
            <button @click="showSubscriptionModal(student)" class="btn btn-sm btn-primary">
              Subscriptions
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription Modal -->
    <div v-if="selectedStudent" class="modal-overlay" @click="closeSubscriptionModal">
      <div class="modal-content" @click.stop>
        <h4>{{ selectedStudent.name }}'s Subscriptions</h4>

        <div v-if="loadingSubscriptions" class="loading">Loading subscriptions...</div>

        <div v-else-if="studentSubscriptions.length === 0" class="empty-subscriptions">
          <p>No subscriptions found for this student.</p>
          <button @click="createSubscriptionForStudent" class="btn btn-primary">
            Create Subscription
          </button>
        </div>

        <div v-else class="subscriptions-list">
          <div
            v-for="subscription in studentSubscriptions"
            :key="subscription.id"
            class="subscription-card"
          >
            <div class="subscription-header">
              <h5>{{ subscription.package_name }}</h5>
              <span class="subscription-status" :class="getSubscriptionStatusClass(subscription)">
                {{ getSubscriptionStatus(subscription) }}
              </span>
            </div>

            <div class="subscription-details">
              <p>
                <strong>Period:</strong> {{ formatDate(subscription.start_date) }} -
                {{ formatDate(subscription.end_date) }}
              </p>
              <p>
                <strong>Sessions:</strong> {{ subscription.used_sessions }}/{{
                  subscription.total_sessions
                }}
              </p>

              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: getProgressPercentage(subscription) + '%' }"
                ></div>
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
                v-if="subscription.used_sessions < subscription.total_sessions"
                @click="useSubscriptionSession(subscription.id)"
                class="btn btn-sm btn-warning"
                :disabled="usingSession === subscription.id"
              >
                {{ usingSession === subscription.id ? 'Using...' : 'Use Session' }}
              </button>
            </div>
          </div>

          <button
            @click="createSubscriptionForStudent"
            class="btn btn-primary"
            style="margin-top: 16px"
          >
            Add New Subscription
          </button>
        </div>

        <div class="modal-actions">
          <button @click="closeSubscriptionModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useParentsStore } from '@/stores/parents'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import StudentForm from '@/components/StudentForm.vue'
import type { Student, Subscription } from '@/types'

// Router
const router = useRouter()

// Stores
const studentsStore = useStudentsStore()
const parentsStore = useParentsStore()
const subscriptionsStore = useSubscriptionsStore()

// State
const showCreateForm = ref(false)
const selectedStudent = ref<Student | null>(null)
const studentSubscriptions = ref<Subscription[]>([])
const loadingSubscriptions = ref(false)
const usingSession = ref(0)

// Computed
const getParentById = computed(() => {
  return (id: number) => parentsStore.getParentById(id)
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const refreshStudents = async () => {
  await studentsStore.fetchAllStudents()
}

const handleStudentCreated = (student: Student) => {
  showCreateForm.value = false
  console.log('Student created:', student)
}

const viewStudentDetails = (studentId: number) => {
  router.push(`/students/${studentId}`)
}

const showSubscriptionModal = async (student: Student) => {
  selectedStudent.value = student
  loadingSubscriptions.value = true

  try {
    studentSubscriptions.value = await subscriptionsStore.fetchSubscriptionsByStudent(student.id)
  } catch (error) {
    console.error('Error loading subscriptions:', error)
  } finally {
    loadingSubscriptions.value = false
  }
}

const closeSubscriptionModal = () => {
  selectedStudent.value = null
  studentSubscriptions.value = []
}

const viewSubscriptionDetails = (subscriptionId: number) => {
  router.push(`/subscriptions/${subscriptionId}`)
}

const createSubscriptionForStudent = () => {
  if (selectedStudent.value) {
    router.push(`/subscriptions?student_id=${selectedStudent.value.id}`)
  }
}

const useSubscriptionSession = async (subscriptionId: number) => {
  usingSession.value = subscriptionId

  try {
    const updatedSubscription = await subscriptionsStore.useSession(subscriptionId)

    // Force reactive update using array replacement
    const index = studentSubscriptions.value.findIndex((s) => s.id === subscriptionId)
    if (index >= 0) {
      // Create new array to trigger reactivity
      studentSubscriptions.value = [
        ...studentSubscriptions.value.slice(0, index),
        updatedSubscription,
        ...studentSubscriptions.value.slice(index + 1),
      ]
    }
  } catch (error) {
    console.error('Error using session:', error)
  } finally {
    usingSession.value = 0
  }
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

// Load data on mount
onMounted(async () => {
  await Promise.all([studentsStore.fetchAllStudents(), parentsStore.fetchAllParents()])
})
</script>

<style scoped>
.students-view {
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

.list-section h2 {
  margin: 0 0 20px 0;
  color: #555;
  font-size: 1.8rem;
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

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.student-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.student-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.student-id {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.student-details {
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

.student-actions {
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h4 {
  margin: 0 0 20px 0;
  color: #333;
}

.empty-subscriptions {
  text-align: center;
  padding: 40px 20px;
}

.subscriptions-list {
  max-height: 400px;
  overflow-y: auto;
}

.subscription-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subscription-header h5 {
  margin: 0;
  color: #333;
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

.subscription-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.progress-bar {
  background: #e9ecef;
  border-radius: 4px;
  height: 8px;
  margin: 8px 0;
  overflow: hidden;
}

.progress-fill {
  background: #28a745;
  height: 100%;
  transition: width 0.3s ease;
}

.subscription-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
