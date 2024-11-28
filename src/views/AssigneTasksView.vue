<template>
  <v-container class="py-5">
    <v-row>
      <!-- Profile Card -->
      <v-col cols="12" lg="2" md="2" sm="12">
        <v-card outlined class="profile-card">
          <v-card-title class="profile-card-title">
            <p class="designation">Team Lead</p>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <!-- Team Lead -->
            <div
              v-if="teamLead"
              class="assignee"
              style="
                text-align: center;
                display: flex;
                justify-content: start;
                align-items: center;
                gap: 10px;
              "
              @click="goToUserProfile(teamLead.user_id)"
            >
              <div class="avatar-circle">
                <span>{{ getInitials(teamLead.name) }}</span>
              </div>
              <p class="assignee-name">{{ teamLead.name }}</p>
            </div>
            <v-divider class="my-3"></v-divider>
            <!-- Assignees -->
            <p class="assignee-tag" style="margin-bottom: 20px">Assignees:</p>
            <v-row>
              <v-col
                v-for="assignee in assignees"
                :key="assignee.user_id"
                cols="12"
                md="12"
                style="display: flex; align-items: center; gap: 10px"
                @click="goToUserProfile(assignee.user_id)"
              >
                <div class="avatar-circle">
                  <span>{{ getInitials(assignee.name) }}</span>
                </div>
                <p class="assignee-name">{{ assignee.name }}</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tasks Columns -->
      <v-col cols="12" lg="10" md="10" sm="12">
        <v-row>
          <v-col v-for="(tasks, columnName) in columns" :key="columnName" cols="3">
            <v-card outlined>
              <v-card-title :style="getCardTitleStyle(columnName)">
                {{ columnName }}
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <draggable
                  v-model="columns[columnName]"
                  group="tasks"
                  @end="onTaskEnd"
                  :data-box="columnName"
                  class="task-list"
                >
                  <template #item="{ element }">
                    <v-card
                      :key="element.ticket_id"
                      outlined
                      elevation="2"
                      class="my-3 task-card"
                      :data-id="element.ticket_id"
                      @mouseover="showActions(element.ticket_id)"
                      @mouseleave="hideActions(element.ticket_id)"
                    >
                      <v-card-title>
                        {{ element.ticket_title }}
                      </v-card-title>
                      <v-card-text>
                        <p>
                          <strong>Start Date:</strong> {{ element.ticket_start_date }}
                        </p>
                        <p><strong>End Date:</strong> {{ element.ticket_end_date }}</p>
                      </v-card-text>
                      <div
                        v-if="isActionsVisible(element.ticket_id)"
                        class="actions-overlay"
                      >
                        <v-btn
                          style="width: 40px !important; height: 40px !important"
                          icon
                          @click="openEditTicketDialog(element.ticket_id)"
                        >
                          <v-icon style="">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          style="width: 40px !important; height: 40px !important"
                          icon
                          @click="openDeleteDialog(element.ticket_id)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-btn
                          style="width: 40px !important; height: 40px !important"
                          icon
                          @click="viewTicket(element.ticket_id)"
                        >
                          <v-icon>mdi-eye</v-icon>
                        </v-btn>
                      </div>
                    </v-card>
                  </template>
                </draggable>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="editTicketDialog" max-width="600px">
      <v-card>
        <v-card-title>Edit Ticket</v-card-title>
        <v-card-text>
          <v-form ref="editTicketForm" v-model="valid">
            <v-text-field
              v-model="editTicketData.ticket_title"
              label="Ticket Title"
              required
            ></v-text-field>

            <!-- Start Date Picker -->
            <v-text-field
              v-model="formattedEditStartDate"
              label="Start Date"
              readonly
              @click="openStartDateDialog"
            />
            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editTicketData.ticket_start_date"
                  @input="saveStartDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeStartDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveStartDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- End Date Picker -->
            <v-text-field
              v-model="formattedEditEndDate"
              label="End Date"
              readonly
              @click="openEndDateDialog"
            />
            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editTicketData.ticket_end_date"
                  :min="editTicketData.ticket_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveEndDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Ticket Status Selector -->
            <v-select
              v-model="editTicketData.ticket_status"
              :items="TasksStatus"
              label="Ticket Status"
              required
            ></v-select>

            <!-- Assigned Users -->
            <v-select
              v-model="editTicketData.user_ids"
              :items="usersArray"
              label="Assigned Users"
              multiple
              item-value="user_id"
              item-title="user_name"
              required
            ></v-select>

            <v-textarea
              v-model="editTicketData.ticket_description"
              label="Ticket Description"
              rows="4"
              hint="Describe the ticket"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="submitEditTicket">Save</v-btn>
          <v-btn text @click="closeEditTicketDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this ticket? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn text color="red" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewTicketDialog" max-width="800px">
      <v-card class="elevation-3 dialog-card">
        <v-card-title class="py-5 dialog-title">
          <v-row align="center" class="d-flex justify-space-between">
            <div>
              <h3 class="text-h5 font-weight-bold">
                {{ ticketDetails?.ticket_title || "Ticket Details" }}
              </h3>
            </div>
            <v-btn icon @click="closeViewTicketDialog" class="close-button">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <!-- Ticket Summary -->
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <strong class="text-secondary">Due In:</strong>
                  <v-chip
                    :color="calculateDueInColor(ticketDetails?.ticket_end_date)"
                    dark
                    small
                    class="chip-styled"
                  >
                    {{ calculateDueIn(ticketDetails?.ticket_end_date) }}
                  </v-chip>
                </div>
                <div class="mb-3">
                  <strong class="text-secondary">Status:</strong>
                  <v-chip
                    :color="statusColor(ticketDetails?.ticket_status)"
                    dark
                    small
                    class="chip-styled"
                  >
                    {{ ticketDetails?.ticket_status }}
                  </v-chip>
                </div>
                <div>
                  <strong class="text-secondary">Start Date:</strong>
                  <span>{{ formatDate(ticketDetails?.ticket_start_date) }}</span>
                </div>
                <div>
                  <strong class="text-secondary">End Date:</strong>
                  <span>{{ formatDate(ticketDetails?.ticket_end_date) }}</span>
                </div>
              </v-col>

              <!-- Assignees -->
              <v-col cols="12" md="6">
                <div>
                  <strong class="text-secondary">Assignees:</strong>
                  <v-list
                    style="display: flex; justify-content: center; align-items: center"
                  >
                    <v-list-item
                      v-for="(assignment, index) in ticketDetails?.assignments"
                      :key="index"
                      class="assignee-item"
                    >
                      <v-list-item-avatar>
                        <v-icon class="icon-styled">mdi-account-circle</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium text-primary">
                          {{ assignment.user?.user_name || "N/A" }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{
                            assignment.user?.user_designation || "No designation provided"
                          }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>
              </v-col>
            </v-row>

            <!-- Ticket Description -->
            <v-row>
              <v-col cols="12">
                <div class="mt-5">
                  <h4 class="font-weight-bold mb-3 text-primary">Description</h4>
                  <v-alert
                    v-if="!ticketDetails?.ticket_description"
                    text
                    border="left"
                    color=" lighten-4"
                    class="description-alert"
                  >
                    No description provided.
                  </v-alert>
                  <p v-else class="description-text">
                    {{ ticketDetails?.ticket_description }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="closeViewTicketDialog"
            class="close-button-styled"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import draggable from "vuedraggable";
import moment from "moment";

export default {
  components: { draggable },
  data() {
    return {
      editTicketDialog: false,
      editTicketData: {
        ticket_id: null,
        ticket_title: "",
        ticket_start_date: null,
        ticket_end_date: null,
        module_id: null,
        ticket_status: "notstarted",
        user_ids: [],
      },
      viewTicketDialog: false,
      ticketDetails: null,
      deleteDialog: false,
      ticketIdToDelete: null,
      formattedEditStartDate: "",
      formattedEditEndDate: "",
      startDateDialog: false,
      endDateDialog: false,
      valid: true,
      TasksStatus: [
        { title: "Progress", value: "progress" },
        { title: "Complete", value: "complete" },
        { title: "Pending", value: "pending" },
        { title: "QA", value: "quality" },
      ],
      usersArray: [],
      moduleId: null,
      teamLeadUsers: [],
      teamLead: null,
      assignees: [],
      columns: {
        Backlog: [],
        "In Progress": [],
        Completed: [],
        "QA Backlog": [],
      },
      visibleActions: [], // Store ticket IDs where actions are visible
    };
  },
  mounted() {
    this.moduleId = this.$route.params.moduleId;
    this.fetchTickets();
    this.getAllUser();
  },
  methods: {
    async viewTicket(ticketId) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/project-tickets/view-ticket/${ticketId}`
        );
        if (response.status === 200) {
          this.ticketDetails = response.data.ticket;
          this.viewTicketDialog = true; // Open dialog
        } else {
          console.error("Failed to fetch ticket details.");
        }
      } catch (error) {
        console.error(
          "Error fetching ticket details:",
          error.response?.data || error.message
        );
      }
    },

    // Close the dialog
    closeViewTicketDialog() {
      this.viewTicketDialog = false;
      this.ticketDetails = null;
    },

    // Format dates
    formatDate(date) {
      return date ? moment(date).format("MMMM D, YYYY") : "N/A";
    },

    // Calculate "Due In" and color for chip
    calculateDueIn(endDate) {
      if (!endDate) return "N/A";

      const now = moment();
      const endMoment = moment(endDate);
      const diffInHours = endMoment.diff(now, "hours");
      const diffInDays = endMoment.diff(now, "days");

      if (diffInHours <= 0) {
        return "Overdue";
      } else if (diffInHours < 24) {
        return `${diffInHours} hours`;
      } else {
        return `${diffInDays} days`;
      }
    },

    calculateDueInColor(endDate) {
      const now = moment();
      const endMoment = moment(endDate);
      const diffInHours = endMoment.diff(now, "hours");

      if (diffInHours > 168) return "green"; // More than 7 days (7*24=168 hours)
      if (diffInHours <= 168 && diffInHours > 24) return "orange"; // 1-7 days
      if (diffInHours <= 24 && diffInHours > 0) return "orange"; // Less than 24 hours
      return "red"; // Overdue
    },

    // Get chip color for status
    statusColor(status) {
      const colors = {
        progress: "blue",
        completed: "green",
        overdue: "red",
      };
      return colors[status] || "grey";
    },
    async getAllUser() {
      try {
        const response = await axios.get("users/all-users");

        if (response.status === 200 || response.status === 201) {
          this.allUsers = response.data.users;
          console.log("users", this.allUsers);
          this.usersArray = this.allUsers.map((user) => ({
            user_id: user.user_id,
            user_name: user.user_name,
          }));
          this.teamLeadUsers = this.allUsers
            .filter((user) => user.user_role === "TeamLead")
            .map((user) => ({
              user_id: user.user_id,
              user_name: user.user_name,
            }));
        } else {
          throw new Error("Unexpected server response");
        }
      } catch (error) {
        this.responseMessage =
          error.response?.data?.message || "Failed to create user. Please try again.";
      }
    },

    openEditTicketDialog(ticketId) {
      if (!ticketId) {
        console.error("Ticket ID is not provided");
        return;
      }

      axios
        .get(`project-tickets/view-ticket/${ticketId}`)
        .then((response) => {
          const ticket = response.data.ticket;
          if (!ticket) {
            console.error("Ticket data is not available");
            return;
          }

          this.editTicketData = {
            ticket_id: ticket.ticket_id,
            ticket_title: ticket.ticket_title,
            ticket_start_date: moment(ticket.ticket_start_date).toDate(),
            ticket_end_date: moment(ticket.ticket_end_date).toDate(),
            ticket_status: ticket.ticket_status,
            module_id: ticket.module_id,
            user_ids: ticket.assignments
              ? ticket.assignments.map((assignment) => assignment.user_id)
              : [],
            ticket_description: ticket.ticket_description || "",
          };

          this.formattedEditStartDate = moment(ticket.ticket_start_date).format(
            "YYYY-MM-DD"
          );
          this.formattedEditEndDate = moment(ticket.ticket_end_date).format("YYYY-MM-DD");
          this.editTicketDialog = true;
          console.log("editTicketData", this.editTicketData);
        })
        .catch((error) => {
          this.showToast(
            "error",
            "Failed to fetch ticket.",
            error.response?.data?.message || "An unexpected error occurred."
          );
        });
    },

    async submitEditTicket() {
      if (!this.$refs.editTicketForm.validate()) {
        console.error("Validation failed");
        return;
      }

      const formattedData = {
        ticket_title: this.editTicketData.ticket_title,
        ticket_start_date: moment(this.editTicketData.ticket_start_date).format(
          "YYYY-MM-DD"
        ),
        ticket_end_date: moment(this.editTicketData.ticket_end_date).format("YYYY-MM-DD"),
        ticket_status: this.editTicketData.ticket_status,
        module_id: this.editTicketData.module_id,

        user_ids: this.editTicketData.user_ids,
        ticket_description: this.editTicketData.ticket_description, // Include description
      };
      console.log("formattedData", formattedData);
      try {
        const response = await axios.put(
          `project-tickets/update-ticket/${this.editTicketData.ticket_id}`,
          formattedData
        );

        if (response.status === 200 || response.status === 201) {
          this.showToast("success", "Ticket updated successfully!");
          this.fetchTickets();
          this.closeEditTicketDialog();
        } else {
          this.showToast("error", "Failed to update ticket.");
        }
      } catch (error) {
        this.showToast(
          "error",
          "Failed to update ticket.",
          error.response?.data?.message || "An unexpected error occurred."
        );
      }
    },

    closeEditTicketDialog() {
      this.editTicketDialog = false;
    },
    openStartDateDialog() {
      this.startDateDialog = true;
    },

    openEndDateDialog() {
      this.endDateDialog = true;
    },

    closeStartDateDialog() {
      this.startDateDialog = false;
    },

    closeEndDateDialog() {
      this.endDateDialog = false;
    },
    saveStartDate() {
      this.formattedEditStartDate = moment(this.editTicketData.ticket_start_date).format(
        "YYYY-MM-DD"
      );
      this.startDateDialog = false;
    },

    saveEndDate() {
      this.formattedEditEndDate = moment(this.editTicketData.ticket_end_date).format(
        "YYYY-MM-DD"
      );
      this.endDateDialog = false;
    },

    openDeleteDialog(ticketId) {
      this.ticketIdToDelete = ticketId;
      this.deleteDialog = true;
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
      this.ticketIdToDelete = null;
    },

    async confirmDelete() {
      if (!this.ticketIdToDelete) {
        console.error("Ticket ID is not available for deletion");
        return;
      }

      try {
        const response = await axios.delete(
          `project-tickets/delete-ticket/${this.ticketIdToDelete}`
        );

        if (response.status === 200 || response.status === 201) {
          this.showToast("success", "Ticket Delete successfully!");
          this.fetchTickets();
          this.closeDeleteDialog();
        } else {
          console.error("Failed to delete ticket");
        }
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        this.showToast(
          "error",
          "Failed to Delete ticket .",
          error.response?.data?.message || "An unexpected error occurred."
        );
      }
    },
    async fetchTickets() {
      try {
        const response = await axios.get(
          `/project-tickets/module-tickets/${this.moduleId}`
        );
        const { tickets } = response.data;

        this.columns = {
          Backlog: [],
          "In Progress": [],
          Completed: [],
          "QA Backlog": [],
        };

        tickets.forEach((ticket) => {
          const ticketData = {
            ticket_id: ticket.ticket_id,
            ticket_title: ticket.ticket_title,
            ticket_start_date: ticket.ticket_start_date,
            ticket_end_date: ticket.ticket_end_date,
            ticket_status: ticket.ticket_status,
            assignments: ticket.assignments,
          };

          switch (ticket.ticket_status) {
            case "pending":
              this.columns.Backlog.push(ticketData);
              break;
            case "progress":
              this.columns["In Progress"].push(ticketData);
              break;
            case "complete":
              this.columns.Completed.push(ticketData);
              break;
            case "quality":
              this.columns["QA Backlog"].push(ticketData);
              break;
          }
        });

        // Assign team lead
        const leadAssignment = tickets
          .flatMap((t) => t.assignments)
          .find((a) => a.user.user_role === "TeamLead");
        this.teamLead = leadAssignment
          ? { name: leadAssignment.user.user_name, user_id: leadAssignment.user.user_id }
          : null;

        // Filter assignees by unique user ID
        const assigneesSet = new Set();
        this.assignees = tickets
          .flatMap((t) => t.assignments)
          .filter((a) => a.user.user_role !== "TeamLead")
          .map((a) => a.user)
          .filter((user) => {
            if (!assigneesSet.has(user.user_id)) {
              assigneesSet.add(user.user_id);
              return true;
            }
            return false;
          })
          .map((user) => ({ name: user.user_name, user_id: user.user_id }));
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    },

    onTaskEnd(event) {
      const fromColumn = event.from.getAttribute("data-box");
      const toColumn = event.to.getAttribute("data-box");
      const taskId = event.item.getAttribute("data-id");

      if (!taskId || fromColumn === toColumn) return;

      console.log(`Moved task ID ${taskId} from ${fromColumn} to ${toColumn}`);
      const statusMap = {
        Backlog: "pending",
        "In Progress": "progress",
        Completed: "complete",
        "QA Backlog": "quality",
      };

      const updatedStatus = statusMap[toColumn];
      this.updateTicketStatus(taskId, updatedStatus);
    },

    async updateTicketStatus(ticketId, newStatus) {
      try {
        const response = await axios.put(`/project-tickets/ticket-status/${ticketId}`, {
          ticket_status: newStatus,
        });

        if (response.status === 200 || response.status === 201) {
          this.showToast("success", "Ticket status updated successfully!");
        }
      } catch (error) {
        this.showToast(
          "error",
          "Failed to update ticket status.",
          error.response?.data?.message || "An unexpected error occurred."
        );
      }
    },

    getCardTitleStyle(columnName) {
      const colors = {
        Backlog: "#FFCDD2", // A richer red for Backlog
        "In Progress": "#90CAF9", // A vibrant blue for In Progress
        Completed: "#A5D6A7", // A fresher green for Completed
        "QA Backlog": "#FFCC80", // A warmer orange for QA Backlog
      };
      return {
        backgroundColor: colors[columnName],
      };
    },

    getInitials(name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },

    // Hover and show actions for the ticket
    showActions(ticketId) {
      if (!this.visibleActions.includes(ticketId)) {
        this.visibleActions.push(ticketId);
      }
    },

    hideActions(ticketId) {
      this.visibleActions = this.visibleActions.filter((id) => id !== ticketId);
    },

    isActionsVisible(ticketId) {
      return this.visibleActions.includes(ticketId);
    },

    // Navigate to user profile page
    goToUserProfile(userId) {
      console.log("User ID clicked:", userId); // Logs user ID in the console
      this.$router.push({
        name: "UserKanban",
        params: { userId: userId },
      });
    },

    // Handle actions
    editTicket(ticketId) {
      console.log("Edit ticket", ticketId);
    },
    deleteTicket(ticketId) {
      console.log("Delete ticket", ticketId);
    },
  },
};
</script>

<style scoped>
.profile-card {
  border-radius: 5px;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.assignee-name {
  margin-top: 10px;
  font-weight: bold;
}
.text-success {
  color: green;
}
.text-warning {
  color: orange;
}
.text-danger {
  color: red;
}
.assignee-tag {
  font-weight: bold;
}

.task-card {
  position: relative;
}

.actions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: #ffffff;
  opacity: 0;
  transition: opacity 0.3s;
}

.task-card:hover .actions-overlay {
  opacity: 1;
}
</style>
<style scoped>
.dialog-card {
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f3f3f3);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.dialog-title {
  background-color: #10ca64;
  color: white;
  border-bottom: 1px solid #e0e0e0;
}

.text-primary {
  color: #19d27c !important;
}

.text-secondary {
  color: #757575 !important;
}

.chip-styled {
  font-size: 14px;
  font-weight: bold;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.assignee-item {
  transition: all 0.3s ease;
}

.assignee-item:hover {
  background-color: #f5f5f5;
  border-radius: 8px;
}

.icon-styled {
  font-size: 32px;
  color: #19d27c;
}

.description-alert {
  background-color: #f9f9f9;
  color: #757575;
}

.description-text {
  color: #424242;
  line-height: 1.6;
}

.close-button {
  transition: transform 0.2s;
  color: rgb(13, 207, 110) !important;
}

.close-button:hover {
  transform: rotate(90deg);
}

.close-button-styled {
  background-color: #19d260;
  color: white !important;
  font-weight: bold;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.close-button-styled:hover {
  background-color: #148643bb;
}
</style>
