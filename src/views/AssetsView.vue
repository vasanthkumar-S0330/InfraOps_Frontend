<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Assets</h1>
        <p class="page-subtitle">Manage your infrastructure assets</p>
      </div>
      <button id="create-asset-btn" class="btn btn-primary" @click="openCreate">
        + New Asset
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-icon"><Search :size="14" /></span>
        <input
          v-model="searchQuery"
          class="form-control search-input"
          placeholder="Search assets..."
          @input="onSearch"
        />
      </div>
      <select v-model="sortBy" class="form-control toolbar-select" @change="loadAssets">
        <option value="createdAt">Sort: Date</option>
        <option value="name">Sort: Name</option>
        <option value="type">Sort: Type</option>
        <option value="status">Sort: Status</option>
      </select>
      <select v-model="sortDir" class="form-control toolbar-select" @change="loadAssets">
        <option value="desc">↓ Desc</option>
        <option value="asc">↑ Asc</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="store.loading" class="table-loading">
        <div class="spinner"></div>
        <span>Loading assets...</span>
      </div>

      <div v-else-if="store.assets.length === 0" class="empty-state">
        <div class="empty-state-icon"><Monitor :size="32" /></div>
        <h3>No assets found</h3>
        <p>Create your first asset to get started.</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>IP Address</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in store.assets" :key="asset.id" class="table-row">
            <td class="td-name">
              <span class="asset-type-icon"><component :is="typeIcon(asset.type)" :size="16" /></span>
              {{ asset.name }}
            </td>
            <td><span class="badge badge-muted">{{ asset.type }}</span></td>
            <td class="td-mono">{{ asset.ipAddress || '—' }}</td>
            <td>{{ asset.location || '—' }}</td>
            <td><span class="badge" :class="statusBadge(asset.status)">{{ asset.status }}</span></td>
            <td class="td-actions">
              <button class="btn btn-ghost btn-sm" @click="openEdit(asset)" title="Edit"><Pencil :size="14" /></button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(asset)" title="Delete"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.pagination.totalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="store.pagination.page === 0" @click="goPage(store.pagination.page - 1)">← Prev</button>
        <span class="page-info">
          Page {{ store.pagination.page + 1 }} of {{ store.pagination.totalPages }}
          <span class="text-muted">({{ store.pagination.totalElements }} total)</span>
        </span>
        <button class="btn btn-ghost btn-sm" :disabled="store.pagination.page >= store.pagination.totalPages - 1" @click="goPage(store.pagination.page + 1)">Next →</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="editingAsset ? 'Edit Asset' : 'New Asset'" :icon="editingAsset ? Pencil : Monitor">
      <form id="asset-form" @submit.prevent="submitAsset" class="modal-form">
        <div class="form-group">
          <label class="form-label">Name *</label>
          <input v-model="form.name" class="form-control" placeholder="e.g. Production Server 01" required />
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select v-model="form.type" class="form-control" required>
              <option disabled value="">Select type</option>
              <option v-for="t in assetTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status *</label>
            <select v-model="form.status" class="form-control" required>
              <option disabled value="">Select status</option>
              <option v-for="s in assetStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">IP Address *</label>
            <input v-model="form.ipAddress" class="form-control" placeholder="192.168.1.100" required />
          </div>
          <div class="form-group">
            <label class="form-label">Location *</label>
            <input v-model="form.location" class="form-control" placeholder="Data Center A" required />
          </div>
        </div>
        <div v-if="formError" class="auth-error flex items-center gap-1" style="margin-top:4px"><AlertTriangle :size="16" /> {{ formError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-ghost" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" form="asset-form" type="submit" :disabled="submitting">
          <span v-if="submitting" class="spinner"></span>
          {{ editingAsset ? 'Save Changes' : 'Create Asset' }}
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model="showConfirm"
      title="Delete Asset"
      :message="`Are you sure you want to delete '${assetToDelete?.name}'? This cannot be undone.`"
      :loading="submitting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { useAssetStore } from '../stores/assets';
import BaseModal from '../components/BaseModal.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { Search, Monitor, Pencil, Trash2, AlertTriangle, Server, Network, Database, HardDrive, Shield, GitMerge, Router, Cloud, Wrench } from 'lucide-vue-next';

const store = useAssetStore();
const toast = inject('toast');

const searchQuery = ref('');
const sortBy = ref('createdAt');
const sortDir = ref('desc');
const showModal = ref(false);
const showConfirm = ref(false);
const editingAsset = ref(null);
const assetToDelete = ref(null);
const submitting = ref(false);
const formError = ref('');
let searchTimer = null;

const assetTypes = ['SERVER', 'NETWORK', 'DATABASE', 'STORAGE', 'FIREWALL', 'SWITCH', 'ROUTER', 'VM', 'OTHER'];
const assetStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

const form = reactive({ name: '', type: '', ipAddress: '', location: '', status: '' });

function typeIcon(type) {
  const map = { SERVER: Server, NETWORK: Network, DATABASE: Database, STORAGE: HardDrive, FIREWALL: Shield, SWITCH: GitMerge, ROUTER: Router, VM: Cloud };
  return map[type] || Wrench;
}
function statusBadge(s) {
  return { ACTIVE:'badge-success', INACTIVE:'badge-muted', MAINTENANCE:'badge-warning' }[s] || 'badge-muted';
}

async function loadAssets(page = 0) {
  await store.fetchAssets(page, 10, sortBy.value, sortDir.value);
}
function goPage(page) { loadAssets(page); }

function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (searchQuery.value.trim()) store.searchAssets(searchQuery.value.trim());
    else loadAssets();
  }, 400);
}

function openCreate() {
  editingAsset.value = null;
  Object.assign(form, { name:'', type:'', ipAddress:'', location:'', status:'' });
  formError.value = '';
  showModal.value = true;
}
function openEdit(asset) {
  editingAsset.value = asset;
  Object.assign(form, { name: asset.name, type: asset.type, ipAddress: asset.ipAddress || '', location: asset.location || '', status: asset.status });
  formError.value = '';
  showModal.value = true;
}

function buildAssetPayload() {
  // Strip empty strings — backend uses @NotBlank / enum deserialization
  // which rejects empty string values
  const payload = {};
  if (form.name)      payload.name = form.name;
  if (form.type)      payload.type = form.type;
  if (form.status)    payload.status = form.status;
  if (form.ipAddress) payload.ipAddress = form.ipAddress;
  if (form.location)  payload.location = form.location;
  return payload;
}

async function submitAsset() {
  formError.value = '';
  submitting.value = true;
  try {
    const payload = buildAssetPayload();
    if (editingAsset.value) {
      await store.updateAsset(editingAsset.value.id, payload);
      toast?.success('Asset updated successfully!');
    } else {
      await store.createAsset(payload);
      toast?.success('Asset created successfully!');
    }
    showModal.value = false;
  } catch (e) {
    formError.value = store.error || 'Operation failed.';
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(asset) {
  assetToDelete.value = asset;
  showConfirm.value = true;
}
async function doDelete() {
  submitting.value = true;
  try {
    await store.deleteAsset(assetToDelete.value.id);
    toast?.success('Asset deleted.');
    showConfirm.value = false;
  } catch {
    toast?.error('Failed to delete asset.');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => loadAssets());
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: center;
}
.search-wrap { position: relative; flex: 1; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; pointer-events: none; }
.search-input { padding-left: 36px; }
.toolbar-select { width: auto; min-width: 120px; }

.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-secondary);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.data-table thead {
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--color-border);
}
.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}
.table-row {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition);
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--color-surface-hover); }
.data-table td { padding: 14px 16px; color: var(--text-primary); }
.td-name { display: flex; align-items: center; gap: 10px; font-weight: 500; }
.asset-type-icon { font-size: 1rem; }
.td-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-secondary); }
.td-actions { display: flex; gap: 6px; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}
.page-info { font-size: 0.85rem; color: var(--text-secondary); }

.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.auth-error {
  padding: 10px 14px;
  background: var(--color-danger-dim);
  border: 1px solid rgba(244,63,94,0.25);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
