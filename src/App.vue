<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">
            <RouterLink to="/" class="title-link"> 📚 Student Management </RouterLink>
          </h1>
        </div>

        <nav class="main-nav">
          <RouterLink to="/" class="nav-link" exact-active-class="active"> 🏠 Home </RouterLink>
          <RouterLink to="/parents" class="nav-link" active-class="active"> 👨‍👩‍👧‍👦 Parents </RouterLink>
          <RouterLink to="/students" class="nav-link" active-class="active">
            🎓 Students
          </RouterLink>
          <RouterLink to="/classes" class="nav-link" active-class="active"> 📚 Classes </RouterLink>
          <RouterLink to="/subscriptions" class="nav-link" active-class="active">
            📋 Subscriptions
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 Student Management System. Built with Vue 3 & TypeScript.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 70px;
}

.logo-section {
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.title-link {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.title-link:hover {
  opacity: 0.9;
}

.main-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  opacity: 0.9;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  opacity: 1;
  font-weight: 600;
}

.app-main {
  flex: 1;
  background: #f8f9fa;
  min-height: calc(100vh - 70px - 60px); /* header height - footer height */
}

.app-footer {
  background: #2c3e50;
  color: white;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    min-height: auto;
    padding: 16px 20px;
  }

  .main-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 13px;
  }

  .app-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .main-nav {
    width: 100%;
  }

  .nav-link {
    flex: 1;
    text-align: center;
    padding: 8px 4px;
    font-size: 12px;
  }
}
</style>
