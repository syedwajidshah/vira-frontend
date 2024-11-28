<template>
  <div class="project-details">
    <!-- Project Box -->
    <div
      class="project-box"
      @mouseover="showProjectActions = true"
      @mouseleave="showProjectActions = false"
    >
      <h1 class="project-name">{{ this.singleproject.project_name }}</h1>
      <div
        style="width: 100%; display: flex; justify-content: center; align-items: center"
      >
        <div class="progress-container" style="width: 30%">
          <div class="progress-bar" :style="progressStyle">{{ progress }}%</div>
        </div>
      </div>
      <!-- Edit, Add, Delete Icons for Project -->
      <div v-if="showProjectActions" class="icon-actions">
        <!-- Add Subproject -->
        <v-tooltip text="Add Subproject">
          <template v-slot:activator="{ props }">
            <v-icon class="icon" v-bind="props" @click="addSubproject(projectId)">
              mdi-plus
            </v-icon>
          </template>
        </v-tooltip>

        <!-- Edit Project -->
        <v-tooltip text="Edit Project">
          <template v-slot:activator="{ props }">
            <v-icon class="icon" v-bind="props" @click="openEditDialog">
              mdi-pencil
            </v-icon>
          </template>
        </v-tooltip>

        <!-- Delete Project -->
        <v-tooltip text="Delete Project">
          <template v-slot:activator="{ props }">
            <v-icon class="icon" v-bind="props" @click="openDeleteDialog">
              mdi-delete
            </v-icon>
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Subprojects List -->
    <div v-if="subprojects.length > 0" class="subprojects">
      <div class="subprojects-grid">
        <div
          v-for="(subproject, index) in subprojects"
          :key="subproject.sub_project_id"
          class="subproject-card"
          @mouseover="hoveredSubproject = index"
          @mouseleave="hoveredSubproject = null"
        >
          <h3 class="subproject-name">{{ subproject.sub_project_name }} Modules</h3>
          <p class="subproject-description">{{ subproject.description }}</p>

          <!-- Edit, Add, Delete Icons for Subproject -->
          <div v-if="hoveredSubproject === index" class="icon-actions">
            <!-- Edit Subproject -->
            <v-tooltip text="Edit Subproject">
              <template v-slot:activator="{ props }">
                <v-icon
                  class="icon"
                  v-bind="props"
                  @click="openSubProEditDialog(subproject)"
                >
                  mdi-pencil
                </v-icon>
              </template>
            </v-tooltip>

            <!-- Delete Subproject -->
            <v-tooltip text="Delete Subproject">
              <template v-slot:activator="{ props }">
                <v-icon
                  class="icon"
                  v-bind="props"
                  @click="SubopenDeleteDialog(subproject.sub_project_id)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-tooltip>

            <!-- Add Module -->
            <v-tooltip text="Add Module">
              <template v-slot:activator="{ props }">
                <v-icon
                  class="icon"
                  v-bind="props"
                  @click="openAddModuleDialog(subproject.sub_project_id)"
                >
                  mdi-plus
                </v-icon>
              </template>
            </v-tooltip>
          </div>

          <!-- Displaying Modules of each Subproject -->
          <div class="modules">
            <div
              v-for="module in subproject.modules"
              :key="module.module_id"
              class="module-card"
              @mouseover="hoveredmodules = module.module_id"
              @mouseleave="hoveredmodules = null"
            >
              <p class="module-name">{{ module.module_title }}</p>
              <p class="module-status" :class="getStatusClass(module.module_status)">
                {{ module.module_status }}
              </p>

              <!-- Action Icons for each Module -->
              <div v-if="hoveredmodules === module.module_id" class="module-actions">
                <v-tooltip text="View all tasks">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="icon mod-icons"
                      v-bind="props"
                      @click="viewModule(module.module_id)"
                    >
                      mdi-eye
                    </v-icon>
                  </template>
                </v-tooltip>

                <v-tooltip text="Edit Module">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="icon mod-icons"
                      v-bind="props"
                      @click="openModuleEditDialog(module)"
                    >
                      mdi-pencil
                    </v-icon>
                  </template>
                </v-tooltip>

                <v-tooltip text="Delete Module">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="icon mod-icons"
                      v-bind="props"
                      @click="openDeleteModule(module.module_id)"
                    >
                      mdi-delete
                    </v-icon>
                  </template>
                </v-tooltip>

                <v-tooltip text="Add Tasks">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="icon mod-icons"
                      v-bind="props"
                      @click="openAddTaskDialog(module.module_id)"
                    >
                      mdi-plus
                    </v-icon>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No subprojects message -->
    <div v-else class="no-subprojects">
      <p>No subprojects found for this project.</p>
    </div>
    <v-dialog v-model="AddSubdialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">Create Subproject</v-card-title>
        <v-form ref="form" v-model="valid" @submit.prevent="createSubproject">
          <v-card-text>
            <!-- Subproject Name -->
            <v-text-field
              v-model="addSubProjectData.sub_project_name"
              label="Subproject Name"
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
            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="addSubProjectData.sub_project_start_date"
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
                  v-model="addSubProjectData.sub_project_end_date"
                  :min="addSubProjectData.sub_project_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveEndDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Status -->
            <v-select
              v-model="addSubProjectData.sub_project_status"
              :items="statusItems"
              label="Status"
              required
            />

            <!-- Subproject Manager -->
            <v-select
              v-model="addSubProjectData.sub_project_manager"
              :items="teamLeadUsers"
              item-title="user_name"
              item-value="user_id"
              label="Subproject Manager"
              required
            />

            <!-- Assign Users -->
            <v-select
              v-model="addSubProjectData.user_ids"
              :items="usersArray"
              item-title="user_name"
              item-value="user_id"
              label="Assign Users"
              multiple
              required
            />
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="closeDialog">Cancel</v-btn>
            <v-btn :disabled="!valid" color="green" type="submit"> Create </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addModuleDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Add Module</v-card-title>

        <v-form ref="moduleForm" v-model="isModuleFormValid">
          <v-card-text>
            <v-text-field
              v-model="moduleData.module_title"
              label="Module Title"
              :rules="moduleTitle"
              required
            ></v-text-field>

            <!-- <v-text-field
              v-model="moduleData.module_start_date"
              label="Start Date"
              type="date"
              required
            ></v-text-field>

            <v-text-field
              v-model="moduleData.module_end_date"
              label="End Date"
              type="date"
              required
            ></v-text-field> -->

            <v-text-field
              v-model="ModuleformattedStartDate"
              label="Start Date"
              readonly
              @click="openStartDateDialog"
              required
            ></v-text-field>

            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="moduleData.module_start_date"
                  @input="saveStartDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeStartDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveStartDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-text-field
              v-model="ModuleformattedEndDate"
              label="End Date"
              readonly
              @click="openEndDateDialog"
              required
            ></v-text-field>

            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="moduleData.module_end_date"
                  :min="moduleData.module_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveEndDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-select
              v-model="moduleData.module_status"
              :items="['active', 'inactive']"
              label="Module Status"
              required
            ></v-select>
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="closeAddModuleDialog">Cancel</v-btn>
            <v-btn :disabled="!isModuleFormValid" color="primary" @click="addModuleData"
              >Submit</v-btn
            >
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
            @click="SubshowDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Task Dialog -->
    <v-dialog v-model="addTaskDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Add Tasks for Module {{ currentModuleId }}</v-card-title>
        <v-card-text>
          <v-form ref="taskForm" v-model="isTaskFormValid">
            <v-text-field
              label="Ticket Title"
              v-model="taskData.ticket_title"
              :rules="taskTitle"
              required
            ></v-text-field>
            <v-text-field
              v-model="TaskFormattedStartDate"
              label="Task Start Date"
              readonly
              @click="openStartDateDialog"
              required
            ></v-text-field>

            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="taskData.ticket_start_date"
                  @input="saveStartDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeStartDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveStartDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-text-field
              v-model="TaskFormattedEndDate"
              label="Task End Date"
              readonly
              @click="openEndDateDialog"
              required
            ></v-text-field>

            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="taskData.ticket_end_date"
                  :min="taskData.ticket_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveEndDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-select
              v-model="taskData.ticket_status"
              :items="TasksStatus"
              label="Module Status"
              required
            ></v-select>

            <v-autocomplete
              v-model="taskData.user_ids"
              :items="allUsers"
              item-title="user_name"
              item-value="user_id"
              multiple
              chips
              label="Assign Users (Optional)"
            ></v-autocomplete>

            <v-textarea
              v-model="taskData.ticket_description"
              label="Task Description"
              rows="4"
              hint="Describe the task"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeAddTaskDialog">Cancel</v-btn>
          <v-btn text color="green" :disabled="!isTaskFormValid" @click="createTask">
            Create Task
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editProjectDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Edit Project</v-card-title>
        <v-card-text>
          <v-form ref="editProjectForm" v-model="isProjectEditFormValid">
            <!-- Project Name -->
            <v-text-field
              v-model="editProjectData.project_name"
              label="Project Name"
              :rules="[(v) => !!v || 'Project Name is required']"
              required
            ></v-text-field>

            <v-text-field
              v-model="ProjectEditFormattedStartDate"
              label="project Start Date"
              readonly
              @click="openStartDateDialog"
              required
            ></v-text-field>

            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editProjectData.project_start_date"
                  @input="saveStartDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeStartDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveStartDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-text-field
              v-model="ProjectEditFormattedEndDate"
              label="Project End Date"
              readonly
              @click="openEndDateDialog"
              required
            ></v-text-field>

            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editProjectData.project_end_date"
                  :min="editProjectData.project_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="saveEndDate">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- Start Date -->
            <!-- <v-menu
              v-model="startDatePicker"
              :close-on-content-click="false"
              :nudge-width="200"
              transition="scale-transition"
              offset-y
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="editProjectData.project_start_date"
                  label="Start Date"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="editProjectData.project_start_date"
                @input="startDatePicker = false"
              ></v-date-picker>
            </v-menu> -->

            <!-- End Date -->
            <!-- <v-menu
              v-model="endDatePicker"
              :close-on-content-click="false"
              :nudge-width="200"
              transition="scale-transition"
              offset-y
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="editProjectData.project_end_date"
                  label="End Date"
                  :rules="[
                    (v) =>
                      new Date(v) >= new Date(editProjectData.project_start_date) ||
                      'End Date must be after Start Date',
                  ]"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="editProjectData.project_end_date"
                :min="editProjectData.project_start_date"
                @input="endDatePicker = false"
              ></v-date-picker>
            </v-menu> -->

            <!-- Project Status -->
            <v-select
              v-model="editProjectData.project_status"
              :items="['Active', 'Inactive']"
              label="Project Status"
              :rules="[(v) => !!v || 'Project Status is required']"
              required
            ></v-select>

            <!-- Project Manager -->
            <!-- <v-select
              v-model="editProjectData.project_manager"
              :items="managers"
              label="Project Manager"
              :rules="[(v) => !!v || 'Project Manager is required']"
              required
            ></v-select> -->

            <!-- Error Message -->
            <v-alert v-if="errorMessage" type="error" class="mt-4">
              {{ errorMessage }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="closeEditDialog">Cancel</v-btn>
          <v-btn
            :disabled="!isProjectEditFormValid"
            color="primary"
            @click="handleUpdateProject"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editSubProDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">Edit Subproject</v-card-title>
        <v-form ref="editsubForm" v-model="valid" @submit.prevent="submitEditSubproject">
          <v-card-text>
            <!-- Subproject Name -->
            <v-text-field
              v-model="editSubprojectData.sub_project_name"
              label="Subproject Name"
              required
            />

            <!-- Start Date -->
            <v-text-field
              v-model="SubProjectformattedEditStartDate"
              label="Start Date"
              readonly
              @click="openStartDateDialog"
            />
            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editSubprojectData.sub_project_start_date"
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
              v-model="SubProjectformattedEditEndDate"
              label="End Date"
              readonly
              @click="openEndDateDialog"
            />
            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editSubprojectData.sub_project_end_date"
                  :min="editSubprojectData.sub_project_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="closeEndDateDialog">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Status -->
            <v-select
              v-model="editSubprojectData.sub_project_status"
              :items="statusItems"
              label="Status"
              required
            />

            <!-- Subproject Manager -->
            <v-select
              v-model="editSubprojectData.sub_project_manager"
              :items="teamLeadUsers"
              item-title="user_name"
              item-value="user_id"
              label="Subproject Manager"
              required
            />

            <!-- Assign Users -->
            <v-select
              v-model="editSubprojectData.user_ids"
              :items="usersArray"
              item-title="user_name"
              item-value="user_id"
              label="Assign Users"
              multiple
              required
            />
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="closeSubProEditDialog">Cancel</v-btn>
            <v-btn :disabled="!valid" color="green" type="submit">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editModuleDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">Edit Module</v-card-title>
        <v-form
          ref="editModuleForm"
          v-model="isModulevalid"
          @submit.prevent="submitEditModule"
        >
          <v-card-text>
            <!-- Module Title -->
            <v-text-field
              v-model="editModuleData.module_title"
              label="Module Title"
              required
            />

            <!-- Start Date -->
            <v-text-field
              v-model="ModuleformattedEditStartDate"
              label="Start Date"
              readonly
              @click="openStartDateDialog"
            />
            <v-dialog v-model="startDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editModuleData.module_start_date"
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
              v-model="ModuleformattedEditEndDate"
              label="End Date"
              readonly
              @click="openEndDateDialog"
            />
            <v-dialog v-model="endDateDialog" persistent max-width="340px">
              <v-card>
                <v-date-picker
                  v-model="editModuleData.module_end_date"
                  :min="editModuleData.module_start_date"
                  @input="saveEndDate"
                ></v-date-picker>
                <v-card-actions>
                  <v-btn text @click="closeEndDateDialog">Cancel</v-btn>
                  <v-btn text color="green" @click="closeEndDateDialog">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Status -->
            <v-select
              v-model="editModuleData.module_status"
              :items="statusItemsmodule"
              label="Status"
              required
            />

            <!-- Subproject -->
            <v-select
              v-model="editModuleData.sub_project_id"
              :items="subprojects"
              item-title="sub_project_name"
              item-value="sub_project_id"
              label="Subproject"
              required
            />
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="closeEditModuleDialog">Cancel</v-btn>
            <v-btn :disabled="!isModulevalid" color="green" type="submit">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text> Are you sure you want to delete this project? </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn text color="red" @click="deleteProject">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="SubdeleteDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text> Are you sure you want to delete this Component? </v-card-text>
        <v-card-actions>
          <v-btn text @click="SubcloseDeleteDialog">Cancel</v-btn>
          <v-btn text color="red" @click="deleteSubProject">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="ModuledeleteDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text> Are you sure you want to delete this Module? </v-card-text>
        <v-card-actions>
          <v-btn text @click="ModulecloseDeleteDialog">Cancel</v-btn>
          <v-btn text color="red" @click="deleteModule">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProjectDetails",
  data() {
    return {
      projectId: null,
      valid: false,
      projectName: "",
      progress: 0,
      subprojects: [],
      allUsers: [],
      deleteDialog: false,
      SubdeleteDialog: false,
      isModuleFormValid: false,
      showProjectActions: false,
      editSubProDialog: false,
      addModuleDialog: false,
      hoveredSubproject: null,
      hoveredmodules: null,
      AddSubdialog: false,
      isTaskFormValid: false,
      teamLeadUsers: [],
      usersArray: [],
      startDateDialog: false,
      singleproject: [],
      endDateDialog: false,
      editModuleDialog: false,
      SubshowDialog: false,
      loading: false,
      addTaskDialog: false,
      currentModuleId: null,
      moduleId: null,
      ModuledeleteDialog: false,
      editProjectDialog: false,
      isProjectEditFormValid: false,
      isModulevalid: false,
      subprojectID: null,
      taskData: {
        ticket_title: "",
        ticket_description: "",
        ticket_start_date: new Date(),
        ticket_end_date: new Date(),
        user_ids: [],
        ticket_status: "progress",
      },

      TasksStatus: [
        { title: "Progress", value: "progress" },
        { title: "Complete", value: "complete" },
        { title: "Pending", value: "pending" },
        { title: "QA", value: "quality" },
      ],

      dialogContent: {
        type: "",
        message: "",
      },
      addSubProjectData: {
        sub_project_name: "",
        sub_project_start_date: new Date(),
        sub_project_end_date: new Date(),
        sub_project_status: 1,
        sub_project_manager: null,
        project_id: null,
        user_ids: [],
      },
      moduleData: {
        module_title: "",
        module_start_date: new Date(),
        module_end_date: new Date(),
        module_status: "active",
        module_id: null,
        sub_project_id: null,
      },

      editProjectData: {
        project_name: "",
        project_start_date: new Date(),
        project_end_date: new Date(),
        project_status: null,
        project_manager: null,
      },

      editSubprojectData: {
        sub_project_id: null,
        sub_project_name: "",
        sub_project_start_date: new Date(),
        sub_project_end_date: new Date(),
        sub_project_status: null,
        sub_project_manager: null,
        project_id: null,
        user_ids: [],
      },
      editModuleData: {
        module_id: null,
        module_title: "",
        module_start_date: null,
        module_end_date: null,
        module_status: "",
        sub_project_id: null,
      },
      nameRules: [(v) => !!v || "Subproject name is required"],
      moduleTitle: [(v) => !!v || "Module title is required"],
      taskTitle: [(v) => !!v || "task title is required"],
      statusItems: [
        { title: "Active", value: 1 },
        { title: "Inactive", value: 0 },
      ],
      statusItemsmodule: [
        { title: "Active", value: "active" },
        { title: "Inactive", value: "inactive" },
      ],
      startDateMenu: false,
      endDateMenu: false,
    };
  },

  computed: {
    formattedStartDate() {
      return this.formatDate(this.addSubProjectData.sub_project_start_date);
    },
    formattedEndDate() {
      return this.formatDate(this.addSubProjectData.sub_project_end_date);
    },

    ModuleformattedStartDate() {
      return this.formatDate(this.moduleData.module_start_date);
    },
    ModuleformattedEndDate() {
      return this.formatDate(this.moduleData.module_end_date);
    },

    TaskFormattedStartDate() {
      return this.formatDate(this.taskData.ticket_start_date);
    },
    TaskFormattedEndDate() {
      return this.formatDate(this.taskData.ticket_end_date);
    },
    ProjectEditFormattedStartDate() {
      return this.formatDate(this.editProjectData.project_start_date);
    },
    ProjectEditFormattedEndDate() {
      return this.formatDate(this.editProjectData.project_end_date);
    },
    SubProjectformattedEditStartDate() {
      return this.formatDate(this.editSubprojectData.sub_project_start_date);
    },
    SubProjectformattedEditEndDate() {
      return this.formatDate(this.editSubprojectData.sub_project_end_date);
    },
    ModuleformattedEditStartDate() {
      return this.formatDate(this.editModuleData.module_start_date);
    },
    ModuleformattedEditEndDate() {
      return this.formatDate(this.editModuleData.module_end_date);
    },

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
        height: "20px",
        borderRadius: "50px", // More rounded corners
        color: "#fff",
        textAlign: "center",
        lineHeight: "30px",
        fontWeight: "bold",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
        transition: "width 0.5s ease-out", // Smooth transition
      };
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    async getProjectProgress() {
      try {
        const response = await axios.get(`projects/${this.projectId}/progress`); // Update with your API endpoint
        this.progress = response.data.progress_percentage; // Assuming the API returns { progress: 45 } for example
        console.log(this.progress);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    },
    async getprojectbyid() {
      try {
        const response = await axios.get(`projects/view-project/${this.projectId}`);

        if (
          response.status === 200 ||
          (response.status === 201 && response.data.project)
        ) {
          this.singleproject = response.data.project;
          console.log("project fetched", this.singleproject);
        } else {
          this.errorMessage = "Unexpected response format. Please try again.";
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Unable to fetch project details. Please check your network or try again later.";
      } finally {
        this.loading = false;
      }
    },

    openModuleEditDialog(module) {
      if (!module) {
        console.error("Module data is not available");
        return;
      }

      const startDate = module.module_start_date
        ? new Date(module.module_start_date)
        : new Date();
      const endDate = module.module_end_date ? new Date(module.module_end_date) : null;

      this.editModuleData = {
        module_id: module.module_id,
        module_title: module.module_title,
        module_start_date: startDate,
        module_end_date: endDate,
        module_status: module.module_status,
        sub_project_id: module.sub_project_id,
      };

      this.formattedEditStartDate = startDate
        ? startDate.toISOString().split("T")[0]
        : "";
      this.formattedEditEndDate = endDate ? endDate.toISOString().split("T")[0] : "";

      this.editModuleDialog = true;
    },

    async submitEditModule() {
      if (!this.$refs.editModuleForm.validate()) {
        this.errorMessage = "Please fill in all required fields correctly.";
        return;
      }

      try {
        const dataToSend = {
          ...this.editModuleData,
          module_start_date: this.formatDate(this.editModuleData.module_start_date),
          module_end_date: this.formatDate(this.editModuleData.module_end_date),
        };

        const response = await axios.put(
          `project-modules/update-module/${this.editModuleData.module_id}`,
          dataToSend
        );

        if (response.status === 200 || response.status === 201) {
          this.dialogContent = {
            type: "success",
            message: "Module updated successfully!",
          };
          this.closeEditModuleDialog();
        } else {
          console.error("Failed to update module");
        }
      } catch (error) {
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message || "Failed to update module. Please try again.",
        };
      }
    },
    closeEditModuleDialog() {
      this.editModuleDialog = false;
    },
    openSubProEditDialog(subproject) {
      if (!subproject) {
        console.error("Subproject data is not available");
        return;
      }

      console.log("subproject", subproject);
      const startDate = subproject.sub_project_start_date
        ? new Date(subproject.sub_project_start_date)
        : new Date();

      const endDate = subproject.sub_project_end_date
        ? new Date(subproject.sub_project_end_date)
        : null;
      this.editSubprojectData = {
        sub_project_id: subproject.sub_project_id,
        sub_project_name: subproject.sub_project_name,
        sub_project_start_date: startDate,
        sub_project_end_date: endDate,
        project_id: subproject.project_id,
        sub_project_status: subproject.sub_project_status == 1 ? "Active" : "Inactive",
        sub_project_manager: subproject.sub_project_manager,
        user_ids: subproject.assigned_users.map((user) => user.user_id) || [],
      };
      console.log("subproject", this.editSubprojectData);
      this.SubProjectformattedEditStartDate = startDate
        ? startDate.toISOString().split("T")[0]
        : "";
      this.SubProjectformattedEditEndDate = endDate
        ? endDate.toISOString().split("T")[0]
        : "";

      this.editSubProDialog = true;
    },

    async submitEditSubproject() {
      console.log("subprojectedit data", this.editSubprojectData);
      if (!this.$refs.editsubForm.validate()) {
        this.errorMessage = "Please fill in all required fields correctly.";
        return;
      }
      try {
        const status = this.editSubprojectData.sub_project_status === "Active" ? 1 : 0;
        const dataToSend = {
          ...this.editSubprojectData,
          sub_project_status: status,
          sub_project_start_date: this.formatDate(
            this.editSubprojectData.sub_project_start_date
          ),
          sub_project_end_date: this.formatDate(
            this.editSubprojectData.sub_project_end_date
          ),
        };
        const response = await axios.put(
          `subprojects/update-subproject/${this.editSubprojectData.sub_project_id}`,
          dataToSend
        );
        if (response.status === 200 || response.status === 201) {
          (this.SubshowDialog = true), this.fetchSubprojects();
          this.dialogContent = {
            type: "success",
            message: "Component update successfully!",
          };
          this.closeSubProEditDialog();
        } else {
          console.error("Failed to update subproject");
        }
      } catch (error) {
        this.SubshowDialog = true;
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to update component. Please try again.",
        };
      }
    },
    closeSubProEditDialog() {
      this.editSubProDialog = false;
    },
    openDeleteDialog() {
      this.deleteDialog = true;
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
    },
    async deleteProject() {
      try {
        const response = await axios.delete(`projects/delete-project/${this.projectId}`);

        if (response.status === 200 || response.status === 201) {
          this.$emit("projectDeleted", this.projectId);
          (this.SubshowDialog = true),
            (this.dialogContent = {
              type: "success",
              message: "Subproject created successfully!",
            });
          this.$router.push("/");

          // Reload after a short delay to ensure the navigation happens first
          setTimeout(() => {
            location.reload();
          }, 300); // Delay for 300ms or adjust to your preference
          this.closeDeleteDialog();
        } else {
          alert("Failed to delete the project. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        this.SubshowDialog = true;
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message || "Failed to create module. Please try again.",
        };
        this.closeDeleteDialog();
      }
    },
    async openEditDialog() {
      try {
        this.loading = true;

        const response = await axios.get(`projects/view-project/${this.projectId}`);

        if (
          response.status === 200 ||
          (response.status === 201 && response.data.project)
        ) {
          const project = response.data.project;
          const startDate = project.project_start_date
            ? new Date(project.project_start_date)
            : new Date();

          const endDate = project.project_end_date
            ? new Date(project.project_end_date)
            : null;

          this.editProjectData = {
            project_name: project.project_name || "",
            project_start_date: startDate,
            project_end_date: endDate,
            project_status: project.project_status === 1 ? "Active" : "Inactive",
            project_manager: project.project_manager || null,
          };

          this.ProjectEditFormattedStartDate = startDate.toISOString().split("T")[0];
          this.ProjectEditFormattedEndDate = endDate
            ? endDate.toISOString().split("T")[0]
            : "";

          this.editProjectDialog = true;
          console.log("projects data", this.editProjectData);
        } else {
          this.errorMessage = "Unexpected response format. Please try again.";
          console.warn("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Unable to fetch project details. Please check your network or try again later.";
      } finally {
        this.loading = false;
      }
    },

    async handleUpdateProject() {
      if (!this.$refs.editProjectForm.validate()) {
        this.errorMessage = "Please fill in all required fields correctly.";
        return;
      }

      try {
        const status = this.editProjectData.project_status === "Active" ? 1 : 0;
        const dataToSend = {
          ...this.editProjectData,
          project_status: status,
          project_start_date: this.formatDate(this.editProjectData.project_start_date),
          project_end_date: this.formatDate(this.editProjectData.project_end_date),
        };
        const response = await axios.put(
          `projects/update-project/${this.projectId}`,
          dataToSend
        );
        this.$emit("projectUpdated", response.data.project); // Notify parent component
        this.closeEditDialog();
        this.getprojectbyid();
        (this.SubshowDialog = true),
          (this.dialogContent = {
            type: "success",
            message: "Project update successfully!",
          });
      } catch (error) {
        console.error("Error updating project:", error);
        this.SubshowDialog = true;
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to update project. Please try again.",
        };
      }
    },
    closeEditDialog() {
      this.editProjectDialog = false;
      this.errorMessage = null;
    },

    async fetchSubprojects() {
      try {
        const response = await axios.get(`subprojects/sub_by_project/${this.projectId}`);
        if (response.status === 200 || response.status === 201) {
          this.subprojects = response.data.subprojects;
          for (const subproject of this.subprojects) {
            await this.fetchModules(subproject.sub_project_id);
          }
        } else {
          console.error("Failed to fetch subprojects");
        }
      } catch (error) {
        console.error("Error fetching subprojects:", error.message);
      }
    },

    addSubproject(projectId) {
      this.addSubProjectData.project_id = projectId;
      this.AddSubdialog = true;
    },
    closeDialog() {
      this.AddSubdialog = false;
      this.resetForm();
    },
    async createSubproject() {
      const submissionData = {
        ...this.addSubProjectData,
        sub_project_start_date: this.formatDate(
          this.addSubProjectData.sub_project_start_date
        ),
        sub_project_end_date: this.formatDate(
          this.addSubProjectData.sub_project_end_date
        ),
      };
      try {
        const response = await axios.post(
          "subprojects/create-subproject",
          submissionData
        );
        if (response.status === 200 || response.status === 201) {
          this.AddSubdialog = false;
          this.resetForm();
          this.fetchSubprojects();
          (this.SubshowDialog = true),
            (this.dialogContent = {
              type: "success",
              message: "Subproject created successfully!",
            });
        }
      } catch (error) {
        console.error(error);
        this.dialogContent = {
          type: "error",
          message: "Failed to create subproject. Please try again.",
        };
      }
    },
    resetForm() {
      this.form = {
        sub_project_name: "",
        sub_project_start_date: "",
        sub_project_end_date: "",
        sub_project_status: 1,
        sub_project_manager: null,
        project_id: null,
        user_ids: [],
      };
    },
    SubcloseDeleteDialog() {
      this.SubdeleteDialog = false;
    },
    SubopenDeleteDialog(subprojectId) {
      console.log("Delete subproject with ID:", subprojectId);
      this.SubdeleteDialog = true;
      this.subprojectID = subprojectId;
    },

    async deleteSubProject() {
      try {
        const response = await axios.delete(
          `subprojects/delete-subproject/${this.subprojectID}`
        );

        if (response.status === 200 || response.status === 201) {
          this.$emit("SubprojectDeleted", this.subprojectID);
          (this.SubshowDialog = true),
            (this.dialogContent = {
              type: "success",
              message: "Subproject Delete successfully!",
            });
          this.fetchSubprojects();

          // Reload after a short delay to ensure the navigation happens first
          this.SubcloseDeleteDialog();
        } else {
          alert("Failed to delete the Subproject. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting Subproject:", error);
        this.SubshowDialog = true;
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to Delete subproject. Please try again.",
        };
        this.closeDeleteDialog();
      }
    },

    async fetchModules(subprojectId) {
      try {
        const response = await axios.get(
          `project-modules/modules_sub_project/${subprojectId}`
        );
        if (response.status === 200 || response.status === 201) {
          const subproject = this.subprojects.find(
            (sp) => sp.sub_project_id === subprojectId
          );
          if (subproject) {
            subproject.modules = response.data.modules;
          }
        } else {
          console.error("Failed to fetch modules for subproject", subprojectId);
        }
      } catch (error) {
        console.error("Error fetching modules:", error.message);
      }
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

    openAddModuleDialog(subprojectId) {
      this.moduleData.sub_project_id = subprojectId;
      this.addModuleDialog = true;
    },

    closeAddModuleDialog() {
      this.addModuleDialog = false;
    },

    addModuleData() {
      const submissionData = {
        ...this.moduleData,
        module_start_date: this.formatDate(this.moduleData.module_start_date),
        module_end_date: this.formatDate(this.moduleData.module_end_date),
      };
      axios
        .post("project-modules/create-module", submissionData)
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            this.$emit("moduleCreated", response.data.module); // Optionally emit event for parent component
            this.closeAddModuleDialog();
            this.resetModuleForm();
            this.fetchModules(response.data.module.sub_project_id);
            this.SubshowDialog = true;
            this.dialogContent = {
              type: "success",
              message: "Module created successfully",
            };
          }
        })
        .catch((error) => {
          console.error(error);
          this.SubshowDialog = true;
          this.dialogContent = {
            type: "error",
            message:
              error.response?.data?.message ||
              "Failed to create module. Please try again.",
          };
        });
    },
    resetModuleForm() {
      this.moduleData = {
        module_title: "",
        module_start_date: new Date(),
        module_end_date: new Date(),
        module_status: "active",
      };
    },
    ModulecloseDeleteDialog() {
      this.ModuledeleteDialog = false;
    },
    openDeleteModule(moduleId) {
      console.log("Delete module with ID:", moduleId);
      this.moduleId = moduleId;
      this.ModuledeleteDialog = true;
    },

    async deleteModule() {
      try {
        const response = await axios.delete(
          `project-modules/delete-module/${this.moduleId}`
        );

        if (response.status === 200 || response.status === 201) {
          this.$emit("ModuletDeleted", this.moduleId);
          (this.SubshowDialog = true),
            (this.dialogContent = {
              type: "success",
              message: "Module Delete successfully!",
            });
          this.fetchSubprojects();

          // Reload after a short delay to ensure the navigation happens first
          this.ModulecloseDeleteDialog();
        } else {
          alert("Failed to delete the Module. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting Module:", error);
        this.SubshowDialog = true;
        this.dialogContent = {
          type: "error",
          message:
            error.response?.data?.message || "Failed to Delete Module. Please try again.",
        };
        this.closeDeleteDialog();
      }
    },
    openAddTaskDialog(moduleId) {
      this.taskData.module_id = moduleId;
      this.addTaskDialog = true;
    },
    closeAddTaskDialog() {
      this.addTaskDialog = false;
      this.resetTaskForm();
    },

    createTask() {
      const submissionData = {
        ...this.taskData,
        ticket_start_date: this.formatDate(this.taskData.ticket_start_date),
        ticket_end_date: this.formatDate(this.taskData.ticket_end_date),
      };

      axios
        .post("project-tickets/create-ticket", submissionData)
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            this.$emit("taskCreated", response.data);
            this.addTaskDialog = false;
            this.SubshowDialog = true;
            this.dialogContent = {
              type: "success",
              message: "Module created successfully",
            };
            this.getProjectProgress();
            this.resetTaskForm();
          }
        })
        .catch((error) => {
          console.error(error);
          this.SubshowDialog = true;
          this.dialogContent = {
            type: "error",
            message:
              error.response?.data?.message ||
              "Failed to create module. Please try again.",
          };
        });
    },
    resetTaskForm() {
      this.taskData = {
        ticket_title: "",
        ticket_description: "",
        ticket_start_date: new Date(),
        ticket_end_date: new Date(),
        user_ids: [],
        ticket_status: "Progress",
      };
    },
    openStartDateDialog() {
      this.startDateDialog = true;
    },
    closeStartDateDialog() {
      this.startDateDialog = false;
    },
    saveStartDate() {
      this.startDateDialog = false;
    },
    openEndDateDialog() {
      this.endDateDialog = true;
    },
    closeEndDateDialog() {
      this.endDateDialog = false;
    },
    saveEndDate() {
      this.endDateDialog = false;
    },
    editProject() {
      console.log("Edit project ID:", this.projectId);
      // Add logic for editing the project
    },

    addModiules(subprojectId) {
      console.log("Edit subproject with ID:", subprojectId);
      // Add logic for editing the subproject
    },

    editSubproject(subprojectId) {
      console.log("Edit subproject with ID:", subprojectId);
      // Add logic for editing the subproject
    },

    openSubProDeletetDialog(subprojectId) {
      console.log("Delete subproject with ID:", subprojectId);
    },

    viewModule(moduleId) {
      console.log("View module with ID:", moduleId);
      this.$router.push({
        name: "ModuleTasks",
        params: { moduleId: moduleId },
      });
    },

    openEditModuleDialog(moduleId) {
      console.log("Edit module with ID:", moduleId);
    },

    getStatusClass(status) {
      return status === "active" ? "text-success" : "text-danger";
    },
  },

  beforeRouteUpdate(to, from, next) {
    if (to.params.project_id !== this.projectId) {
      this.projectId = to.params.project_id;
      this.projectName = to.params.project_name;
      this.getprojectbyid();
      this.subprojects = []; // Clear previous subprojects
      this.fetchSubprojects();
      this.getAllUser(); // Fetch subprojects for the new project
      this.getProjectProgress();
    }
    next(); // Allow route update to proceed
  },

  onStartDateSelected() {
    this.startDateMenu = false; // Close menu
  },
  onEndDateSelected() {
    this.endDateMenu = false; // Close menu
  },
  mounted() {
    this.projectId = this.$route.params.project_id;
    this.projectName = this.$route.params.project_name;
    this.getprojectbyid();
    this.fetchSubprojects();
    this.getAllUser();
    this.getProjectProgress();
  },
};
</script>
<style>
.v-tooltip > .v-overlay__content {
  background-color: #00b76b !important;
}
</style>
<style scoped>
.progress-container {
  background-color: #e0e0e0;
  border-radius: 50px;
  width: 100%;
  height: 20px;
  margin: 20px 0;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
}
.progress-bar {
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px; /* Larger text for better readability */
}
.project-details {
  padding: 40px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f8f9fa;
}

.project-box {
  background-color: #42a27b;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  padding-top: 50px; /* Added padding-top to create space for action icons */
}

.project-name {
  font-size: 2.5rem;
  font-weight: 600;
  color: #ffffff;
}

.icon-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  position: absolute;
  top: 10px; /* Positioning icons at the top-right */
  right: 10px;
}

.icon {
  cursor: pointer;
  font-size: 24px;
  color: #fff;
  border-radius: 50%;
  padding: 10px;
  transition: transform 0.3s ease-in-out;
}

.icon:hover {
  transform: scale(1.2);
}

.subprojects {
  margin-top: 50px;
}

.subprojects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.subproject-card {
  background-color: #42a27b;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  position: relative;
  padding-top: 50px; /* Added padding-top to create space for action icons */
}

.subproject-card:hover {
  transform: translateY(-5px);
}

.subproject-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #ffffff;
}

.subproject-description {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 25px;
}

.modules {
  margin-top: 20px;
}

.module-card {
  background-color: #f1f3f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 15px;
}

.module-actions {
  display: flex;
  gap: 10px;
}

.module-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.module-status {
  font-size: 1rem;
  color: #777;
}

.module-status.text-success {
  color: green;
}

.module-status.text-danger {
  color: red;
}

.view-btn {
  margin-top: 15px;
}

.no-subprojects {
  font-size: 1.25rem;
  color: #777;
  text-align: center;
}
.mod-icons {
  color: black;
}
</style>
