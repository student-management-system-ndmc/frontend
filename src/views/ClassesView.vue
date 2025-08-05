<script setup lang="ts">
import { ref } from 'vue'
import WeeklySchedule from '@/components/WeeklySchedule.vue'
import ClassForm from '@/components/ClassForm.vue'
import type { Class } from '@/types'

// State
const showCreateForm = ref(false)
const canRegisterStudent = ref(false)

// Methods
const handleClassCreated = (classItem: Class) => {
  showCreateForm.value = false
}

const handleClassSelected = (classItem: Class) => {
  if (!canRegisterStudent.value) {
    console.log('Class selected:', classItem)
  }
}

const handleStudentRegistered = (classId: number, studentId: number) => {
  console.log(`Student ${studentId} registered to class ${classId}`)
}

const toggleRegistrationMode = () => {
  canRegisterStudent.value = !canRegisterStudent.value
}
</script>

<template>
  <div class="classes-view">
    <div class="page-header">
      <h1>Classes & Schedule</h1>
      <div class="header-actions">
        <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
          {{ showCreateForm ? 'Hide Form' : 'Add New Class' }}
        </button>
        <button
          @click="toggleRegistrationMode"
          class="btn"
          :class="canRegisterStudent ? 'btn-warning' : 'btn-secondary'"
        >
          {{ canRegisterStudent ? 'Exit Registration Mode' : 'Enable Registration' }}
        </button>
      </div>
    </div>

    <!-- Create Class Form -->
    <div v-if="showCreateForm" class="form-section">
      <ClassForm @success="handleClassCreated" />
    </div>

    <!-- Registration Mode Info -->
    <div v-if="canRegisterStudent" class="info-banner">
      <div class="info-content">
        <strong>Registration Mode Active:</strong>
        Click on any class card to register a student to that class.
      </div>
    </div>

    <!-- Weekly Schedule -->
    <div class="schedule-section">
      <WeeklySchedule
        :can-register-student="canRegisterStudent"
        @class-selected="handleClassSelected"
        @student-registered="handleStudentRegistered"
      />
    </div>
  </div>
</template>

<style scoped>
.classes-view {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.form-section {
  margin-bottom: 40px;
}

.info-banner {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border: 1px solid #fdcb6e;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-content {
  color: #2d3436;
  font-weight: 500;
  text-align: center;
}

.schedule-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.btn {
  padding: 12px 24px;
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
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }
}
</style>
