<template>
  <div class="base-page">
    <!-- Page Header -->
    <div v-if="$slots.header || title" class="base-page__header">
      <slot name="header">
        <div class="base-page__title-section">
          <h1 class="base-page__title">{{ title }}</h1>
          <p v-if="subtitle" class="base-page__subtitle">{{ subtitle }}</p>
        </div>
      </slot>

      <div v-if="$slots.actions" class="base-page__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Page Content -->
    <div class="base-page__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {})
</script>

<style scoped>
.base-page {
  width: 100%;
}

.base-page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.base-page__title-section {
  flex: 1;
}

.base-page__title {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.base-page__subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.base-page__actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.base-page__content {
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .base-page__header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }

  .base-page__title {
    font-size: 1.5rem;
  }

  .base-page__subtitle {
    font-size: 0.875rem;
  }

  .base-page__actions {
    justify-content: stretch;
  }

  .base-page__actions > * {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .base-page__header {
    margin-bottom: 1rem;
  }

  .base-page__title {
    font-size: 1.25rem;
  }

  .base-page__actions {
    flex-direction: column;
  }
}
</style>
