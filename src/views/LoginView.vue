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

          <div class="oauth-divider">
            <span>OR</span>
          </div>

          <div class="oauth-buttons">
            <a :href="googleOAuthUrl" class="btn btn-outline oauth-btn">
              <svg class="oauth-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
              Sign in with Google
            </a>
            <a :href="githubOAuthUrl" class="btn btn-outline oauth-btn">
              <Github class="oauth-icon" />
              Sign in with GitHub
            </a>
          </div>
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
          
          <div class="oauth-divider">
            <span>OR</span>
          </div>

          <div class="oauth-buttons">
            <a :href="googleOAuthUrl" class="btn btn-outline oauth-btn">
              <svg class="oauth-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
              Sign up with Google
            </a>
            <a :href="githubOAuthUrl" class="btn btn-outline oauth-btn">
              <Github class="oauth-icon" />
              Sign up with GitHub
            </a>
          </div>
        </form>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { Zap, Eye, EyeOff, AlertTriangle, CheckCircle, Github } from 'lucide-vue-next';

const mode = ref('login');
const showPassword = ref(false);
const showRegPassword = ref(false);
const registerSuccess = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const baseUrl = apiUrl.replace('/api', '');

const googleOAuthUrl = `${baseUrl}/oauth2/authorization/google`;
const githubOAuthUrl = `${baseUrl}/oauth2/authorization/github`;

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

.oauth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}
.oauth-divider span {
  padding: 0 10px;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all var(--transition);
}
.oauth-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-border-strong);
}
.oauth-icon {
  width: 18px;
  height: 18px;
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
