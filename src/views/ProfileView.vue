<template>
  <v-container
    style="display: flex; justify-content: center; align-items: center; max-height: 100vh"
  >
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;
        max-height: 100vh;
        height: 70vh;
      "
    >
      <v-btn
        fab
        dark
        @click="openModal"
        style="width: 200px; height: 200px; border-radius: 50%; background-color: #42a27b"
      >
        <v-icon style="font-size: 60px">mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- Modal for Adding User -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Create New User</v-card-title>

        <v-form ref="form" v-model="valid" @submit.prevent="createUser">
          <v-card-text>
            <!-- User Name -->
            <v-text-field
              v-model="form.user_name"
              label="User Name"
              :rules="nameRules"
              required
            />

            <!-- User Email -->
            <v-text-field
              v-model="form.user_email"
              label="Email"
              :rules="emailRules"
              required
            />

            <!-- User Designation -->
            <v-text-field v-model="form.user_designation" label="Designation" required />

            <!-- User Role -->
            <v-select
              v-model="form.user_role"
              :items="roleItems"
              item-title="title"
              item-value="value"
              label="User Role"
              :rules="roleRules"
              required
            />
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="dialog = false">Cancel</v-btn>
            <v-btn :disabled="!valid" color="green" @click="createUser">
              Create User
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Response Dialog -->
    <v-dialog v-model="responseDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">{{ responseTitle }}</v-card-title>
        <v-card-text>{{ responseMessage }}</v-card-text>
        <v-card-actions>
          <v-btn color="green" text @click="responseDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      dialog: false,
      responseDialog: false,
      responseTitle: "",
      responseMessage: "",
      valid: false,
      form: {
        user_name: "",
        user_email: "",
        user_designation: "",
        user_role: "user", // Default value
      },
      roleItems: [
        { title: "Team Lead", value: "TeamLead" },
        { title: "User", value: "user" },
      ],
      nameRules: [
        (v) => !!v || "User name is required",
        (v) => (v && v.length <= 255) || "Name must be less than 255 characters",
      ],
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",
      ],
      roleRules: [(v) => !!v || "User role is required"],
    };
  },
  methods: {
    openModal() {
      this.dialog = true;
    },
    async createUser() {
      try {
        const response = await axios.post("users/create-user", this.form);

        if (response.status === 200 || response.status === 201) {
          this.responseTitle = "Success";
          this.responseMessage = response.data.message || "User created successfully!";
          this.responseDialog = true;
          this.dialog = false; // Close the creation dialog
          this.resetform();
        } else {
          throw new Error("Unexpected server response");
        }
      } catch (error) {
        this.responseTitle = "Error";
        this.responseMessage =
          error.response?.data?.message || "Failed to create user. Please try again.";
        this.responseDialog = true;
      }
    },
    resetform() {
      this.form = {
        user_name: "",
        user_email: "",
        user_designation: "",
        user_role: "user", // Default value
      };
    },
  },
};
</script>

<style scoped>
.v-btn.fab {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
