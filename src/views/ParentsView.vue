<template>
  <div class="parents-view">
    <div class="page-header">
      <h1>Parents Management</h1>
      <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
        {{ showCreateForm ? 'Hide Form' : 'Add New Parent' }}
      </button>
    </div>

    <!-- Create Parent Form -->
    <div v-if="showCreateForm" class="form-section">
      <ParentForm @success="handleParentCreated" />
    </div>

    <!-- Parents List -->
    <div class="list-section">
      <h2>All Parents</h2>

      <div v-if="parentsStore.loading" class="loading">Loading parents...</div>

      <div v-else-if="parentsStore.error" class="error-message">
        {{ parentsStore.error }}
        <button @click="refreshParents" class="btn btn-sm btn-primary">Try Again</button>
      </div>

      <div v-else-if="parentsStore.parents.length === 0" class="empty-state">
        <p>No parents found.</p>
        <button @click="showCreateForm = true" class="btn btn-primary">Add First Parent</button>
      </div>

      <div v-else class="parents-grid">
        <div v-for="parent in parentsStore.parents" :key="parent.id" class="parent-card">
          <div class="parent-header">
            <h3>{{ parent.name }}</h3>
            <span class="parent-id">#{{ parent.id }}</span>
          </div>

          <div class="parent-details">
            <div class="detail-item"><strong>Phone:</strong> {{ parent.phone }}</div>
            <div class="detail-item"><strong>Email:</strong> {{ parent.email }}</div>
            <div class="detail-item">
              <strong>Students:</strong>
              <span v-if="getStudentsByParent(parent.id).length === 0"> No students </span>
              <span v-else> {{ getStudentsByParent(parent.id).length }} student(s) </span>
            </div>
          </div>

          <div v-if="getStudentsByParent(parent.id).length > 0" class="students-list">
            <h4>Students:</h4>
            <ul>
              <li
                v-for="student in getStudentsByParent(parent.id)"
                :key="student.id"
                class="student-item"
              >
                <router-link :to="`/students/${student.id}`" class="student-link">
                  {{ student.name }} ({{ student.current_grade }})
                </router-link>
              </li>
            </ul>
          </div>

          <div class="parent-actions">
            <button @click="viewParentDetails(parent.id)" class="btn btn-sm btn-secondary">
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
import { useRouter } from 'vue-router'
import { useParentsStore } from '@/stores/parents'
import { useStudentsStore } from '@/stores/students'
import ParentForm from '@/components/ParentForm.vue'
import type { Parent } from '@/types'

// Router
const router = useRouter()

// Stores
const parentsStore = useParentsStore()
const studentsStore = useStudentsStore()

// State
const showCreateForm = ref(false)

// Computed
const getStudentsByParent = computed(() => {
  return (parentId: number) => studentsStore.getStudentsByParent(parentId)
})

// Methods
const refreshParents = async () => {
  await parentsStore.fetchAllParents()
}

const handleParentCreated = (parent: Parent) => {
  showCreateForm.value = false
  console.log('Parent created:', parent)
}

const viewParentDetails = (parentId: number) => {
  router.push(`/parents/${parentId}`)
}

// Load data on mount
onMounted(async () => {
  await Promise.all([parentsStore.fetchAllParents(), studentsStore.fetchAllStudents()])
})
</script>

<style scoped>
.parents-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

.empty-state p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.parents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.parent-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.parent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.parent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.parent-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.parent-id {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.parent-details {
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

.students-list {
  margin-bottom: 16px;
}

.students-list h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1rem;
}

.students-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.student-item {
  margin-bottom: 4px;
}

.student-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
}

.student-link:hover {
  text-decoration: underline;
}

.parent-actions {
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .parents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
