<template>
  <div class="base-table">
    <div class="base-table__wrapper">
      <table class="base-table__table">
        <thead v-if="$slots.header" class="base-table__header">
          <slot name="header" />
        </thead>
        <tbody class="base-table__body">
          <slot />
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="base-table__loading">
      <div class="base-table__loading-content">
        <div class="base-table__spinner"></div>
        <span>Loading...</span>
      </div>
    </div>

    <div v-if="empty && !loading" class="base-table__empty">
      <slot name="empty">
        <div class="base-table__empty-content">
          <span class="base-table__empty-icon">📋</span>
          <p class="base-table__empty-text">No data available</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  empty?: boolean
  striped?: boolean
  bordered?: boolean
  hover?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  empty: false,
  striped: false,
  bordered: false,
  hover: true,
})
</script>

<style scoped>
.base-table {
  position: relative;
  width: 100%;
}

.base-table__wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.base-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.base-table__header {
  background: #f9fafb;
}

.base-table__header th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.base-table__body td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.base-table__body tr:last-child td {
  border-bottom: none;
}

.base-table__body tr:hover td {
  background: #f9fafb;
}

.base-table__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.base-table__loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
}

.base-table__spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.base-table__empty {
  padding: 3rem 1rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.base-table__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.base-table__empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.base-table__empty-text {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .base-table__header th,
  .base-table__body td {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .base-table__empty {
    padding: 2rem 1rem;
  }

  .base-table__empty-icon {
    font-size: 2rem;
  }

  .base-table__empty-text {
    font-size: 0.875rem;
  }
}
</style>
