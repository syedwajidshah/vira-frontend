<template>
    <v-app-bar app elevation="1" style="background-color: #42A27B;">
      <v-app-bar-nav-icon @click="$emit('toggle-drawer')" />
      <v-toolbar-title>Dashboard</v-toolbar-title>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'AppBar',
  };
  </script>
  
  <style scoped>
  /* Styles specific to AppBar */
  </style>
  