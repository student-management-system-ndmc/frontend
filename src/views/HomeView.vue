<template>
  <div class="home">
    <div class="hero-section">
      <h1>Student Management System</h1>
      <p>Manage students, parents, classes, and subscriptions efficiently</p>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/parents" class="action-card">
          <div class="icon">👨‍👩‍👧‍👦</div>
          <h3>Manage Parents</h3>
          <p>Add and view parent information</p>
        </router-link>

        <router-link to="/students" class="action-card">
          <div class="icon">🎓</div>
          <h3>Manage Students</h3>
          <p>Add students and link them to parents</p>
        </router-link>

        <router-link to="/classes" class="action-card">
          <div class="icon">📚</div>
          <h3>Class Schedule</h3>
          <p>View weekly schedule and manage classes</p>
        </router-link>

        <router-link to="/subscriptions" class="action-card">
          <div class="icon">📋</div>
          <h3>Subscriptions</h3>
          <p>Manage student subscriptions and packages</p>
        </router-link>
      </div>
    </div>

    <div class="stats-section">
      <h2>Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ parentsStore.parents.length }}</div>
          <div class="stat-label">Total Parents</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ studentsStore.students.length }}</div>
          <div class="stat-label">Total Students</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ classesStore.classes.length }}</div>
          <div class="stat-label">Total Classes</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ subscriptionsStore.getActiveSubscriptions.length }}</div>
          <div class="stat-label">Active Subscriptions</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useParentsStore } from '@/stores/parents'
import { useStudentsStore } from '@/stores/students'
import { useClassesStore } from '@/stores/classes'
import { useSubscriptionsStore } from '@/stores/subscriptions'

// Stores
const parentsStore = useParentsStore()
const studentsStore = useStudentsStore()
const classesStore = useClassesStore()
const subscriptionsStore = useSubscriptionsStore()

// Load initial data
onMounted(async () => {
  try {
    await Promise.all([
      parentsStore.fetchAllParents(),
      studentsStore.fetchAllStudents(),
      classesStore.fetchAllClasses(),
      subscriptionsStore.fetchAllSubscriptions(),
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  text-align: center;
  padding: 40px 0 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 3rem;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.hero-section p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

.quick-actions,
.stats-section {
  margin-bottom: 40px;
}

.quick-actions h2,
.stats-section h2 {
  font-size: 2rem;
  margin: 0 0 24px 0;
  color: #333;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.action-card .icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 16px;
}

.action-card h3 {
  font-size: 1.4rem;
  margin: 0 0 8px 0;
  color: #333;
}

.action-card p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid #3498db;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section p {
    font-size: 1rem;
  }

  .actions-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
