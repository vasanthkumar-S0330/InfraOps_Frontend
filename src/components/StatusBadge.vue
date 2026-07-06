<template>
  <span class="status-badge" :class="statusClass">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const statusClass = computed(() => {
  const s = props.status.toUpperCase();
  if (['UP', 'OK', 'RUNNING'].includes(s)) return 'status-up';
  if (['DOWN', 'CRITICAL', 'STOPPED', 'FAILED'].includes(s)) return 'status-down';
  if (['WARNING', 'MAINTENANCE'].includes(s)) return 'status-warning';
  return 'status-unknown';
});
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-up {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-unknown {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}
</style>
