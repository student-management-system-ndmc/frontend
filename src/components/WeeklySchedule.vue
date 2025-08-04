<template>
  <div class="weekly-schedule">
    <h3>Weekly Class Schedule</h3>

    <div v-if="loading" class="loading">Loading schedule...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="schedule-grid">
      <div v-for="day in DAYS_OF_WEEK" :key="day" class="day-column">
        <div class="day-header">
          <h4>{{ day }}</h4>
          <span class="class-count">{{ getDayClasses(day).length }} classes</span>
        </div>

        <div class="classes-list">
          <div
            v-for="classItem in getDayClasses(day)"
            :key="classItem.id"
            class="class-card"
            @click="$emit('classSelected', classItem)"
          >
            <div class="class-header">
              <h5>{{ classItem.name }}</h5>
              <span class="time-slot">{{ classItem.time_slot }}</span>
            </div>

            <div class="class-details">
              <p class="subject">{{ classItem.subject }}</p>
              <p class="teacher">Teacher: {{ classItem.teacher_name }}</p>
              <p class="capacity">Max Students: {{ classItem.max_students }}</p>
            </div>

            <div class="class-actions">
              <button
                v-if="canRegisterStudent"
                @click.stop="handleRegisterClick(classItem)"
                class="btn btn-sm btn-primary"
                :disabled="registering === classItem.id"
              >
                {{ registering === classItem.id ? 'Registering...' : 'Register Student' }}
              </button>
            </div>
          </div>

          <div v-if="getDayClasses(day).length === 0" class="no-classes">No classes scheduled</div>
        </div>
      </div>
    </div>

    <!-- Student Registration Modal -->
    <div v-if="showRegistrationModal" class="modal-overlay" @click="closeRegistrationModal">
      <div class="modal-content" @click.stop>
        <h4>Register Student to {{ selectedClass?.name }}</h4>

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
            :disabled="!selectedStudentId || registering > 0"
          >
            {{ registering > 0 ? 'Registering...' : 'Register' }}
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

// Modal state
const showRegistrationModal = ref(false)
const selectedClass = ref<Class | null>(null)
const selectedStudentId = ref<number | null>(null)

// Computed
const getDayClasses = computed(() => {
  return (day: DayOfWeek) => classesStore.getClassesByDay(day)
})

// Methods
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

const handleRegisterClick = (classItem: Class) => {
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
  } catch (err: unknown) {
    registrationError.value = (err as Error).message || 'Failed to register student'
  } finally {
    registering.value = 0
  }
}

// Load data on mount
onMounted(async () => {
  await fetchSchedule()

  if (props.canRegisterStudent && studentsStore.students.length === 0) {
    await studentsStore.fetchAllStudents()
  }
})
</script>

<style scoped>
.weekly-schedule {
  padding: 24px;
}

.weekly-schedule h3 {
  margin: 0 0 24px 0;
  color: #333;
  font-size: 24px;
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

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.day-column {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.day-header {
  background: #3498db;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-header h4 {
  margin: 0;
  font-size: 18px;
}

.class-count {
  font-size: 12px;
  opacity: 0.9;
}

.classes-list {
  padding: 16px;
  min-height: 200px;
}

.class-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.class-card:hover {
  background: #e3f2fd;
  border-color: #3498db;
  transform: translateY(-1px);
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.class-header h5 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.time-slot {
  background: #27ae60;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.class-details {
  margin-bottom: 12px;
}

.class-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.subject {
  font-weight: 500;
  color: #333 !important;
}

.class-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 11px;
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

.no-classes {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 20px;
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
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h4 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.modal-actions .btn {
  padding: 12px 24px;
  font-size: 14px;
}
</style>
