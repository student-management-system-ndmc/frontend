<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="base-modal" @click="handleBackdropClick">
        <div class="base-modal__backdrop" />
        <div :class="modalClasses" @click.stop>
          <div v-if="$slots.header || title" class="base-modal__header">
            <slot name="header">
              <h3 class="base-modal__title">{{ title }}</h3>
            </slot>
            <button v-if="closable" class="base-modal__close" @click="handleClose">✕</button>
          </div>

          <div class="base-modal__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

const modalClasses = computed(() => ['base-modal__content', `base-modal__content--${props.size}`])

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

// Prevent body scroll when modal is open
watch(
  () => props.show,
  (show) => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<style scoped>
.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.base-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.base-modal__content {
  position: relative;
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

/* Sizes */
.base-modal__content--sm {
  max-width: 24rem;
}

.base-modal__content--md {
  max-width: 32rem;
}

.base-modal__content--lg {
  max-width: 48rem;
}

.base-modal__content--xl {
  max-width: 64rem;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.base-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.base-modal__close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.base-modal__close:hover {
  background: #f3f4f6;
  color: #374151;
}

.base-modal__body {
  padding: 1.5rem;
}

.base-modal__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .base-modal__content,
.modal-leave-active .base-modal__content {
  transition: transform 0.15s ease;
}

.modal-enter-from .base-modal__content,
.modal-leave-to .base-modal__content {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .base-modal {
    padding: 0.5rem;
  }

  .base-modal__content {
    max-height: calc(100vh - 1rem);
  }

  .base-modal__header {
    padding: 1rem;
  }

  .base-modal__body {
    padding: 1rem;
  }

  .base-modal__footer {
    padding: 0.75rem 1rem;
    flex-direction: column-reverse;
  }

  .base-modal__footer > * {
    width: 100%;
  }
}
</style>
