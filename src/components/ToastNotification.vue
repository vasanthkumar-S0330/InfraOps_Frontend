<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <span class="toast-icon"><component :is="icons[toast.type]" :size="18" /></span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(toast.id)"><X :size="14" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const toasts = ref([]);
let nextId = 0;

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function addToast(message, type = 'info', duration = 4000) {
  const id = ++nextId;
  toasts.value.push({ id, message, type });
  setTimeout(() => removeToast(id), duration);
}

function removeToast(id) {
  const idx = toasts.value.findIndex(t => t.id === id);
  if (idx !== -1) toasts.value.splice(idx, 1);
}

defineExpose({ addToast });
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 280px;
  max-width: 400px;
  pointer-events: all;
  box-shadow: var(--shadow-lg);
  border: 1px solid transparent;
}
.toast-icon { font-size: 1rem; }
.toast-message { flex: 1; color: var(--text-primary); }
.toast-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color var(--transition);
}
.toast-close:hover { color: var(--text-primary); }

.toast--success { background: #0f2a1e; border-color: rgba(16,185,129,0.3); }
.toast--error   { background: #2a0f17; border-color: rgba(244,63,94,0.3); }
.toast--warning { background: #2a1e0f; border-color: rgba(245,158,11,0.3); }
.toast--info    { background: #0f1e2a; border-color: rgba(6,182,212,0.3); }

/* Transition */
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(100%); }
.toast-leave-to     { opacity: 0; transform: translateX(100%); }
</style>
