<template>
  <div class="weekly-schedule">
    <div class="schedule-header">
      <h3>Weekly Class Schedule</h3>
      <div class="schedule-controls">
        <button @click="previousWeek" class="btn btn-secondary btn-sm">← Previous Week</button>
        <span class="current-week">{{ currentWeekDisplay }}</span>
        <button @click="nextWeek" class="btn btn-secondary btn-sm">Next Week →</button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading schedule...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="schedule-container">
      <!-- Weekly Schedule Table -->
      <div class="schedule-table">
        <div class="schedule-grid">
          <div v-for="day in DAYS_OF_WEEK" :key="day" class="day-column">
            <div class="day-header">
              <h4>{{ day }}</h4>
              <span class="date">{{ getDateForDay(day) }}</span>
              <span class="class-count">{{ getDayClasses(day).length }} classes</span>
            </div>

            <div class="classes-list">
              <div
                v-for="classItem in getDayClasses(day)"
                :key="classItem.id"
                class="class-card"
                :class="{ clickable: canRegisterStudent }"
                @click="
                  canRegisterStudent
                    ? handleRegisterClick(classItem)
                    : $emit('classSelected', classItem)
                "
              >
                <div class="class-header">
                  <h5>{{ classItem.name }}</h5>
                  <span class="time-slot">{{ classItem.time_slot }}</span>
                </div>

                <div class="class-details">
                  <p class="subject">📚 {{ classItem.subject }}</p>
                  <p class="teacher">👨‍🏫 {{ classItem.teacher_name }}</p>
                  <p class="capacity">
                    👥 {{ getClassCurrentStudents(classItem.id) }}/{{ classItem.max_students }}
                    students
                  </p>
                </div>

                <div v-if="canRegisterStudent" class="register-hint">
                  🔔 Click to register student
                </div>
              </div>

              <div v-if="getDayClasses(day).length === 0" class="no-classes">
                📅 No classes scheduled
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Registration Modal -->
    <div v-if="showRegistrationModal" class="modal-overlay" @click="closeRegistrationModal">
      <div class="modal-content" @click.stop>
        <h4>Register Student to {{ selectedClass?.name }}</h4>

        <div class="class-info">
          <p><strong>Subject:</strong> {{ selectedClass?.subject }}</p>
          <p><strong>Teacher:</strong> {{ selectedClass?.teacher_name }}</p>
          <p>
            <strong>Schedule:</strong> {{ selectedClass?.day_of_week }} at
            {{ selectedClass?.time_slot }}
          </p>
          <p><strong>Available Spots:</strong> {{ getAvailableSpots(selectedClass) }}</p>
        </div>

        <div class="form-group">
          <label for="student-select">Select Student</label>
          <select id="student-select" v-model="selectedStudentId" class="form-input" required>
            <option value="">Choose a student</option>
            <option v-for="student in studentsStore.students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.current_grade }})
            </option>
          </select>
        </div>

        <div v-if="registrationError" class="error-message">
          {{ registrationError }}
        </div>

        <div class="modal-actions">
          <button
            @click="closeRegistrationModal"
            class="btn btn-secondary"
            :disabled="registering > 0"
          >
            Cancel
          </button>
          <button
            @click="confirmRegistration"
            class="btn btn-primary"
            :disabled="
              !selectedStudentId || registering > 0 || getAvailableSpots(selectedClass) <= 0
            "
          >
            {{ registering > 0 ? 'Registering...' : 'Register Student' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Class } from '@/types'
import { DAYS_OF_WEEK, type DayOfWeek } from '@/types'
import { useClassesStore } from '@/stores/classes'
import { useStudentsStore } from '@/stores/students'

// Props
interface Props {
  canRegisterStudent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canRegisterStudent: false,
})

// Emits
const emit = defineEmits<{
  classSelected: [classItem: Class]
  studentRegistered: [classId: number, studentId: number]
}>()

// Stores
const classesStore = useClassesStore()
const studentsStore = useStudentsStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const registering = ref(0)
const registrationError = ref<string | null>(null)

// Week navigation
const currentWeekStart = ref(new Date())

// Modal state
const showRegistrationModal = ref(false)
const selectedClass = ref<Class | null>(null)
const selectedStudentId = ref<number | null>(null)

// Computed
const getDayClasses = computed(() => {
  return (day: DayOfWeek) => classesStore.getClassesByDay(day)
})

const currentWeekDisplay = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
})

// Methods
const getDateForDay = (day: DayOfWeek) => {
  const dayIndex = DAYS_OF_WEEK.indexOf(day)
  const date = new Date(currentWeekStart.value)
  date.setDate(currentWeekStart.value.getDate() + dayIndex)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getClassCurrentStudents = (classId: number) => {
  // This would normally come from the backend
  // For now, return a deterministic number based on classId for demo
  const seed = classId * 123
  return (seed % 8) + 1
}

const getAvailableSpots = (classItem: Class | null) => {
  if (!classItem) return 0
  const current = getClassCurrentStudents(classItem.id)
  return Math.max(0, classItem.max_students - current)
}

const fetchSchedule = async () => {
  loading.value = true
  error.value = null

  try {
    await classesStore.fetchAllClasses()
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to load schedule'
  } finally {
    loading.value = false
  }
}

const previousWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

const handleRegisterClick = (classItem: Class) => {
  if (getAvailableSpots(classItem) <= 0) {
    alert('This class is full!')
    return
  }

  selectedClass.value = classItem
  selectedStudentId.value = null
  registrationError.value = null
  showRegistrationModal.value = true
}

const closeRegistrationModal = () => {
  showRegistrationModal.value = false
  selectedClass.value = null
  selectedStudentId.value = null
  registrationError.value = null
}

const confirmRegistration = async () => {
  if (!selectedClass.value || !selectedStudentId.value) return

  registering.value = selectedClass.value.id
  registrationError.value = null

  try {
    await classesStore.registerStudentToClass(selectedClass.value.id, {
      student_id: selectedStudentId.value,
    })

    emit('studentRegistered', selectedClass.value.id, selectedStudentId.value)
    closeRegistrationModal()

    // Show success message
    alert(`Student successfully registered to ${selectedClass.value.name}!`)
  } catch (err: unknown) {
    registrationError.value = (err as Error).message || 'Failed to register student'
  } finally {
    registering.value = 0
  }
}

// Initialize current week to start of this week (Monday)
const initializeWeek = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday = 0, Monday = 1

  currentWeekStart.value = new Date(today)
  currentWeekStart.value.setDate(today.getDate() - daysToMonday)
}

// Load data on mount
onMounted(async () => {
  initializeWeek()
  await fetchSchedule()

  if (props.canRegisterStudent && studentsStore.students.length === 0) {
    await studentsStore.fetchAllStudents()
  }
})
</script>

<style scoped>
.weekly-schedule {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.schedule-header h3 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.schedule-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-week {
  font-weight: 500;
  color: #666;
  min-width: 200px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-message {
  color: #e74c3c;
  background: #ffeaea;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e74c3c;
}

.schedule-container {
  overflow-x: auto;
}

.schedule-table {
  min-width: 800px;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.day-column {
  background: white;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.day-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 12px;
  text-align: center;
}

.day-header h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.date {
  display: block;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.class-count {
  font-size: 11px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
}

.classes-list {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.class-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s;
  position: relative;
}

.class-card.clickable {
  cursor: pointer;
}

.class-card.clickable:hover {
  background: #e3f2fd;
  border-color: #3498db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}

.class-header h5 {
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
  line-height: 1.3;
}

.time-slot {
  background: #27ae60;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.class-details {
  margin-bottom: 8px;
}

.class-details p {
  margin: 2px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.subject {
  font-weight: 500;
  color: #333 !important;
}

.register-hint {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  color: #2d3436;
  font-size: 10px;
  font-weight: 500;
  padding: 4px 6px;
  border-radius: 4px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.no-classes {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
  font-size: 12px;
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
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.2rem;
}

.class-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border-left: 4px solid #3498db;
}

.class-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #555;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
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
  .schedule-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .schedule-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .current-week {
    min-width: auto;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
  }

  .day-column {
    min-height: auto;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 1024px) {
  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .weekly-schedule {
    padding: 16px;
  }

  .schedule-header h3 {
    font-size: 20px;
  }
}
</style>
