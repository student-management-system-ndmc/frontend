<template>
  <div class="student-form">
    <h3>{{ isEdit ? 'Edit Student' : 'Create New Student' }}</h3>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Name <span class="required">*</span></label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="form-input"
          placeholder="Enter student name"
        />
      </div>

      <div class="form-group">
        <label for="dob">Date of Birth <span class="required">*</span></label>
        <input id="dob" v-model="form.dob" type="date" required class="form-input" />
      </div>

      <div class="form-group">
        <label for="gender">Gender <span class="required">*</span></label>
        <select id="gender" v-model="form.gender" required class="form-input">
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="form-group">
        <label for="current_grade">Current Grade <span class="required">*</span></label>
        <input
          id="current_grade"
          v-model="form.current_grade"
          type="text"
          required
          class="form-input"
          placeholder="e.g., Grade 1, Grade 12"
        />
      </div>

      <div class="form-group">
        <label for="parent_id">Parent <span class="required">*</span></label>
        <select id="parent_id" v-model="form.parent_id" required class="form-input">
          <option value="">Select parent</option>
          <option v-for="parent in parentsStore.parents" :key="parent.id" :value="parent.id">
            {{ parent.name }} ({{ parent.phone }})
          </option>
        </select>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn btn-secondary" :disabled="loading">
          Reset
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
          {{ loading ? 'Saving...' : isEdit ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { CreateStudentDto, Student } from '@/types'
import { useStudentsStore } from '@/stores/students'
import { useParentsStore } from '@/stores/parents'

// Props
interface Props {
  student?: Student | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  student: null,
  isEdit: false,
})

// Emits
const emit = defineEmits<{
  success: [student: Student]
  cancel: []
}>()

// Stores
const studentsStore = useStudentsStore()
const parentsStore = useParentsStore()

// Form state
const form = ref<CreateStudentDto>({
  name: '',
  dob: '',
  gender: '',
  current_grade: '',
  parent_id: 0,
})

const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.dob !== '' &&
    form.value.gender !== '' &&
    form.value.current_grade.trim() !== '' &&
    form.value.parent_id > 0
  )
})

// Watch for student prop changes (for edit mode)
watch(
  () => props.student,
  (newStudent) => {
    if (newStudent && props.isEdit) {
      form.value = {
        name: newStudent.name,
        dob: newStudent.dob,
        gender: newStudent.gender,
        current_grade: newStudent.current_grade,
        parent_id: newStudent.parent_id,
      }
    }
  },
  { immediate: true },
)

// Methods
const resetForm = () => {
  if (props.isEdit && props.student) {
    form.value = {
      name: props.student.name,
      dob: props.student.dob,
      gender: props.student.gender,
      current_grade: props.student.current_grade,
      parent_id: props.student.parent_id,
    }
  } else {
    form.value = {
      name: '',
      dob: '',
      gender: '',
      current_grade: '',
      parent_id: 0,
    }
  }
  error.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    const student = await studentsStore.createStudent(form.value)
    emit('success', student)

    if (!props.isEdit) {
      resetForm()
    }
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to save student'
  } finally {
    loading.value = false
  }
}

// Load parents on mount
onMounted(async () => {
  if (parentsStore.parents.length === 0) {
    await parentsStore.fetchAllParents()
  }
})
</script>

<style scoped>
.student-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-form h3 {
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

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.error-message {
  color: #e74c3c;
  font-size: 14px;
  padding: 8px;
  background: #ffeaea;
  border-radius: 4px;
  border: 1px solid #e74c3c;
}
</style>
