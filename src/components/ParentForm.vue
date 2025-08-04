<template>
  <div class="parent-form">
    <h3>{{ isEdit ? 'Edit Parent' : 'Create New Parent' }}</h3>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Name <span class="required">*</span></label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="form-input"
          placeholder="Enter parent name"
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone <span class="required">*</span></label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          required
          class="form-input"
          placeholder="Enter phone number"
        />
      </div>

      <div class="form-group">
        <label for="email">Email <span class="required">*</span></label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="form-input"
          placeholder="Enter email address"
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
import type { CreateParentDto, Parent } from '@/types'
import { useParentsStore } from '@/stores/parents'

// Props
interface Props {
  parent?: Parent | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parent: null,
  isEdit: false,
})

// Emits
const emit = defineEmits<{
  success: [parent: Parent]
  cancel: []
}>()

// Store
const parentsStore = useParentsStore()

// Form state
const form = ref<CreateParentDto>({
  name: '',
  phone: '',
  email: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.phone.trim() !== '' &&
    form.value.email.trim() !== ''
  )
})

// Watch for parent prop changes (for edit mode)
watch(
  () => props.parent,
  (newParent) => {
    if (newParent && props.isEdit) {
      form.value = {
        name: newParent.name,
        phone: newParent.phone,
        email: newParent.email,
      }
    }
  },
  { immediate: true },
)

// Methods
const resetForm = () => {
  if (props.isEdit && props.parent) {
    form.value = {
      name: props.parent.name,
      phone: props.parent.phone,
      email: props.parent.email,
    }
  } else {
    form.value = {
      name: '',
      phone: '',
      email: '',
    }
  }
  error.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    const parent = await parentsStore.createParent(form.value)
    emit('success', parent)

    if (!props.isEdit) {
      resetForm()
    }
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to save parent'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.parent-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.parent-form h3 {
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
