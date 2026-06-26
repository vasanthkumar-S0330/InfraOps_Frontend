<template>
  <BaseModal :modelValue="modelValue" :title="title" :icon="AlertTriangle" width="420px" @update:modelValue="$emit('update:modelValue', $event)">
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <button class="btn btn-ghost" @click="$emit('update:modelValue', false)">Cancel</button>
      <button class="btn btn-danger" :disabled="loading" @click="$emit('confirm')">
        <span v-if="loading" class="spinner"></span>
        {{ confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
import { AlertTriangle } from 'lucide-vue-next';

defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to proceed? This action cannot be undone.' },
  confirmLabel: { type: String, default: 'Delete' },
  loading: { type: Boolean, default: false },
});
defineEmits(['update:modelValue', 'confirm']);
</script>

<style scoped>
.confirm-message {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.9rem;
}
</style>
