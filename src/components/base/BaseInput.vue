<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper">
      <input
        :id="inputId"
        :class="inputClasses"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <div v-if="$slots.suffix" class="base-input__suffix">
        <slot name="suffix" />
      </div>
    </div>

    <div v-if="error || hint" class="base-input__help">
      <span v-if="error" class="base-input__error">{{ error }}</span>
      <span v-else-if="hint" class="base-input__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const focused = ref(false)

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => [
  'base-input__field',
  `base-input__field--${props.size}`,
  {
    'base-input__field--error': props.error,
    'base-input__field--disabled': props.disabled,
    'base-input__field--focused': focused.value,
  },
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}
</script>

<style scoped>
.base-input {
  width: 100%;
}

.base-input__label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.base-input__required {
  color: #ef4444;
  margin-left: 0.125rem;
}

.base-input__wrapper {
  position: relative;
}

.base-input__field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #111827;
  transition: all 0.15s ease;
  font-family: inherit;
}

.base-input__field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.base-input__field::placeholder {
  color: #9ca3af;
}

/* Sizes */
.base-input__field--sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.base-input__field--md {
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

.base-input__field--lg {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

/* States */
.base-input__field--error {
  border-color: #ef4444;
}

.base-input__field--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}

.base-input__field--disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.base-input__suffix {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.base-input__help {
  margin-top: 0.375rem;
  font-size: 0.875rem;
}

.base-input__error {
  color: #ef4444;
}

.base-input__hint {
  color: #6b7280;
}

/* Responsive */
@media (max-width: 640px) {
  .base-input__field--md {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .base-input__field--lg {
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
