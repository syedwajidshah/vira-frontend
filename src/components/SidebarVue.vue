<template>
  <v-navigation-drawer
    v-model="drawerState"
    app
    @input="updateDrawer"
    style="background-color: #42a27b"
  >
    <div
      class="d-flex align-center justify-content:center"
      style="display: flex; justify-content: center; align-items: center"
    >
      <h1 style="font-size: 50px; color: white">VIRA.ai</h1>
    </div>

    <!-- List of Projects -->
    <v-list dense>
      <v-list-item-group>
        <v-list-item @click="$router.push('/')">
          <v-list-item-content>
            <v-list-item-title class="" style="color: white">
              Add Project
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
      <v-list-item-group>
        <v-list-item @click="$router.push('/profile')">
          <v-list-item-content>
            <v-list-item-title class="" style="color: white">
              Add users
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>

      <v-list-item-group>
        <v-list-item
          v-for="project in projects"
          :key="project.project_id"
          @click="selectProject(project)"
        >
          <v-list-item-content>
            <v-list-item-title class="" style="color: white">{{
              project.project_name
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
// Import axios for making API requests
import axios from "axios";

export default {
  name: "SidebarVue",
  props: {
    drawer: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      drawerState: this.drawer, // Local state for the drawer
      projects: [], // To store the list of projects fetched from API
    };
  },
  watch: {
    // Watch for changes in drawer prop and update local drawerState
    drawer(newVal) {
      this.drawerState = newVal;
    },
  },
  methods: {
    // Method to update the drawer state in parent component
    updateDrawer(value) {
      this.$emit("update:drawer", value);
    },

    // Fetch the list of projects from the API
    async fetchProjects() {
      try {
        const response = await axios.get("projects/all-projects");

        if (response.status === 200 || response.status === 201) {
          this.projects = response.data.projects;
          console.log("projects,", this.projects);
        } else {
          this.handleError("Failed to fetch projects");
        }
      } catch (error) {
        this.handleError(error.response ? error.response.data.message : error.message);
      }
    },
    handleError(errorMessage) {
      console.error("Error:", errorMessage);
      this.$router.push({ name: "error", params: { message: errorMessage } });
    },

    selectProject(project) {
      this.$router.push({
        name: "ProjectDetials",
        params: { project_id: project.project_id, project_name: project.project_name },
      });
    },
  },
  mounted() {
    // Fetch the projects when the component is mounted
    this.fetchProjects();
  },
};
</script>
