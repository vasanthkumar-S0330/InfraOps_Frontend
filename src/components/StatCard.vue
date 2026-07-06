<template>
  <div class="stat-card" :class="[`stat-card--${color}`, { 'stat-card--compact': compact }]">
    <div class="stat-card__header">
      <span class="stat-card__icon">
        <component :is="icon" v-if="typeof icon === 'object' || typeof icon === 'function'" :size="compact ? 18 : 24" />
        <template v-else>{{ icon }}</template>
      </span>
      <span class="stat-card__label">{{ label }}</span>
    </div>
    <div class="stat-card__value">{{ animatedValue }}{{ suffix }}</div>
    <div v-if="sub" class="stat-card__sub">{{ sub }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  icon: { type: [String, Object, Function], default: '📊' },
  color: { type: String, default: 'primary' }, // primary | success | warning | danger | info
  sub: { type: String, default: '' },
  suffix: { type: String, default: '' },
  compact: { type: Boolean, default: false },
});

const animatedValue = ref(0);

function animateTo(target) {
  const start = animatedValue.value;
  const diff = target - start;
  const duration = 800;
  const startTime = performance.now();
  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    animatedValue.value = Math.round(start + diff * ease);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

onMounted(() => animateTo(props.value));
watch(() => props.value, (val) => animateTo(val));
</script>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
  cursor: default;
}

.stat-card--compact {
  padding: 10px 8px;
  gap: 4px;
  align-items: center;
  text-align: center;
}

.stat-card--compact .stat-card__header {
  flex-direction: column;
  gap: 4px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}
.stat-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stat-card__icon {
  font-size: 1.4rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}
.stat-card__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.stat-card__value {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.stat-card__sub {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.stat-card--compact .stat-card__icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}
.stat-card--compact .stat-card__label {
  font-size: 0.65rem;
  line-height: 1.1;
  text-align: center;
}
.stat-card--compact .stat-card__value {
  font-size: 1.25rem;
}

/* Color variants */
.stat-card--primary .stat-card__icon { background: var(--color-primary-dim); }
.stat-card--primary .stat-card__value { color: var(--color-primary); }
.stat-card--success .stat-card__icon { background: var(--color-success-dim); }
.stat-card--success .stat-card__value { color: var(--color-success); }
.stat-card--warning .stat-card__icon { background: var(--color-warning-dim); }
.stat-card--warning .stat-card__value { color: var(--color-warning); }
.stat-card--danger  .stat-card__icon { background: var(--color-danger-dim); }
.stat-card--danger  .stat-card__value { color: var(--color-danger); }
.stat-card--info    .stat-card__icon { background: var(--color-info-dim); }
.stat-card--info    .stat-card__value { color: var(--color-info); }
</style>
