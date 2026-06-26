<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <div class="modal-container" :style="{ maxWidth: width }">
          <div class="modal-header">
            <div class="modal-title-group">
              <span v-if="icon" class="modal-icon">
                <component :is="icon" v-if="typeof icon === 'object' || typeof icon === 'function'" :size="20" />
                <template v-else>{{ icon }}</template>
              </span>
              <h3 class="modal-title">{{ title }}</h3>
            </div>
            <button class="modal-close btn btn-icon btn-ghost" @click="$emit('update:modelValue', false)">
              <X :size="18" />
            </button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  icon: { type: [String, Object, Function], default: '' },
  width: { type: String, default: '520px' },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-container {
  width: 100%;
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.modal-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-icon {
  font-size: 1.2rem;
}
.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.modal-close {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.modal-body {
  padding: 24px;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from .modal-container {
  transform: scale(0.95) translateY(-10px);
}
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(-10px);
}
</style>
