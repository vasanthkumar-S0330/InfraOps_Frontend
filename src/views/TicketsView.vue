<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tickets</h1>
        <p class="page-subtitle">Track and manage support tickets</p>
      </div>
      <button id="create-ticket-btn" class="btn btn-primary" @click="openCreate">
        + New Ticket
      </button>
    </div>

    <!-- Filter Toolbar -->
    <div class="toolbar">
      <select v-model="filterStatus" class="form-control toolbar-select" @change="loadTickets">
        <option value="">All Statuses</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_',' ') }}</option>
      </select>
      <select v-model="filterPriority" class="form-control toolbar-select" @change="loadTickets">
        <option value="">All Priorities</option>
        <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
      </select>
      <select v-model="sortDir" class="form-control toolbar-select" @change="loadTickets">
        <option value="desc">↓ Newest First</option>
        <option value="asc">↑ Oldest First</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="store.loading" class="table-loading">
        <div class="spinner"></div> Loading tickets...
      </div>
      <div v-else-if="filteredTickets.length === 0" class="empty-state">
        <div class="empty-state-icon"><Ticket :size="32" /></div>
        <h3>No tickets found</h3>
        <p>Create a ticket to start tracking issues.</p>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Asset</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in filteredTickets" :key="ticket.id" class="table-row">
            <td class="td-title">
              <span class="priority-dot" :class="`dot-${ticket.priority?.toLowerCase()}`"></span>
              <span>{{ ticket.title }}</span>
            </td>
            <td><span class="badge" :class="priorityBadge(ticket.priority)">{{ ticket.priority }}</span></td>
            <td>
              <select
                :value="ticket.status"
                class="status-select"
                :class="`status-select--${ticket.status?.toLowerCase()}`"
                @change="changeStatus(ticket, $event.target.value)"
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_',' ') }}</option>
              </select>
            </td>
            <td class="text-muted text-sm">{{ ticket.assetId || '—' }}</td>
            <td class="text-muted text-sm">{{ formatDate(ticket.createdAt) }}</td>
            <td class="td-actions">
              <button class="btn btn-ghost btn-sm" @click="openEdit(ticket)"><Pencil :size="14" /></button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(ticket)"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.pagination.totalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="store.pagination.page === 0" @click="goPage(store.pagination.page - 1)">← Prev</button>
        <span class="page-info">Page {{ store.pagination.page + 1 }} of {{ store.pagination.totalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="store.pagination.page >= store.pagination.totalPages - 1" @click="goPage(store.pagination.page + 1)">Next →</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="editingTicket ? 'Edit Ticket' : 'New Ticket'" :icon="editingTicket ? Pencil : Ticket">
      <form id="ticket-form" @submit.prevent="submitTicket" class="modal-form">
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input v-model="form.title" class="form-control" placeholder="Brief description of the issue" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description *</label>
          <textarea v-model="form.description" class="form-control" rows="3" placeholder="Detailed description of the issue..." required></textarea>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Priority *</label>
            <select v-model="form.priority" class="form-control" required>
              <option disabled value="">Select priority</option>
              <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status *</label>
            <select v-model="form.status" class="form-control" required>
              <option disabled value="">Select status</option>
              <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_',' ') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Asset ID (optional)</label>
          <input v-model="form.assetId" class="form-control" placeholder="Link to an asset ID" />
        </div>
        <div v-if="formError" class="form-error flex items-center gap-1"><AlertTriangle :size="16" /> {{ formError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-ghost" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" form="ticket-form" type="submit" :disabled="submitting">
          <span v-if="submitting" class="spinner"></span>
          {{ editingTicket ? 'Save Changes' : 'Create Ticket' }}
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model="showConfirm"
      title="Delete Ticket"
      :message="`Delete '${ticketToDelete?.title}'? This cannot be undone.`"
      :loading="submitting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useTicketStore } from '../stores/tickets';
import BaseModal from '../components/BaseModal.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { Ticket, Pencil, Trash2, AlertTriangle } from 'lucide-vue-next';

const store = useTicketStore();
const toast = inject('toast');

const showModal = ref(false);
const showConfirm = ref(false);
const editingTicket = ref(null);
const ticketToDelete = ref(null);
const submitting = ref(false);
const formError = ref('');
const filterStatus = ref('');
const filterPriority = ref('');
const sortDir = ref('desc');

const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const form = reactive({ title: '', description: '', priority: '', status: 'OPEN', assetId: '' });

const filteredTickets = computed(() => {
  let list = store.tickets;
  if (filterStatus.value) list = list.filter(t => t.status === filterStatus.value);
  if (filterPriority.value) list = list.filter(t => t.priority === filterPriority.value);
  return list;
});

function priorityBadge(p) {
  return { CRITICAL:'badge-danger', HIGH:'badge-warning', MEDIUM:'badge-info', LOW:'badge-muted' }[p] || 'badge-muted';
}
function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

async function loadTickets(page = 0) {
  await store.fetchTickets(page, 10, 'createdAt', sortDir.value);
}
function goPage(page) { loadTickets(page); }

function openCreate() {
  editingTicket.value = null;
  Object.assign(form, { title:'', description:'', priority:'', status:'OPEN', assetId:'' });
  formError.value = '';
  showModal.value = true;
}
function openEdit(ticket) {
  editingTicket.value = ticket;
  Object.assign(form, { title: ticket.title, description: ticket.description || '', priority: ticket.priority, status: ticket.status, assetId: ticket.assetId || '' });
  formError.value = '';
  showModal.value = true;
}

function buildTicketPayload() {
  // Backend has @NotBlank on description and @NotNull on enums.
  // Never send empty strings for enum fields (causes 400 deserialization error).
  const payload = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    status: form.status,
  };
  // assetId is optional — only include if non-empty
  if (form.assetId && form.assetId.trim()) {
    payload.assetId = form.assetId.trim();
  }
  return payload;
}

async function submitTicket() {
  formError.value = '';
  submitting.value = true;
  try {
    const payload = buildTicketPayload();
    if (editingTicket.value) {
      await store.updateTicket(editingTicket.value.id, payload);
      toast?.success('Ticket updated!');
    } else {
      await store.createTicket(payload);
      toast?.success('Ticket created!');
    }
    showModal.value = false;
  } catch {
    formError.value = store.error || 'Operation failed.';
  } finally {
    submitting.value = false;
  }
}

async function changeStatus(ticket, newStatus) {
  await store.updateTicketStatus(ticket.id, newStatus);
  toast?.success('Status updated!');
}

function confirmDelete(ticket) {
  ticketToDelete.value = ticket;
  showConfirm.value = true;
}
async function doDelete() {
  submitting.value = true;
  try {
    await store.deleteTicket(ticketToDelete.value.id);
    toast?.success('Ticket deleted.');
    showConfirm.value = false;
  } catch {
    toast?.error('Failed to delete ticket.');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => loadTickets());
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.toolbar-select { width: auto; min-width: 140px; }

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
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table thead { background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--color-border); }
.data-table th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
.table-row { border-bottom: 1px solid var(--color-border); transition: background var(--transition); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--color-surface-hover); }
.data-table td { padding: 14px 16px; color: var(--text-primary); vertical-align: middle; }
.td-title { display: flex; align-items: center; gap: 10px; font-weight: 500; max-width: 300px; }
.priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-critical { background: var(--color-danger); box-shadow: 0 0 6px var(--color-danger); }
.dot-high     { background: var(--color-warning); }
.dot-medium   { background: var(--color-info); }
.dot-low      { background: var(--text-muted); }

/* Inline status select */
.status-select {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid transparent;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: all var(--transition);
}
.status-select--open        { background: var(--color-danger-dim);  color: var(--color-danger);  border-color: rgba(244,63,94,0.25); }
.status-select--in_progress { background: var(--color-info-dim);    color: var(--color-info);    border-color: rgba(6,182,212,0.25); }
.status-select--resolved    { background: var(--color-success-dim); color: var(--color-success); border-color: rgba(16,185,129,0.25); }
.status-select--closed      { background: rgba(139,148,158,0.12);  color: var(--text-secondary); border-color: rgba(139,148,158,0.2); }
.status-select option       { background: var(--color-bg-alt); color: var(--text-primary); }

.td-actions { display: flex; gap: 6px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--color-border); }
.page-info { font-size: 0.85rem; color: var(--text-secondary); }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
textarea.form-control { resize: vertical; min-height: 80px; }
.form-error { padding: 10px 14px; background: var(--color-danger-dim); border: 1px solid rgba(244,63,94,0.25); border-radius: var(--radius-md); color: var(--color-danger); font-size: 0.85rem; }
</style>
