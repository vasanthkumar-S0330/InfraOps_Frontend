<template>
  <div class="monitoring-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Infrastructure Monitoring</h1>
        <p class="page-subtitle">Real-time status of servers, hosts, and services.</p>
      </div>
      <div class="header-actions">
        <div class="refresh-info">
          <span class="refresh-text">Auto-refresh: 30s</span>
          <span class="last-updated">Last updated: Just now</span>
        </div>
        <button class="btn btn-primary" @click="refreshData">
          <RefreshCw :size="16" class="icon" :class="{ 'spin': isRefreshing }" />
          Refresh Now
        </button>
      </div>
    </div>

    <!-- KPIs / Widgets -->
    <div class="kpi-grid">
      <StatCard label="Total Servers" :value="stats.totalServers" :icon="Server" color="primary" compact />
      <StatCard label="Active Servers" :value="stats.activeServers" :icon="CheckCircle" color="success" compact />
      <StatCard label="Offline Servers" :value="stats.offlineServers" :icon="XCircle" color="danger" compact />
      <StatCard label="Critical Alerts" :value="stats.criticalAlerts" :icon="AlertTriangle" color="danger" compact />
      <StatCard label="Warning Alerts" :value="stats.warningAlerts" :icon="AlertCircle" color="warning" compact />
      <StatCard label="Running Services" :value="stats.runningServices" :icon="Activity" color="success" compact />
      <StatCard label="Failed Services" :value="stats.failedServices" :icon="XOctagon" color="danger" compact />
      <StatCard label="Avg CPU Usage" :value="stats.avgCpu" suffix="%" :icon="Cpu" color="info" compact />
      <StatCard label="Avg Memory" :value="stats.avgMemory" suffix="%" :icon="Database" color="info" compact />
      <StatCard label="Avg Disk" :value="stats.avgDisk" suffix="%" :icon="HardDrive" color="info" compact />
    </div>

    <!-- Server List -->
    <div class="content-card mt-6">
      <div class="card-header">
        <h2 class="card-title">Server Status</h2>
        <div class="card-actions" style="display: flex; gap: 12px; align-items: center;">
          <input type="text" class="search-input" placeholder="Search servers..." v-model="searchQuery" />
          <button class="btn btn-primary" @click="showAddModal = true">
            <Plus :size="16" /> Add Server
          </button>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Server Name</th>
              <th>IP Address</th>
              <th>OS</th>
              <th>Status</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Disk</th>
              <th>Uptime</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="server in filteredServers" :key="server.id">
              <td>
                <div class="server-name-cell">
                  <Server :size="16" class="text-muted" />
                  <span class="font-medium">{{ server.name }}</span>
                </div>
              </td>
              <td class="text-muted">{{ server.ip }}</td>
              <td>{{ server.os }}</td>
              <td><StatusBadge :status="server.status" /></td>
              <td>
                <div class="resource-bar-container">
                  <span class="resource-text">{{ server.cpu }}%</span>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :class="getResourceClass(server.cpu)" :style="{ width: server.cpu + '%' }"></div>
                  </div>
                </div>
              </td>
              <td>
                <div class="resource-bar-container">
                  <span class="resource-text">{{ server.memory }}%</span>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :class="getResourceClass(server.memory)" :style="{ width: server.memory + '%' }"></div>
                  </div>
                </div>
              </td>
              <td>
                <div class="resource-bar-container">
                  <span class="resource-text">{{ server.disk }}%</span>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :class="getResourceClass(server.disk)" :style="{ width: server.disk + '%' }"></div>
                  </div>
                </div>
              </td>
              <td class="text-muted">{{ server.uptime }}</td>
            </tr>
            <tr v-if="filteredServers.length === 0">
              <td colspan="8" class="text-center py-8 text-muted">No servers found matching "{{ searchQuery }}"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Server Modal -->
    <BaseModal v-model="showAddModal" title="Add New Server" :icon="Server">
      <form id="add-server-form" @submit.prevent="addServer" class="modal-form">
        <div class="form-group">
          <label class="form-label">Server Name *</label>
          <input v-model="newServer.name" class="form-control" placeholder="e.g. Web Server 03" required />
        </div>
        <div class="form-group">
          <label class="form-label">IP Address *</label>
          <input v-model="newServer.ip" class="form-control" placeholder="e.g. 192.168.1.100" required />
        </div>
        <div class="form-group">
          <label class="form-label">Operating System *</label>
          <select v-model="newServer.os" class="form-control" required>
            <option disabled value="">Select OS</option>
            <option value="Ubuntu 22.04">Ubuntu 22.04</option>
            <option value="RHEL 8">RHEL 8</option>
            <option value="Debian 11">Debian 11</option>
            <option value="Alpine">Alpine Linux</option>
            <option value="Windows Server">Windows Server</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-ghost" @click="showAddModal = false">Cancel</button>
        <button class="btn btn-primary" form="add-server-form" type="submit">
          Add Server
        </button>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Server, CheckCircle, XCircle, AlertTriangle, AlertCircle, 
  Activity, XOctagon, Cpu, Database, HardDrive, RefreshCw, Plus
} from 'lucide-vue-next';
import StatCard from '../components/StatCard.vue';
import StatusBadge from '../components/StatusBadge.vue';
import BaseModal from '../components/BaseModal.vue';
import { useMonitoringStore } from '../stores/monitoring';

// Computed Data for KPIs based on real-time server data
const stats = computed(() => {
  const servers = store.servers;
  const total = servers.length;
  
  if (total === 0) {
    return {
      totalServers: 0,
      activeServers: 0,
      offlineServers: 0,
      criticalAlerts: 0,
      warningAlerts: 0,
      runningServices: 0,
      failedServices: 0,
      avgCpu: 0,
      avgMemory: 0,
      avgDisk: 0
    };
  }

  let active = 0;
  let offline = 0;
  let warning = 0;
  let cpuSum = 0;
  let memSum = 0;
  let diskSum = 0;

  servers.forEach(s => {
    if (s.status === 'UP') active++;
    else if (s.status === 'DOWN') offline++;
    else if (s.status === 'WARNING') warning++;
    
    cpuSum += s.cpu;
    memSum += s.memory;
    diskSum += s.disk;
  });

  return {
    totalServers: total,
    activeServers: active,
    offlineServers: offline,
    criticalAlerts: offline, 
    warningAlerts: warning,
    runningServices: active * 5, // dummy mock for services
    failedServices: offline * 2, // dummy mock for services
    avgCpu: Math.round(cpuSum / total),
    avgMemory: Math.round(memSum / total),
    avgDisk: Math.round(diskSum / total)
  };
});

const store = useMonitoringStore();

const searchQuery = ref('');
const isRefreshing = ref(false);
const showAddModal = ref(false);
let pollingInterval = null;

const newServer = ref({
  name: '',
  ip: '',
  os: ''
});

const filteredServers = computed(() => {
  if (!searchQuery.value) return store.servers;
  const q = searchQuery.value.toLowerCase();
  return store.servers.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.ip.includes(q) || 
    s.os.toLowerCase().includes(q) ||
    s.status.toLowerCase().includes(q)
  );
});

const refreshData = () => {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
};

const getResourceClass = (value) => {
  if (value >= 90) return 'bg-danger';
  if (value >= 75) return 'bg-warning';
  return 'bg-success';
};

const addServer = async () => {
  try {
    await store.addServer({
      name: newServer.value.name,
      ip: newServer.value.ip,
      os: newServer.value.os
    });
    showAddModal.value = false;
    newServer.value = { name: '', ip: '', os: '' };
  } catch (error) {
    alert("Failed to add server. Ensure backend is running.");
  }
};

onMounted(() => {
  store.fetchServers();
  // Poll every 10 seconds for real-time updates
  pollingInterval = setInterval(() => {
    store.fetchServers();
  }, 10000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<style scoped>
.monitoring-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.page-title { margin: 0 0 4px 0; font-size: 1.75rem; color: var(--text-primary); }
.page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.refresh-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.8rem;
}
.refresh-text { color: var(--color-primary); font-weight: 600; }
.last-updated { color: var(--text-muted); }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 12px;
}

.search-input {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--text-primary);
  width: 250px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.card-header .card-title {
  margin-bottom: 0;
}

.mt-6 { margin-top: 24px; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }

/* Table Spacing Adjustments */
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, 
.data-table td {
  padding: 6px 16px;
  vertical-align: middle;
  font-size: 0.85rem;
}
.data-table tbody tr {
  border-bottom: 1px solid var(--color-border);
}
.data-table tbody tr:last-child {
  border-bottom: none;
}

.server-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
}
.resource-text {
  font-size: 0.8rem;
  font-weight: 600;
  width: 35px;
  text-align: right;
}
.progress-bar-bg {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
.bg-success { background: #10b981; }
.bg-warning { background: #f59e0b; }
.bg-danger { background: #ef4444; }

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
