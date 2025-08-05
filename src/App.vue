<script setup lang="ts">
const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/parents', label: 'Parents' },
  { to: '/students', label: 'Students' },
  { to: '/classes', label: 'Classes' },
  { to: '/subscriptions', label: 'Subscriptions' },
]
</script>

<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <RouterLink to="/" class="logo"> Student Management </RouterLink>

        <nav class="nav">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Simple Header */
.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
}

.logo:hover {
  color: #0066cc;
}

.nav {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: #666;
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-link.router-link-active {
  background: #0066cc;
  color: white;
}

/* Main Content */
.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 1rem;
    gap: 1rem;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
  }

  .nav-link {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .main {
    padding: 1rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.125rem;
  }

  .nav-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .main {
    padding: 0.75rem 0.5rem;
  }
}
</style>
