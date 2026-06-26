<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Infrastructure health & operations overview</p>
      </div>
      <button class="btn btn-ghost" @click="loadAll" :disabled="loading">
        <RefreshCw :size="16" class="mr-2" :class="{ 'animate-spin': loading }" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid" v-if="summary">
      <StatCard label="Total Assets"  :value="summary.totalAssets  || 0" :icon="MonitorIcon"  color="info"    sub="All infrastructure" />
      <StatCard label="Active Assets" :value="summary.activeAssets || 0" :icon="CheckCircleIcon"  color="success" sub="Currently running" />
      <StatCard label="Total Tickets" :value="summary.totalTickets || 0" :icon="TicketIcon"  color="primary" sub="All time" />
      <StatCard label="Open Tickets"  :value="summary.openTickets  || 0" :icon="UnlockIcon"  color="warning" sub="Needs attention" />
    </div>
    <div v-else-if="loading" class="stats-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Grid: Assets Breakdown + Tickets Breakdown -->
    <div class="dashboard-grid">
      <!-- Asset Status -->
      <div class="card">
        <h3 class="card-title">Assets by Status</h3>
        <div v-if="assetData" class="breakdown-list">
          <div v-for="item in assetStatusList" :key="item.label" class="breakdown-item">
            <div class="breakdown-info">
              <span class="breakdown-dot" :class="item.dotClass"></span>
              <span class="breakdown-label">{{ item.label }}</span>
            </div>
            <div class="breakdown-right">
              <div class="breakdown-bar-wrap">
                <div
                  class="breakdown-bar"
                  :class="item.barClass"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
              <span class="breakdown-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state"><div class="empty-state-icon"><BarChart3 :size="32" /></div><p>No asset data</p></div>
      </div>

      <!-- Ticket Priority -->
      <div class="card">
        <h3 class="card-title">Tickets by Priority</h3>
        <div v-if="ticketData" class="breakdown-list">
          <div v-for="item in ticketPriorityList" :key="item.label" class="breakdown-item">
            <div class="breakdown-info">
              <span class="breakdown-dot" :class="item.dotClass"></span>
              <span class="breakdown-label">{{ item.label }}</span>
            </div>
            <div class="breakdown-right">
              <div class="breakdown-bar-wrap">
                <div
                  class="breakdown-bar"
                  :class="item.barClass"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
              <span class="breakdown-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state"><div class="empty-state-icon"><Ticket :size="32" /></div><p>No ticket data</p></div>
      </div>

      <!-- Health Panel -->
      <div class="card health-card">
        <h3 class="card-title">System Health</h3>
        <div v-if="health" class="health-grid">
          <div class="health-item">
            <span class="health-label">Status</span>
            <span
              class="badge"
              :class="health.status === 'UP' ? 'badge-success' : 'badge-danger'"
            >{{ health.status || 'Unknown' }}</span>
          </div>
          <div v-for="(val, key) in healthComponents" :key="key" class="health-item">
            <span class="health-label">{{ formatKey(key) }}</span>
            <span class="badge" :class="val === 'UP' ? 'badge-success' : 'badge-warning'">{{ val }}</span>
          </div>
        </div>
        <div v-else-if="loading" class="skeleton-health"></div>
        <div v-else class="empty-state"><div class="empty-state-icon"><HeartPulse :size="32" /></div><p>Health data unavailable</p></div>
      </div>

      <!-- Ticket Status -->
      <div class="card">
        <h3 class="card-title">Tickets by Status</h3>
        <div v-if="ticketData" class="breakdown-list">
          <div v-for="item in ticketStatusList" :key="item.label" class="breakdown-item">
            <div class="breakdown-info">
              <span class="breakdown-dot" :class="item.dotClass"></span>
              <span class="breakdown-label">{{ item.label }}</span>
            </div>
            <div class="breakdown-right">
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" :class="item.barClass" :style="{ width: `${item.percent}%` }"></div>
              </div>
              <span class="breakdown-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state"><div class="empty-state-icon"><ClipboardList :size="32" /></div><p>No status data</p></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import dashboardService from '../services/dashboardService';
import StatCard from '../components/StatCard.vue';
import { Monitor as MonitorIcon, CheckCircle as CheckCircleIcon, Ticket as TicketIcon, Unlock as UnlockIcon, BarChart3, Ticket, HeartPulse, ClipboardList, RefreshCw } from 'lucide-vue-next';

const summary = ref(null);
const assetData = ref(null);
const ticketData = ref(null);
const health = ref(null);
const loading = ref(false);

function makeBreakdown(obj, keys, dotClasses, barClasses) {
  if (!obj) return [];
  const total = keys.reduce((s, k) => s + (obj[k] || 0), 0) || 1;
  return keys.map((k, i) => ({
    label: k.replace(/([A-Z])/g, ' $1').replace(/^by /, '').trim(),
    value: obj[k] || 0,
    percent: Math.round(((obj[k] || 0) / total) * 100),
    dotClass: dotClasses[i],
    barClass: barClasses[i],
  }));
}

const assetStatusList = computed(() => {
  if (!assetData.value) return [];
  const d = assetData.value;
  const keys = Object.keys(d).filter(k => ['ACTIVE','INACTIVE','MAINTENANCE'].includes(k));
  if (keys.length) {
    const total = keys.reduce((s,k) => s + (d[k]||0), 0) || 1;
    return keys.map(k => ({
      label: k,
      value: d[k] || 0,
      percent: Math.round(((d[k]||0)/total)*100),
      dotClass: k === 'ACTIVE' ? 'dot-success' : k === 'INACTIVE' ? 'dot-muted' : 'dot-warning',
      barClass: k === 'ACTIVE' ? 'bar-success' : k === 'INACTIVE' ? 'bar-muted' : 'bar-warning',
    }));
  }
  return Object.entries(d).slice(0, 5).map(([k,v]) => ({
    label: k, value: v, percent: 0, dotClass: 'dot-info', barClass: 'bar-info'
  }));
});

const ticketPriorityList = computed(() => {
  if (!ticketData.value) return [];
  const d = ticketData.value;
  const keys = ['CRITICAL','HIGH','MEDIUM','LOW'].filter(k => k in d);
  const total = keys.reduce((s,k)=>s+(d[k]||0),0)||1;
  const dotMap = { CRITICAL:'dot-danger', HIGH:'dot-warning', MEDIUM:'dot-info', LOW:'dot-muted' };
  const barMap = { CRITICAL:'bar-danger', HIGH:'bar-warning', MEDIUM:'bar-info', LOW:'bar-muted' };
  return keys.map(k => ({ label:k, value:d[k]||0, percent:Math.round(((d[k]||0)/total)*100), dotClass:dotMap[k], barClass:barMap[k] }));
});

const ticketStatusList = computed(() => {
  if (!ticketData.value) return [];
  const d = ticketData.value;
  const keys = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].filter(k => k in d);
  const total = keys.reduce((s,k)=>s+(d[k]||0),0)||1;
  const dotMap = { OPEN:'dot-danger', IN_PROGRESS:'dot-info', RESOLVED:'dot-success', CLOSED:'dot-muted' };
  const barMap = { OPEN:'bar-danger', IN_PROGRESS:'bar-info', RESOLVED:'bar-success', CLOSED:'bar-muted' };
  return keys.map(k => ({ label:k.replace('_',' '), value:d[k]||0, percent:Math.round(((d[k]||0)/total)*100), dotClass:dotMap[k], barClass:barMap[k] }));
});

const healthComponents = computed(() => {
  if (!health.value?.components) return {};
  return Object.fromEntries(
    Object.entries(health.value.components).map(([k,v]) => [k, v?.status || v])
  );
});

function formatKey(k) {
  return k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
}

async function loadAll() {
  loading.value = true;
  try {
    const [s, a, t, h] = await Promise.allSettled([
      dashboardService.getSummary(),
      dashboardService.getAssets(),
      dashboardService.getTickets(),
      dashboardService.getHealth(),
    ]);
    if (s.status === 'fulfilled') summary.value = s.value.data;
    if (a.status === 'fulfilled') assetData.value = a.value.data;
    if (t.status === 'fulfilled') ticketData.value = t.value.data;
    if (h.status === 'fulfilled') health.value = h.value.data;
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .stats-grid { grid-template-columns: 1fr; } }

.skeleton-card {
  height: 120px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; } 50% { opacity: 0.5; }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

/* Breakdown */
.breakdown-list { display: flex; flex-direction: column; gap: 14px; }
.breakdown-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.breakdown-info { display: flex; align-items: center; gap: 8px; min-width: 110px; }
.breakdown-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0;
}
.dot-success { background: var(--color-success); }
.dot-warning { background: var(--color-warning); }
.dot-danger  { background: var(--color-danger);  }
.dot-info    { background: var(--color-info);    }
.dot-muted   { background: var(--text-muted);    }
.breakdown-label { font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); }
.breakdown-right { display: flex; align-items: center; gap: 10px; flex: 1; }
.breakdown-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.07);
  border-radius: 10px;
  overflow: hidden;
}
.breakdown-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bar-success { background: var(--color-success); }
.bar-warning { background: var(--color-warning); }
.bar-danger  { background: var(--color-danger);  }
.bar-info    { background: var(--color-info);    }
.bar-muted   { background: var(--text-muted);    }
.breakdown-value { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); min-width: 24px; text-align: right; }

/* Health */
.health-grid { display: flex; flex-direction: column; gap: 12px; }
.health-item { display: flex; align-items: center; justify-content: space-between; }
.health-label { font-size: 0.85rem; color: var(--text-secondary); }
.skeleton-health { height: 120px; background: rgba(255,255,255,0.04); border-radius: var(--radius-md); animation: pulse 1.5s ease-in-out infinite; }
</style>
