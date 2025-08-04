<template>
  <div class="class-form">
    <h3>{{ isEdit ? 'Edit Class' : 'Create New Class' }}</h3>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Class Name <span class="required">*</span></label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="form-input"
          placeholder="Enter class name"
        />
      </div>

      <div class="form-group">
        <label for="subject">Subject <span class="required">*</span></label>
        <input
          id="subject"
          v-model="form.subject"
          type="text"
          required
          class="form-input"
          placeholder="Enter subject"
        />
      </div>

      <div class="form-group">
        <label for="day_of_week">Day of Week <span class="required">*</span></label>
        <select id="day_of_week" v-model="form.day_of_week" required class="form-input">
          <option value="">Select day</option>
          <option v-for="day in DAYS_OF_WEEK" :key="day" :value="day">
            {{ day }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="time_slot">Time Slot <span class="required">*</span></label>
        <input
          id="time_slot"
          v-model="form.time_slot"
          type="text"
          required
          class="form-input"
          placeholder="e.g., 9:00 AM - 10:30 AM"
        />
      </div>

      <div class="form-group">
        <label for="teacher_name">Teacher Name <span class="required">*</span></label>
        <input
          id="teacher_name"
          v-model="form.teacher_name"
          type="text"
          required
          class="form-input"
          placeholder="Enter teacher name"
        />
      </div>

      <div class="form-group">
        <label for="max_students">Maximum Students <span class="required">*</span></label>
        <input
          id="max_students"
          v-model.number="form.max_students"
          type="number"
          required
          min="1"
          max="50"
          class="form-input"
          placeholder="Enter maximum number of students"
        />
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
import { ref, computed, watch } from 'vue'
import type { CreateClassDto, Class } from '@/types'
import { DAYS_OF_WEEK } from '@/types'
import { useClassesStore } from '@/stores/classes'

// Props
interface Props {
  classItem?: Class | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  classItem: null,
  isEdit: false,
})

// Emits
const emit = defineEmits<{
  success: [classItem: Class]
  cancel: []
}>()

// Store
const classesStore = useClassesStore()

// Form state
const form = ref<CreateClassDto>({
  name: '',
  subject: '',
  day_of_week: '',
  time_slot: '',
  teacher_name: '',
  max_students: 10,
})

const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.subject.trim() !== '' &&
    form.value.day_of_week !== '' &&
    form.value.time_slot.trim() !== '' &&
    form.value.teacher_name.trim() !== '' &&
    form.value.max_students > 0
  )
})

// Watch for class prop changes (for edit mode)
watch(
  () => props.classItem,
  (newClass) => {
    if (newClass && props.isEdit) {
      form.value = {
        name: newClass.name,
        subject: newClass.subject,
        day_of_week: newClass.day_of_week,
        time_slot: newClass.time_slot,
        teacher_name: newClass.teacher_name,
        max_students: newClass.max_students,
      }
    }
  },
  { immediate: true },
)

// Methods
const resetForm = () => {
  if (props.isEdit && props.classItem) {
    form.value = {
      name: props.classItem.name,
      subject: props.classItem.subject,
      day_of_week: props.classItem.day_of_week,
      time_slot: props.classItem.time_slot,
      teacher_name: props.classItem.teacher_name,
      max_students: props.classItem.max_students,
    }
  } else {
    form.value = {
      name: '',
      subject: '',
      day_of_week: '',
      time_slot: '',
      teacher_name: '',
      max_students: 10,
    }
  }
  error.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    const classItem = await classesStore.createClass(form.value)
    emit('success', classItem)

    if (!props.isEdit) {
      resetForm()
    }
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to save class'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.class-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.class-form h3 {
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
