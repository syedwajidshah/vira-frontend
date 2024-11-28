<template>
  <v-app>
    <!-- AppBar -->
    
    
    <!-- Sidebar Navigation Drawer -->
    <SidebarVue v-model:drawer="drawerState" />
    <AppBar @toggle-drawer="toggleDrawer" />

    <!-- Main Content Area -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from './components/AppBar.vue';
import SidebarVue from './components/SidebarVue.vue';

export default {
  name: 'App',
  components: {
    AppBar,
    SidebarVue,
  },
  data() {
    return {
      drawerState: true,  // Controls the sidebar open/close state
    };
  },
  methods: {
    toggleDrawer() {
      this.drawerState = !this.drawerState;  // Toggle drawer state
    },
  },
};
</script>
