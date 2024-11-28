import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/DashboardView.vue'
import Profile from '@/views/ProfileView.vue'
import ProjectDetialsView from '@/views/ProjectDetialsView.vue'
import AssigneTasksView from '@/views/AssigneTasksView.vue'
import UserKanban from '@/views/UserKanbanView.vue'


// Define your routes
const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/moduleTasks/:moduleId', name: 'ModuleTasks', component: AssigneTasksView },
   { path: '/kanban/:userId', name: 'UserKanban', component: UserKanban },
  { path: '/project_detials/:project_id/:project_name', name: 'ProjectDetials', component: ProjectDetialsView },
]

// Create the router instance
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL)
, // This is for Vue 3, make sure to use this
  routes,
})

export default router
