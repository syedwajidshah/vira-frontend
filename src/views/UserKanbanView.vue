<template>
  <v-container class="py-5">
    <v-row>
      <!-- Profile Card -->
      <v-col cols="12" lg="2" md="2" sm="12">
        <v-card outlined class="profile-card">
          <v-card-title class="profile-card-title">
            <p class="designation">{{ userDesignation }}</p>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <!-- User Info -->
            <div
              v-if="userInfo"
              class="assignee"
              style="
                text-align: center;
                display: flex;
                justify-content: start;
                align-items: center;
                gap: 10px;
              "
            >
              <div class="avatar-circle">
                <span>{{ getInitials(userInfo.user_name) }}</span>
              </div>
              <p class="assignee-name">{{ userInfo.user_name }}</p>
            </div>
            <div
              style="
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
              <div class="progress-container" style="width: 100%">
                <div class="progress-bar" :style="progressStyle">{{ progress }}%</div>
              </div>
            </div>
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
                      :key="element.ticket.ticket_id"
                      outlined
                      elevation="2"
                      class="my-3 task-card"
                      :data-id="element.ticket_id"
                      @mouseover="showActions(element.ticket_id)"
                      @mouseleave="hideActions(element.ticket_id)"
                    >
                      <v-card-title>
                        {{ element.ticket.ticket_title }}
                      </v-card-title>
                      <v-card-text>
                        <p>
                          <strong>Start Date:</strong>
                          {{ formatDate(element.ticket.ticket_start_date) }}
                        </p>
                        <p>
                          <strong>End Date:</strong>
                          {{ formatDate(element.ticket.ticket_end_date) }}
                        </p>
                      </v-card-text>
                      <div
                        v-if="isActionsVisible(element.ticket_id)"
                        class="actions-overlay"
                      >
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

    <!-- Ticket View Dialog -->
    <v-dialog v-model="viewTicketDialog" max-width="800px">
      <v-card class="elevation-3 dialog-card">
        <!-- Dialog Title -->
        <v-card-title class="py-5 dialog-title">
          <v-row align="center" class="d-flex justify-space-between">
            <h3 class="text-h5 font-weight-bold">
              {{ ticketDetails?.ticket_title || "Ticket Details" }}
            </h3>
            <v-btn icon @click="closeViewTicketDialog" class="close-button">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
        </v-card-title>

        <!-- Dialog Content -->
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Ticket Details -->
              <v-col cols="12" md="6">
                <div>
                  <strong class="">Due In:</strong>
                  <v-chip
                    :color="calculateDueInColor(ticketDetails?.ticket_end_date)"
                    dark
                    small
                    class="chip-styled"
                  >
                    {{ calculateDueIn(ticketDetails?.ticket_end_date) }}
                  </v-chip>
                </div>
                <div class="detail-item">
                  <strong class="">Status:</strong>
                  <v-chip
                    :color="statusColor(ticketDetails?.ticket_status)"
                    dark
                    small
                    class="chip-styled"
                  >
                    {{ ticketDetails?.ticket_status }}
                  </v-chip>
                </div>
                <div class="detail-item">
                  <strong class="">Start Date:</strong>
                  <span>{{ formatDate(ticketDetails?.ticket_start_date) }}</span>
                </div>
                <div class="detail-item">
                  <strong class="">End Date:</strong>
                  <span>{{ formatDate(ticketDetails?.ticket_end_date) }}</span>
                </div>
              </v-col>

              <!-- Assignees -->
              <v-col cols="12" md="6">
                <div>
                  <strong class="">Assignees:</strong>
                  <v-list class="assignees-list">
                    <v-list-item
                      v-for="(assignment, index) in ticketDetails?.assignments"
                      :key="index"
                      class="assignee-item"
                    >
                      <v-list-item-avatar>
                        <v-icon class="icon-styled">mdi-account-circle</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium">
                          {{ assignment.user?.user_name || "N/A" }}
                        </v-list-item-title>
                        <v-list-item-subtitle>{{
                          assignment.user?.user_designation || "No designation provided"
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>
              </v-col>
            </v-row>

            <!-- Ticket Description -->
            <v-row>
              <v-col cols="12">
                <div class="description-section">
                  <h4 class="font-weight-bold mb-3" style="color: #05ad5f">
                    Description
                  </h4>
                  <v-alert
                    v-if="!ticketDetails?.ticket_description"
                    text
                    border="left"
                    color="grey lighten-4"
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

        <!-- Dialog Actions -->
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
      userInfo: null,
      viewTicketDialog: false,
      userId: null,
      ticketDetails: null,
      progress: 0,
      columns: {
        Backlog: [],
        "In Progress": [],
        Completed: [],
        "QA Backlog": [],
      },
      visibleActions: [],
    };
  },
  computed: {
    progressStyle() {
      let color = "";
      if (this.progress < 30) {
        color = "linear-gradient(90deg, #FF4C4C, #FF7F7F)"; // Red gradient for <30% progress
      } else if (this.progress < 70) {
        color = "linear-gradient(90deg, #FFB84C, #FF8C1A)"; // Orange gradient for <70% progress
      } else {
        color = "linear-gradient(90deg, #4CAF50, #00E676)"; // Green gradient for >70% progress
      }

      return {
        width: `${this.progress}%`,
        background: color,
        height: "15px",
        borderRadius: "50px", // More rounded corners
        color: "#fff",
        textAlign: "center",
        lineHeight: "30px",
        fontWeight: "meduim",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
        transition: "width 0.5s ease-out", // Smooth transition
      };
    },
  },
  mounted() {
    this.userId = this.$route.params.userId;
    this.fetchUserTickets();
    this.getUserProgress();
  },
  methods: {
    async getUserProgress() {
      try {
        const response = await axios.get(`users/${this.userId}/progress`); // Update with your API endpoint
        this.progress = response.data.progress_percentage; // Assuming the API returns { progress: 45 } for example
        console.log(this.progress);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    },
    async viewTicket(ticketId) {
      try {
        const response = await axios.get(`project-tickets/view-ticket/${ticketId}`);
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

    async onTaskEnd(evt) {
      const movedTask = evt.item.dataset.id; // Get the ID of the moved task
      const newStatus = evt.to.dataset.box; // Get the name of the new column

      // Map the column name to the backend status value
      const mappedStatus = this.mapStatusToColumn(newStatus);

      console.log("Moved Task ID:", movedTask);
      console.log("Mapped Status for Backend:", mappedStatus);

      try {
        // API call to update the ticket status
        const response = await axios.put(`project-tickets/ticket-status/${movedTask}`, {
          ticket_status: mappedStatus,
        });
        if (response.status === 200 || response.status === 201) {
          this.showToast("success", "Ticket status updated successfully!");
          this.fetchUserTickets();
          this.getUserProgress();
        } else {
          console.error("Failed to delete ticket");
        }
      } catch (error) {
        this.showToast(
          "error",
          "Failed to Delete ticket .",
          error.response?.data?.message || "An unexpected error occurred."
        );
      }
    },

    mapStatusToColumn(columnName) {
      const statusMap = {
        Backlog: "pending",
        "In Progress": "progress",
        Completed: "complete",
        "QA Backlog": "quality",
      };
      return statusMap[columnName] || "pending"; // Default to "pending" if no match
    },

    async fetchUserTickets() {
      try {
        const response = await axios.get(`project-tickets/user-tasks/${this.userId}`);
        const tickets = response.data.data;
        // Assign tickets to the columns based on their status
        this.columns = {
          Backlog: tickets.filter((ticket) => ticket.ticket?.ticket_status === "pending"),
          "In Progress": tickets.filter(
            (ticket) => ticket.ticket?.ticket_status === "progress"
          ),
          Completed: tickets.filter(
            (ticket) => ticket.ticket?.ticket_status === "complete"
          ),
          "QA Backlog": tickets.filter(
            (ticket) => ticket.ticket?.ticket_status === "quality"
          ),
        };
        this.userInfo = tickets[0]?.user;
      } catch (error) {
        console.error("Error fetching user tickets:", error);
      }
    },

    formatDate(date) {
      return date ? moment(date).format("MMM DD, YYYY") : "N/A";
    },

    getInitials(name) {
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("");
      return initials.toUpperCase();
    },
    getCardTitleStyle(columnName) {
      const columnColors = {
        Backlog: "background-color: #FFCDD2;",
        "In Progress": "background-color: #90CAF9",
        Completed: "background-color: #A5D6A7;",
        "QA Backlog": "background-color: #FFCC80;",
      };
      return columnColors[columnName] || "background-color: #ffffff;";
    },

    isActionsVisible(ticketId) {
      return this.visibleActions.includes(ticketId);
    },

    showActions(ticketId) {
      if (!this.visibleActions.includes(ticketId)) {
        this.visibleActions.push(ticketId);
      }
    },

    hideActions(ticketId) {
      const index = this.visibleActions.indexOf(ticketId);
      if (index !== -1) {
        this.visibleActions.splice(index, 1);
      }
    },

    closeViewTicketDialog() {
      this.viewTicketDialog = false;
    },

    statusColor(status) {
      const statusColors = {
        pending: "orange",
        progress: "blue",
        complete: "green",
        quality: "purple",
      };
      return statusColors[status] || "grey";
    },
  },
};
</script>

<style scoped>
.profile-card {
  background-color: #f5f5f5;
}
.progress-container {
  background-color: #e0e0e0;
  border-radius: 50px;
  width: 100%;
  height: 15px;
  margin: 20px 0;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
}
.progress-bar {
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px; /* Larger text for better readability */
}
.profile-card-title {
  font-size: 16px;
  font-weight: 500;
}

.assignee {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-circle {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #02a75d;
  color: white;
}

.assignee-name {
  font-size: 14px;
  font-weight: 600;
}

.task-card {
  margin-bottom: 10px;
}

.chip-styled {
  font-weight: bold;
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

.description-section {
  margin-top: 20px;
}

.description-text {
  font-size: 14px;
  color: #555;
}

.description-alert {
  font-size: 14px;
}

.close-button {
  color: #02c571;
}

.dialog-card {
  background-color: #fff;
}

.dialog-title {
  background-color: #05ad5f;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.close-button-styled {
  background-color: #03d84a;
  color: white !important;
  border-radius: 5px;
}
</style>
