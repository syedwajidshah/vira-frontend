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
    <!-- Modal for Adding Project -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Create New Project</v-card-title>

        <v-form ref="form" v-model="valid" @submit.prevent="CreatProject">
          <v-card-text>
            <!-- Project Name -->
            <v-text-field
              v-model="form.project_name"
              label="Project Name"
              :rules="nameRules"
              required
            />

            <!-- Start Date -->
            <v-text-field
              v-model="formattedStartDate"
              label="Start Date"
              readonly
              @click="openStartDateDialog"
            />
            <v-dialog v-model="startDateDialog" persistent max-width="350px">
              <v-card>
                <v-date-picker
                  v-model="form.project_start_date"
                  @input="saveStartDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeStartDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveStartDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- End Date -->
            <v-text-field
              v-model="formattedEndDate"
              label="End Date"
              readonly
              @click="openEndDateDialog"
            />
            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="form.project_end_date"
                  :min="form.project_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveEndDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Project Status -->
            <v-select
              v-model="form.project_status"
              :items="statusItems"
              item-title="title"
              item-value="value"
              label="Project Status"
              :rules="statusRules"
              required
            />

            <!-- Project Manager -->
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="dialog = false">Cancel</v-btn>
            <v-btn :disabled="!valid" color="green" @click="CreatProject">
              Create Project
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="SubshowDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">{{
          dialogContent.type === "success" ? "Success" : "Error"
        }}</v-card-title>
        <v-card-text>
          <v-alert :type="dialogContent.type" dismissible>
            {{ dialogContent.message }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn
            :color="dialogContent.type === 'success' ? 'green' : 'red'"
            text
            @click="closefunction"
            >Close</v-btn
          >
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
      startDateDialog: false,
      endDateDialog: false,
      SubshowDialog: false,
      valid: false,
      dialogContent: {
        type: "",
        message: "",
      },
      form: {
        project_name: "",
        project_start_date: new Date(), // Keep Date object internally
        project_end_date: new Date(), // Keep Date object internally
        project_status: 1,
        project_manager: 2,
      },
      statusItems: [
        { title: "Active", value: 1 }, // These values should be numbers or strings
        { title: "Inactive", value: 2 },
      ],
      nameRules: [
        (v) => !!v || "Project name is required",
        (v) => (v && v.length <= 255) || "Name must be less than 255 characters",
      ],
      statusRules: [(v) => !!v || "Project status is required"],
    };
  },
  computed: {
    formattedStartDate() {
      return this.formatDate(this.form.project_start_date);
    },
    formattedEndDate() {
      return this.formatDate(this.form.project_end_date);
    },
  },
  methods: {
    formatDate(date) {
      // Format Date object as YYYY-MM-DD
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    openModal() {
      this.dialog = true;
    },
    openStartDateDialog() {
      this.startDateDialog = true;
    },
    closeStartDateDialog() {
      this.startDateDialog = false;
    },
    saveStartDate() {
      this.closeStartDateDialog();
    },
    openEndDateDialog() {
      this.endDateDialog = true;
    },
    closeEndDateDialog() {
      this.endDateDialog = false;
    },
    saveEndDate() {
      this.closeEndDateDialog();
    },
    async CreatProject() {
      const submissionData = {
        ...this.form,
        project_start_date: this.formatDate(this.form.project_start_date),
        project_end_date: this.formatDate(this.form.project_end_date),
      };

      try {
        // Replace with the correct API endpoint
        const response = await axios.post("projects/create-project", submissionData);

        // Handle success
        if (response.status === 200 || response.status === 201) {
          this.$emit("projectCreated", response.data); // Optional, emit to parent if needed
          this.dialog = false; // Close the dialog
          (this.SubshowDialog = true),
            (this.dialogContent = {
              type: "success",
              message: "Subproject created successfully!",
            });
        } else {
          // Handle unexpected response status
          throw new Error("Unexpected response from the server.");
        }
      } catch (error) {
        // Handle error

        this.SubshowDialog = true;
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message || "Failed to create module. Please try again.",
        };
        console.error("Error creating project:", error);
      }
    },
    closefunction() {
      this.SubshowDialog = false;
      location.reload();
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
