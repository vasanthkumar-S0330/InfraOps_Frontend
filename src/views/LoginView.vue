<template>
  <div class="auth-page">
    <!-- Animated gradient background -->
    <div class="auth-bg">
      <div class="auth-blob auth-blob-1"></div>
      <div class="auth-blob auth-blob-2"></div>
      <div class="auth-blob auth-blob-3"></div>
    </div>

    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <span class="auth-logo-icon"><Zap :size="20" /></span>
        <span class="auth-logo-text">InfraOps</span>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >Sign In</button>
        <button
          class="auth-tab"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >Register</button>
      </div>

      <!-- Login Form -->
      <Transition name="tab-fade" mode="out-in">
        <form v-if="mode === 'login'" key="login" @submit.prevent="handleLogin" class="auth-form">
          <p class="auth-subtitle">Welcome back. Sign in to your account.</p>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              class="form-control"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <input
                id="login-password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
              <button type="button" class="input-toggle" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div v-if="authStore.error" class="auth-error">
            <AlertTriangle :size="16" /> {{ authStore.error }}
          </div>

          <button type="submit" class="btn btn-primary auth-submit" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="spinner"></span>
            <span>{{ authStore.loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-else key="register" @submit.prevent="handleRegister" class="auth-form">
          <p class="auth-subtitle">Create a new InfraOps account.</p>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input id="reg-firstname" v-model="registerForm.firstName" type="text" class="form-control" placeholder="John" required />
            </div>
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input id="reg-lastname" v-model="registerForm.lastName" type="text" class="form-control" placeholder="Doe" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input id="reg-email" v-model="registerForm.email" type="email" class="form-control" placeholder="you@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <input
                id="reg-password"
                v-model="registerForm.password"
                :type="showRegPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Min. 8 characters"
                required
              />
              <button type="button" class="input-toggle" @click="showRegPassword = !showRegPassword">
                <EyeOff v-if="showRegPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <select id="reg-role" v-model="registerForm.role" class="form-control" required>
              <option disabled value="">Select role</option>
              <option value="ENGINEER">Engineer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div v-if="authStore.error" class="auth-error">
            <AlertTriangle :size="16" /> {{ authStore.error }}
          </div>
          <div v-if="registerSuccess" class="auth-success">
            <CheckCircle :size="16" /> Account created! You can now sign in.
          </div>

          <button type="submit" class="btn btn-primary auth-submit" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="spinner"></span>
            <span>{{ authStore.loading ? 'Creating Account...' : 'Create Account' }}</span>
          </button>
        </form>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { Zap, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-vue-next';

const mode = ref('login');
const showPassword = ref(false);
const showRegPassword = ref(false);
const registerSuccess = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ firstName: '', lastName: '', email: '', password: '', role: '' });

const handleLogin = async () => {
  try {
    await authStore.login({ email: loginForm.email, password: loginForm.password });
    router.push('/dashboard');
  } catch { /* error shown in template */ }
};

const handleRegister = async () => {
  registerSuccess.value = false;
  try {
    await authStore.register(registerForm);
    registerSuccess.value = true;
    setTimeout(() => { mode.value = 'login'; registerSuccess.value = false; }, 2000);
  } catch { /* error shown in template */ }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
  background: var(--color-bg);
}

/* Blobs */
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.auth-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  animation: float 8s ease-in-out infinite;
}
.auth-blob-1 {
  width: 500px; height: 500px;
  background: var(--color-primary);
  top: -150px; left: -150px;
  animation-duration: 9s;
}
.auth-blob-2 {
  width: 400px; height: 400px;
  background: var(--color-violet);
  bottom: -100px; right: -100px;
  animation-duration: 11s; animation-delay: -3s;
}
.auth-blob-3 {
  width: 300px; height: 300px;
  background: var(--color-info);
  top: 50%; left: 60%;
  animation-duration: 7s; animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(20px, -20px) scale(1.05); }
  66%       { transform: translate(-15px, 15px) scale(0.95); }
}

/* Card */
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: 36px;
  box-shadow: var(--shadow-lg);
}

/* Logo */
.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}
.auth-logo-icon {
  font-size: 1.6rem;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-dim);
  border-radius: var(--radius-md);
}
.auth-logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Tabs */
.auth-tabs {
  display: flex;
  background: rgba(255,255,255,0.04);
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
}
.auth-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 7px;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}
.auth-tab.active {
  background: var(--color-primary);
  color: white;
}

/* Form */
.auth-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.input-wrapper {
  position: relative;
}
.input-wrapper .form-control {
  padding-right: 44px;
}
.input-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  border-radius: 4px;
  transition: opacity var(--transition);
  opacity: 0.7;
}
.input-toggle:hover { opacity: 1; }

.auth-error {
  padding: 10px 14px;
  background: var(--color-danger-dim);
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.auth-success {
  padding: 10px 14px;
  background: var(--color-success-dim);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.auth-submit {
  width: 100%;
  justify-content: center;
  padding: 12px;
  font-size: 0.95rem;
  margin-top: 4px;
}

/* Tab transition */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}
</style>
