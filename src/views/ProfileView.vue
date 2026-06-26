<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">View and update your account details</p>
      </div>
    </div>

    <div class="profile-layout">
      <!-- Profile Card -->
      <div class="card profile-card">
        <div class="profile-avatar">{{ userInitials }}</div>
        <div class="profile-name">{{ authStore.fullName || '—' }}</div>
        <div class="profile-email">{{ authStore.user?.email }}</div>
        <span class="badge mt-badge" :class="authStore.user?.role === 'ADMIN' ? 'badge-primary' : 'badge-info'">
          {{ authStore.user?.role }}
        </span>
        <div class="profile-meta" v-if="authStore.user?.createdAt">
          <span class="text-muted text-sm">Member since {{ formatDate(authStore.user.createdAt) }}</span>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="card edit-card">
        <h3 class="edit-title">Update Profile</h3>
        <p class="edit-subtitle">Update your display name. Email and role can only be changed by an admin.</p>

        <form @submit.prevent="handleUpdate" class="edit-form">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input id="profile-firstname" v-model="form.firstName" class="form-control" placeholder="John" required />
            </div>
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input id="profile-lastname" v-model="form.lastName" class="form-control" placeholder="Doe" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email (read-only)</label>
            <input class="form-control" :value="authStore.user?.email" disabled />
          </div>
          <div class="form-group">
            <label class="form-label">Role (read-only)</label>
            <input class="form-control" :value="authStore.user?.role" disabled />
          </div>

          <div v-if="successMsg" class="msg-success flex items-center gap-1"><CheckCircle :size="16" /> {{ successMsg }}</div>
          <div v-if="errorMsg" class="msg-error flex items-center gap-1"><AlertTriangle :size="16" /> {{ errorMsg }}</div>

          <button id="save-profile-btn" type="submit" class="btn btn-primary" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="spinner"></span>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { CheckCircle, AlertTriangle } from 'lucide-vue-next';

const authStore = useAuthStore();
const successMsg = ref('');
const errorMsg = ref('');

const form = reactive({ firstName: '', lastName: '' });

const userInitials = computed(() => {
  const u = authStore.user;
  if (!u) return '?';
  if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  return u.email?.[0]?.toUpperCase() || '?';
});

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function loadForm() {
  form.firstName = authStore.user?.firstName || '';
  form.lastName = authStore.user?.lastName || '';
}

async function handleUpdate() {
  successMsg.value = '';
  errorMsg.value = '';
  try {
    await authStore.updateProfile({ firstName: form.firstName, lastName: form.lastName });
    successMsg.value = 'Profile updated successfully!';
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch {
    errorMsg.value = authStore.error || 'Update failed.';
  }
}

onMounted(async () => {
  await authStore.fetchProfile();
  loadForm();
});
</script>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
}
@media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 36px 24px;
}
.profile-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-violet));
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 800;
  margin-bottom: 8px;
  box-shadow: 0 0 24px rgba(99,102,241,0.35);
}
.profile-name { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.profile-email { font-size: 0.85rem; color: var(--text-secondary); }
.mt-badge { margin-top: 4px; }
.profile-meta { margin-top: 8px; }

.edit-card { padding: 32px; }
.edit-title { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
.edit-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6; }
.edit-form { display: flex; flex-direction: column; gap: 16px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-control:disabled { opacity: 0.5; cursor: not-allowed; }

.msg-success {
  padding: 10px 14px;
  background: var(--color-success-dim);
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-size: 0.85rem;
}
.msg-error {
  padding: 10px 14px;
  background: var(--color-danger-dim);
  border: 1px solid rgba(244,63,94,0.25);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
