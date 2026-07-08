<template>
  <div class="oauth-redirect">
    <div class="loader-container">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;
  if (token) {
    // We assume your authStore has a way to handle a token directly,
    // or we can set it and fetch profile.
    // Looking at common authStore patterns, we save token and fetch user.
    localStorage.setItem('token', token);
    authStore.token = token;
    
    try {
      await authStore.fetchProfile();
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to fetch profile after OAuth login:', err);
      router.push('/login');
    }
  } else {
    router.push('/login');
  }
});
</script>

<style scoped>
.oauth-redirect {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--color-bg);
  color: var(--text-primary);
}
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
