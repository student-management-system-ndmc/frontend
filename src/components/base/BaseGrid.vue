<template>
  <div :class="gridClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  cols?: number | string
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cols: 'auto',
  gap: 'md',
  responsive: true
})

const gridClasses = computed(() => [
  'base-grid',
  `base-grid--gap-${props.gap}`,
  {
    'base-grid--responsive': props.responsive,
    [`base-grid--cols-${props.cols}`]: typeof props.cols === 'number'
  }
])
</script>

<style scoped>
.base-grid {
  display: grid;
  width: 100%;
}

/* Gaps */
.base-grid--gap-none {
  gap: 0;
}

.base-grid--gap-sm {
  gap: 0.5rem;
}

.base-grid--gap-md {
  gap: 1rem;
}

.base-grid--gap-lg {
  gap: 1.5rem;
}

.base-grid--gap-xl {
  gap: 2rem;
}

/* Auto fit columns */
.base-grid:not([class*="base-grid--cols-"]) {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Fixed columns */
.base-grid--cols-1 { grid-template-columns: repeat(1, 1fr); }
.base-grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
.base-grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
.base-grid--cols-4 { grid-template-columns: repeat(4, 1fr); }
.base-grid--cols-5 { grid-template-columns: repeat(5, 1fr); }
.base-grid--cols-6 { grid-template-columns: repeat(6, 1fr); }

/* Responsive */
.base-grid--responsive.base-grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.base-grid--responsive.base-grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.base-grid--responsive.base-grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.base-grid--responsive.base-grid--cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.base-grid--responsive.base-grid--cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

@media (max-width: 1024px) {
  .base-grid--responsive.base-grid--cols-4,
  .base-grid--responsive.base-grid--cols-5,
  .base-grid--responsive.base-grid--cols-6 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .base-grid--responsive.base-grid--cols-3,
  .base-grid--responsive.base-grid--cols-4,
  .base-grid--responsive.base-grid--cols-5,
  .base-grid--responsive.base-grid--cols-6 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .base-grid:not([class*="base-grid--cols-"]) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .base-grid--responsive {
    grid-template-columns: 1fr !important;
  }
  
  .base-grid:not([class*="base-grid--cols-"]) {
    grid-template-columns: 1fr;
  }
}
</style>