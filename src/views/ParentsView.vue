<template>
  <BasePage title="Parents Management">
    <template #actions>
      <BaseButton @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Cancel' : 'Add Parent' }}
      </BaseButton>
    </template>

    <BaseCard v-if="showCreateForm" title="Add New Parent" class="mb-6">
      <ParentForm @parent-created="handleParentCreated" />
    </BaseCard>

    <div v-if="parentsStore.loading" class="loading">Loading parents...</div>

    <BaseCard v-else-if="!parentsStore.parents.length" class="text-center">
      <h3>No Parents Found</h3>
      <p>Start by adding your first parent to the system.</p>
      <BaseButton @click="showCreateForm = true">Add First Parent</BaseButton>
    </BaseCard>

    <BaseGrid v-else :cols="3" gap="lg">
      <BaseCard v-for="parent in parentsStore.parents" :key="parent.id" hover class="bg-white">
        <h3 class="text-lg font-semibold mb-2">{{ parent.name }}</h3>

        <div class="space-y-1 mb-4">
          <p class="text-sm"><strong>Phone:</strong> {{ parent.phone }}</p>
          <p class="text-sm"><strong>Email:</strong> {{ parent.email }}</p>
        </div>

        <div v-if="getStudentsByParent(parent.id).length > 0" class="mb-4">
          <h4 class="font-medium mb-2">Children:</h4>

          <ul class="space-y-1">
            <li v-for="student in getStudentsByParent(parent.id)" :key="student.id">
              <router-link :to="`/students/${student.id}`" class="text-link">
                {{ student.name }} (Grade {{ student.current_grade }})
              </router-link>
            </li>
          </ul>
        </div>

        <BaseButton size="sm" @click="viewParentDetails(parent.id)"> View Details </BaseButton>
      </BaseCard>
    </BaseGrid>
  </BasePage>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useParentsStore } from '@/stores/parents'
import { useStudentsStore } from '@/stores/students'
import ParentForm from '@/components/ParentForm.vue'
import { BasePage, BaseButton, BaseCard, BaseGrid } from '@/components/base'
import type { Parent } from '@/types'

// Router
const router = useRouter()

// Stores
const parentsStore = useParentsStore()
const studentsStore = useStudentsStore()

// State
const showCreateForm = ref(false)

// Computed
const getStudentsByParent = computed(() => {
  return (parentId: number) => studentsStore.getStudentsByParent(parentId)
})

// Methods
const refreshParents = async () => {
  await parentsStore.fetchAllParents()
}

const handleParentCreated = (parent: Parent) => {
  showCreateForm.value = false
  console.log('Parent created:', parent)
}

const viewParentDetails = (parentId: number) => {
  router.push(`/parents/${parentId}`)
}

const addChildForParent = (parentId: number) => {
  router.push(`/students?parent_id=${parentId}`)
}

// Load data on mount
onMounted(async () => {
  await Promise.all([parentsStore.fetchAllParents(), studentsStore.fetchAllStudents()])
})
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.text-center {
  text-align: center;
}

.text-lg {
  font-size: 1.125rem;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.875rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.text-link {
  color: #0066cc;
  text-decoration: none;
  font-size: 0.875rem;
}

.text-link:hover {
  color: #0052a3;
  text-decoration: underline;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
