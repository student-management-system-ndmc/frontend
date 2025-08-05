<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="base-card__header">
      <slot name="header">
        <h3 v-if="title" class="base-card__title">{{ title }}</h3>
      </slot>
    </div>

    <div class="base-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  hover?: boolean
  border?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  border: true,
  shadow: 'sm',
  padding: 'md',
})

const cardClasses = computed(() => [
  'base-card',
  `base-card--shadow-${props.shadow}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--hover': props.hover,
    'base-card--border': props.border,
  },
])
</script>

<style scoped>
.base-card {
  background: white;
  color: #000;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.15s ease;
}

.base-card--border {
  border: 1px solid #e5e7eb;
}

.base-card--hover:hover {
  transform: translateY(-1px);
}

/* Shadows */
.base-card--shadow-none {
  box-shadow: none;
}

.base-card--shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.base-card--shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.base-card--shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.base-card--hover:hover.base-card--shadow-sm {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.base-card--hover:hover.base-card--shadow-md {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.base-card--hover:hover.base-card--shadow-lg {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Header */
.base-card__header {
  border-bottom: 1px solid #e5e7eb;
}

.base-card--padding-sm .base-card__header {
  padding: 0.75rem 1rem;
}

.base-card--padding-md .base-card__header {
  padding: 1rem 1.25rem;
}

.base-card--padding-lg .base-card__header {
  padding: 1.25rem 1.5rem;
}

.base-card__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

/* Body */
.base-card--padding-none .base-card__body {
  padding: 0;
}

.base-card--padding-sm .base-card__body {
  padding: 0.75rem 1rem;
}

.base-card--padding-md .base-card__body {
  padding: 1rem 1.25rem;
}

.base-card--padding-lg .base-card__body {
  padding: 1.25rem 1.5rem;
}

/* Footer */
.base-card__footer {
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.base-card--padding-sm .base-card__footer {
  padding: 0.75rem 1rem;
}

.base-card--padding-md .base-card__footer {
  padding: 1rem 1.25rem;
}

.base-card--padding-lg .base-card__footer {
  padding: 1.25rem 1.5rem;
}

/* Responsive */
@media (max-width: 640px) {
  .base-card--padding-md .base-card__header,
  .base-card--padding-md .base-card__body,
  .base-card--padding-md .base-card__footer {
    padding: 0.75rem 1rem;
  }

  .base-card--padding-lg .base-card__header,
  .base-card--padding-lg .base-card__body,
  .base-card--padding-lg .base-card__footer {
    padding: 1rem 1.25rem;
  }
}
</style>
