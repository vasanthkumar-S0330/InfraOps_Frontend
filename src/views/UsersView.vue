<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Admin — Manage system users</p>
      </div>
      <button id="create-user-btn" class="btn btn-primary" @click="openCreate">+ New User</button>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-icon"><Search :size="14" /></span>
        <input v-model="emailFilter" class="form-control search-input" placeholder="Search by email..." @input="onSearch" />
      </div>
      <select v-model="sortDir" class="form-control toolbar-select" @change="loadUsers">
        <option value="asc">↑ A–Z</option>
        <option value="desc">↓ Z–A</option>
      </select>
    </div>

    <div class="table-card">
      <div v-if="store.loading" class="table-loading">
        <div class="spinner"></div> Loading users...
      </div>
      <div v-else-if="store.users.length === 0" class="empty-state">
        <div class="empty-state-icon"><Users :size="32" /></div>
        <h3>No users found</h3>
        <p>Create the first user account.</p>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id" class="table-row">
            <td class="td-user">
              <div class="user-avatar-sm">{{ initials(user) }}</div>
              <span class="font-medium">{{ user.firstName }} {{ user.lastName }}</span>
            </td>
            <td class="text-muted text-sm">{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.role === 'ADMIN' ? 'badge-primary' : 'badge-info'">{{ user.role }}</span>
            </td>
            <td class="text-muted text-sm">{{ formatDate(user.createdAt) }}</td>
            <td class="td-actions">
              <button class="btn btn-ghost btn-sm" @click="openEdit(user)"><Pencil :size="14" /></button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(user)"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="store.pagination.totalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="store.pagination.page === 0" @click="goPage(store.pagination.page - 1)">← Prev</button>
        <span class="page-info">Page {{ store.pagination.page + 1 }} of {{ store.pagination.totalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="store.pagination.page >= store.pagination.totalPages - 1" @click="goPage(store.pagination.page + 1)">Next →</button>
      </div>
    </div>

    <BaseModal v-model="showModal" :title="editingUser ? 'Edit User' : 'Create User'" :icon="editingUser ? Pencil : User">
      <form id="user-form" @submit.prevent="submitUser" class="modal-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input v-model="form.firstName" class="form-control" placeholder="John" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name *</label>
            <input v-model="form.lastName" class="form-control" placeholder="Doe" required />
          </div>
        </div>
        <div v-if="!editingUser" class="form-group">
          <label class="form-label">Email *</label>
          <input v-model="form.email" class="form-control" type="email" placeholder="john@company.com" required />
        </div>
        <div v-if="!editingUser" class="form-group">
          <label class="form-label">Password *</label>
          <input v-model="form.password" class="form-control" type="password" placeholder="Minimum 8 characters" required />
        </div>
        <div class="form-group">
          <label class="form-label">Role *</label>
          <select v-model="form.role" class="form-control" required>
            <option disabled value="">Select role</option>
            <option value="ENGINEER">Engineer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div v-if="formError" class="form-error flex items-center gap-1"><AlertTriangle :size="16" /> {{ formError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-ghost" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" form="user-form" type="submit" :disabled="submitting">
          <span v-if="submitting" class="spinner"></span>
          {{ editingUser ? 'Save Changes' : 'Create User' }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showConfirm"
      title="Delete User"
      :message="`Delete user '${userToDelete?.firstName} ${userToDelete?.lastName}'? This cannot be undone.`"
      :loading="submitting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { useUserStore } from '../stores/users';
import BaseModal from '../components/BaseModal.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { Search, Users, Pencil, Trash2, User, AlertTriangle } from 'lucide-vue-next';

const store = useUserStore();
const toast = inject('toast');
const showModal = ref(false);
const showConfirm = ref(false);
const editingUser = ref(null);
const userToDelete = ref(null);
const submitting = ref(false);
const formError = ref('');
const emailFilter = ref('');
const sortDir = ref('asc');
let searchTimer = null;
const form = reactive({ firstName:'', lastName:'', email:'', password:'', role:'' });

function initials(u) { return `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase()||'?'; }
function formatDate(ts) { if(!ts)return'—'; return new Date(ts).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
async function loadUsers(page=0) { await store.fetchUsers(page,10,'firstName',sortDir.value,emailFilter.value); }
function goPage(p) { loadUsers(p); }
function onSearch() { clearTimeout(searchTimer); searchTimer=setTimeout(()=>loadUsers(),400); }
function openCreate() { editingUser.value=null; Object.assign(form,{firstName:'',lastName:'',email:'',password:'',role:''}); formError.value=''; showModal.value=true; }
function openEdit(user) { editingUser.value=user; Object.assign(form,{firstName:user.firstName,lastName:user.lastName,email:'',password:'',role:user.role}); formError.value=''; showModal.value=true; }
async function submitUser() {
  formError.value=''; submitting.value=true;
  try {
    if(editingUser.value){ await store.updateUser(editingUser.value.id,{firstName:form.firstName,lastName:form.lastName,role:form.role}); toast?.success('User updated!'); }
    else { await store.createUser({...form}); toast?.success('User created!'); }
    showModal.value=false;
  } catch { formError.value=store.error||'Operation failed.'; }
  finally { submitting.value=false; }
}
function confirmDelete(user) { userToDelete.value=user; showConfirm.value=true; }
async function doDelete() {
  submitting.value=true;
  try { await store.deleteUser(userToDelete.value.id); toast?.success('User deleted.'); showConfirm.value=false; }
  catch { toast?.error('Failed to delete user.'); }
  finally { submitting.value=false; }
}
onMounted(()=>loadUsers());
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-wrap { position: relative; flex: 1; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; pointer-events: none; }
.search-input { padding-left: 36px; }
.toolbar-select { width: auto; min-width: 120px; }
.table-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.table-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: var(--text-secondary); }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table thead { background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--color-border); }
.data-table th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
.table-row { border-bottom: 1px solid var(--color-border); transition: background var(--transition); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--color-surface-hover); }
.data-table td { padding: 14px 16px; color: var(--text-primary); vertical-align: middle; }
.td-user { display: flex; align-items: center; gap: 10px; }
.user-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-violet)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
.td-actions { display: flex; gap: 6px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--color-border); }
.page-info { font-size: 0.85rem; color: var(--text-secondary); }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error { padding: 10px 14px; background: var(--color-danger-dim); border: 1px solid rgba(244,63,94,0.25); border-radius: var(--radius-md); color: var(--color-danger); font-size: 0.85rem; }
</style>
