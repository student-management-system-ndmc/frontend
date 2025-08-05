<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  tag: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'base-btn',
  `base-btn--${props.variant}`,
  `base-btn--${props.size}`,
  {
    'base-btn--disabled': props.disabled || props.loading,
    'base-btn--loading': props.loading,
    'base-btn--full-width': props.fullWidth
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
  font-family: inherit;
}

.base-btn:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Sizes */
.base-btn--sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.base-btn--md {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.base-btn--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
}

/* Variants */
.base-btn--primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.base-btn--primary:hover:not(.base-btn--disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.base-btn--secondary {
  background-color: #6b7280;
  color: white;
  border-color: #6b7280;
}

.base-btn--secondary:hover:not(.base-btn--disabled) {
  background-color: #4b5563;
  border-color: #4b5563;
}

.base-btn--outline {
  background-color: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.base-btn--outline:hover:not(.base-btn--disabled) {
  background-color: #3b82f6;
  color: white;
}

.base-btn--ghost {
  background-color: transparent;
  color: #374151;
  border-color: transparent;
}

.base-btn--ghost:hover:not(.base-btn--disabled) {
  background-color: #f3f4f6;
}

.base-btn--danger {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
}

.base-btn--danger:hover:not(.base-btn--disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* States */
.base-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-btn--loading {
  cursor: wait;
}

.base-btn--full-width {
  width: 100%;
}

/* Loading spinner */
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .base-btn--md {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .base-btn--lg {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}
</style>