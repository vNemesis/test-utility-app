<template>
<div>
  <span v-shortkey="['ctrl', 's']" @shortkey="save()"></span>
  <vs-progress indeterminate color="success" v-if="autoSaving"></vs-progress>
  <div class="row" :class="autoSaving ? 'my-4' : 'my-5'">
    <div class="col-md-12 text-center">


      <br>

      <div class="row">
        <div class="col-sm-12">

          <vs-tabs :color="tabColour" vs-alignment="center">
            <!-- Application Save / Load -->
            <vs-tab @click="tabColour = 'rgb(204, 98, 0)'" vs-label="Save | Load">
              <p>Save/Load test plan in the application</p>
              <vs-button type="line" :color="tabColour" @click="save()">Save Test Plan</vs-button>
              <vs-button type="line" :color="tabColour" @click="activePromptLoadPlan = true">Load Test Plan</vs-button>
            </vs-tab>
            <!-- Application Save / Load -->
            <!-- Generation -->
            <vs-tab @click="tabColour = 'rgb(100, 175, 134)'" vs-label="Generate">
              <p>Format plan for different applications</p>
              <vs-button type="line" :color="tabColour" @click="copy(generateJiraTable(), 'Jira Table has been copied to your clipboard')">Generate Jira Table</vs-button>
              <vs-button type="line" color="rgb(116, 204, 201)" @click="previewJiraTable()">Preview Jira Table</vs-button>
              |
              <vs-button type="line" :color="tabColour" @click="generateSpecflow('api')">Generate API Specflow Scenarios</vs-button>
              <vs-button type="line" :color="tabColour" @click="generateSpecflow('ui')">Generate UI Specflow Scenarios</vs-button>
            </vs-tab>
            <!-- Generation -->
            <!-- Export / Import -->
            <vs-tab @click="tabColour = 'rgb(120, 157, 232)'" vs-label="Import | Export">
              <p>Export/Import the test plan to/from outside of the application</p>

              <vs-row class="justify-content-center">
                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
                  <vs-button type="line" class="mr-1" :color="tabColour" @click="exportToJiraCSV(true)">Export Jira CSV</vs-button>
                  <vs-button type="line" :color="tabColour" @click="importFromJiraCSV()">Import Jira CSV</vs-button>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
                  <vs-button type="line" class="mr-1" :color="tabColour" @click="exportToJson(true)">Export JSON</vs-button>
                  <vs-button type="line" :color="tabColour" @click="importFromJson()">Import JSON</vs-button>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
                  <vs-button type="line" :color="tabColour" @click="activePromptImportFromExcel = true">Import from Excel Clipboard</vs-button>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
                  <vs-button type="line" color="danger" :disabled="true" @click="exportToJiraPopup.active = true">Export to Jira</vs-button>
                </vs-col>
              </vs-row>

              <vs-row class="justify-content-center mt-2">
                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="12">
                  <p>Current file location: {{ fileLocation.location ? fileLocation.location : 'No location set'}}</p>
                </vs-col>
              </vs-row>

            </vs-tab>
            <!-- Export / Import -->
          </vs-tabs>
        </div>
      </div>

      <div class="row justify-content-center mt-5">
        <div class="col-md-3">
          <vs-select autocomplete placeholder="Search and select" label="Application" label-placeholder="vs-Autocomplete" :danger="validation.application" danger-text="Please select an application" class="w-100" v-model="app">
            <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="(item,index) in appOptions" />
          </vs-select>
        </div>
        <div class="col-md-3">
          <vs-input label="Assignee" placeholder="User.Name" :danger="validation.assignee" danger-text="Assignee cannot be empty" v-model="assignee" class="w-100"/>
        </div>
        <div class="col-md-3">
          <vs-input label="Jira Task (Parent Task ID)" placeholder="AZCI-XXX" :danger="validation.jiraTask" danger-text="Jira Task cannot be empty" v-model="jiraTask" class="w-100"/>
        </div>
        <div class="col-md-3">
          <vs-input label="Plan Description" placeholder="Area" v-model="planDesc" class="w-100"/>
        </div>
      </div>

      <br>

      <vs-collapse>
      <vs-collapse-item icon-arrow="menu">
        <div slot="header" class="text-right mr-4">
          Options
        </div>
        <vs-row>
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
            Order Items 
            <vs-switch id="order" v-model="order" class="center-item"></vs-switch>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
            Autosave 
            <vs-switch id="autosave" v-model="autoSave" class="center-item">
              <span slot="on">On</span>
              <span slot="off">Off</span>
            </vs-switch>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
            <vs-button type="line" :color="this.$store.state.settings.theme.darkMode === true ? 'primary' : 'dark'" @click="addItemsPopup.active = true">Bulk add test items</vs-button>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">
            <vs-button type="line" :color="this.$store.state.settings.theme.darkMode === true ? 'primary' : 'dark'" @click="bulkOpPopup.active = true">Bulk operations</vs-button>
          </vs-col>
        </vs-row>
      </vs-collapse-item>
      </vs-collapse>

      <div class="table-responsive">
        <table class="table mt-2">
          <thead>
            <th width="2.5%"></th>
            <th width="2.5%">Jira Task ID</th>
            <th width="20%">Test Name</th>
            <th width="7.5%">Test Type</th>
            <th width="30%">Test Purpose</th>
            <th width="25%">Gherkin</th>
            <th width="7.5%">Priority</th>
            <th width="5%"></th>
          </thead>
          <tbody>
              <tr is="test-item" v-for="(test, index) in testItems" :key="test.id"
              v-bind:testdata="test"
              v-bind:totalNumberOfTestItems="testItems.length"
              v-bind:order="order"
              v-bind:priorities="project.priorites"
              v-on:remove-self="removeTestItem(index)"
              v-on:move-up="moveTestItem(index, index - 1)"
              v-on:move-down="moveTestItem(index, index + 1)"
              v-on:show-preview="showPreview"
              v-on:duplicate="addTestItem(test)"></tr>
          </tbody>
        </table>
      </div>
      <!-- <a  class="text-white btn-block btn-success py-2"></a> -->
      <vs-button @click="addTestItem()" color="primary" type="flat" class="py-2 w-100"><font-awesome-icon icon="plus" size="2x" /></vs-button>
    </div>
  </div>

  <div id="globals">
    <!-- Load Test Plan -->
    <vs-popup title="Load Test Plan" :active.sync="activePromptLoadPlan">
      <div class="row m-0">
        <div class="col-sm-12">
          <vs-select label="Select a test plan to load" vs-autocomplete v-model="planID" :danger="LoadPlanWarning" danger-text="Please select a test plan" class="w-100">
            <vs-select-item :key="index" :value="index" :text="`${index} - ${item.planDesc}`" v-for="(item,index) in allTestPlans" />
          </vs-select>
          <br>
          <vs-button @click="load(planID)" color="primary" type="border">Load Test Plan</vs-button>
          <vs-button @click="deletePlan(planID)" color="danger" type="border">Delete</vs-button>
        </div>
      </div>
    </vs-popup>
    <!-- Load Test Plane -->

    <!-- Import from Excel -->
    <vs-popup fullscreen title="Import for Excel" :active.sync="activePromptImportFromExcel">
      <div class="row justify-content-center m-0">
        <div class="col-sm-12">
          <small>You may need to click inside this window for the table to appear!</small>
          <div id="hot-preview">
            <HotTable ref="excelTable" :settings="hotTableSettings"></HotTable>
          </div>
          <vs-button @click="importFromExcelData()" color="primary" type="border" class="mt-3">Import</vs-button>
        </div>
      </div>
    </vs-popup>
    <!-- Import from Excel -->

    <!-- Add Items -->
    <vs-popup title="Add Test Items" :active.sync="addItemsPopup.active">

      <vs-input label="Jira Subtask ID" placeholder="AZCI-XXX" v-model="addItemsPopup.item.jiraTaskId" class="mb-3"/>

      <vs-textarea v-model="addItemsPopup.item.testName" label="Test Name (Summary)"/>

      <vs-select label="Type" v-model="addItemsPopup.item.testType" class="w-100 mb-3">
        <vs-select-item :key="index" :value="item" :text="item" v-for="(item,index) in {API: 'API', UI: 'UI'}" />
      </vs-select>

      <vs-textarea v-model="addItemsPopup.item.testPurpose" label="Test Purpose"/>

      <vs-textarea v-model="addItemsPopup.item.gherkin" label="Gherkin code for test"/>

      <vs-select label="Priority" v-model="addItemsPopup.item.priority" class="w-100 mb-3">
        <vs-select-item :key="index" :value="item.id" :text="item.name" v-for="(item,index) in project.priorities" />
      </vs-select>

      <div class="row">
        <div class="col-sm-3">
          <vs-button @click="bulkAdd()" color="primary" type="border">Add Items</vs-button>
        </div>
        <div class="col-sm-9 text-center">
          <small>Amount</small>
          <vs-input-number v-model="addItemsPopup.amount" size="mini" min="1"/>
        </div>
      </div>
    </vs-popup>
    <!-- Add Items -->

    <!-- Bulk Op -->
    <vs-popup title="Bulk Operations" :active.sync="bulkOpPopup.active">

      <vs-row>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="9">
          <vs-input label="Start ID" placeholder="AZCI-123" :danger="!this.bulkOpPopup.changeJiraID.valid" danger-text="Jira ID format is invalid"
            description-text="This will change all ticket id's to sequential id's starting from this one" v-model="bulkOpPopup.changeJiraID.startID"
            class="mb-3 w-75"/>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="flex-start" vs-w="3">
          <vs-button @click="bulkChangeJiraIds()" color="primary" type="line" class="mt-4 w-100">Start</vs-button>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="9">
          <vs-select label="Priority" v-model="bulkOpPopup.changePriorities.priority" class="w-75 mb-3"
          :danger="!this.bulkOpPopup.changePriorities.valid" danger-text="Please Select a Priority" 
          description-text="This will change all ticket priorities to the selected value">
            <vs-select-item :key="index" :value="item.id" :text="item.name" v-for="(item,index) in project.priorities" />
          </vs-select>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="flex-start" vs-w="3">
          <vs-button @click="bulkChangePriorities()" color="primary" type="line" class="w-100 mt-4">Start</vs-button>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="9">
          <vs-select label="Test Type" v-model="bulkOpPopup.changeTestType.testType" class="w-75 mb-3"
          :danger="!this.bulkOpPopup.changeTestType.valid" danger-text="Please Select a Test Type" 
          description-text="This will change all test types to the selected value">
            <vs-select-item :key="index" :value="item" :text="item" v-for="(item,index) in {API: 'API', UI: 'UI'}" />
          </vs-select>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="flex-start" vs-w="3">
          <vs-button @click="bulkChangeTestType()" color="primary" type="line" class="w-100 mt-4">Start</vs-button>
        </vs-col>
      </vs-row>

    </vs-popup>
    <!--  Bulk Op  -->

    <!-- Preview -->
    <vs-popup title="Code Preview" :active.sync="previewPopup.active">
      <highlight-code class="text-left" :lang="previewPopup.syntax" :code="previewPopup.code"></highlight-code>
    </vs-popup>
    <!-- Preview -->

    <!-- Jira Preview -->
    <vs-popup fullscreen title="Jira Table Preview" :active.sync="JiraPreviewPopup.active">
          <div class="table-responsive">
              <table class="table">
              <thead>
                <tr>
                  <td>
                    Jira Issue ID
                  </td>
                  <td>
                    Type
                  </td>
                  <td>
                    Test Name  
                  </td>
                  <td>
                    Test Purpose
                  </td>
                </tr>
              </thead>
              <tbody v-html="JiraPreviewPopup.text">

              </tbody>
            </table>
          </div>
          
    </vs-popup>
    <!-- Jira Preview -->

    <!-- Preview -->
    <vs-popup title="Code Preview" :active.sync="previewPopup.active">
      <highlight-code class="text-left" :lang="previewPopup.syntax" :code="previewPopup.code"></highlight-code>
    </vs-popup>
    <!-- Preview -->

    <!-- Jira Upload -->
    <vs-popup title="Upload to Jira" :active.sync="exportToJiraPopup.active">
      <div class="row m-0">
        <div class="col-sm-12">
          <vs-input label-placeholder="Username" type="text" v-model="exportToJiraPopup.username"/>
          <vs-input label-placeholder="Password" type="password" class="mt-4" v-model="exportToJiraPopup.password"/>
        </div>
      </div>
      <div class="row mt-3 mx-0">
        <div class="col-sm-12">
          <vs-button id="jiraUploadButton" class="vs-con-loading__container" :disabled="exportToJiraPopup.working"
                     @click="uploadToJira()" color="primary" type="border">
                     Upload
          </vs-button>
        </div>
      </div>
      <hr>
      <div class="row mt-2 mx-0">
        <div class="col-sm-12">
          <vs-textarea v-if="exportToJiraPopup.log" label="Log" rows="15" class="w-100" v-model="exportToJiraPopup.log" readonly />
        </div>
      </div>
    </vs-popup>
    <!-- Jira Upload -->

  </div>

</div>
</template>
<script>
import TestItem from './TestItem'
import { HotTable } from '@handsontable/vue'
import Papa from 'papaparse'
import _ from 'lodash'
import axios from 'axios'

const remote = require('electron').remote
var fs = require('fs')

const {clipboard} = require('electron')

export default {
  name: 'test-plan-creator',
  components: { TestItem, HotTable },

  data: function () {
    return {
      autoSave: false,
      autoSaving: false,
      // Plan
      fileLocation: {location: '', type: ''},
      planID: '',
      jiraTask: '',
      planDesc: '',
      assignee: '',
      app: '',
      testItems: [],
      appOptions: [
        {text: 'Cash', value: 'Cash'},
        {text: 'Collect', value: 'Collect'}
      ],
      // Validation
      validation: {
        jiraTask: true,
        assignee: true,
        application: true
      },
      // Popups
      activePromptLoadPlan: false,
      LoadPlanWarning: false,
      addItemsPopup: {
        active: false,
        item: {
          id: 0,
          jiraTaskId: '',
          testType: '',
          testName: '',
          testPurpose: '',
          gherkin: '',
          priority: 5
        },
        amount: 1
      },
      bulkOpPopup: {
        active: false,
        changeJiraID: {
          startID: '',
          valid: true
        },
        changePriorities: {
          priority: '',
          valid: true
        },
        changeTestType: {
          testType: '',
          valid: true
        }
      },
      activePromptImportFromExcel: false,
      previewPopup: {
        active: false,
        syntax: '',
        code: ''
      },
      JiraPreviewPopup: {
        active: false
      },
      exportToJiraPopup: {
        active: false,
        username: '',
        password: '',
        log: '',
        complete: false,
        working: false
      },
      // HotTable
      hotTableSettings: {
        startRows: 5,
        startCols: 4,
        colHeaders: ['Jira ID', 'Test Type', 'Test Name', 'Test Purpose'],
        rowHeaders: true
      },
      // Menu
      tabColour: 'rgb(204, 98, 0)',
      order: false,
      // Project Data
      project: {
        id: 0,
        subTaskId: 0,
        taskId: 0,
        priorities: [
          { id: 2, name: 'Critical' },
          { id: 3, name: 'Major' },
          { id: 4, name: 'Minor' },
          { id: 5, name: 'Trivial' }
        ]
      }
    }
  },

  computed: {
    allTestPlans () {
      return this.$root.getTestPlans()
    },
    settings () {
      return this.$store.state.settings
    }
  },

  mounted () {
    if (this.assignee === '' && this.settings.planCreator.defaultAssignee !== '') {
      this.assignee = this.settings.planCreator.defaultAssignee
    }

    if (this.exportToJiraPopup.username === '' && this.settings.api.jiraUsername !== '') {
      this.exportToJiraPopup.username = this.settings.api.jiraUsername
    }
  },

  watch: {
    jiraTask (val) {
      if (val === '') {
        // Set this to true to show error message
        this.validation.jiraTask = true
      } else {
        this.validation.jiraTask = false
      }
    },

    assignee (val) {
      if (val === '') {
        // Set this to true to show error message
        this.validation.assignee = true
      } else {
        this.validation.assignee = false
      }
    },

    app (val) {
      if (val === '') {
        // Set this to true to show error message
        this.validation.application = true
      } else {
        this.validation.application = false
      }
    },

    testItems: {
      handler: function () {
        if (this.autoSave) {
          this.autoSaveHandler()
          this.autoSaving = true
        }
        // TODO: Add method to check for duplicate Jira Task ID's
      },
      deep: true
    }
  },

  methods: {

    autoSaveHandler: _.debounce(function () {
      this.save()
      this.autoSaving = false
    }, 6000),
    goBack () {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/')
    },

    // ----------------------------------------------- Test Items -----------------------------------------------
    moveTestItem (from, to) {
      this.testItems.splice(to, 0, this.testItems.splice(from, 1)[0])
      for (let i = 0; i < this.testItems.length; i++) {
        this.testItems[i].id = i + 1
      }
    },
    // TODO: convert into an object class
    addTestItem (testItem = null) {
      if (testItem === null) {
        this.testItems.push({
          id: this.testItems.length + 1,
          jiraTaskId: 'AZCI-XXX',
          testType: '',
          testName: '',
          testPurpose: '',
          gherkin: '',
          priority: 5
        }
        )
      } else {
        let duplicate = _.cloneDeep(testItem)
        duplicate.id = this.testItems.length + 1
        this.testItems.push(duplicate)
      }
    },
    removeTestItem (index) {
      this.testItems.splice(index, 1)
      for (let i = 0; i < this.testItems.length; i++) {
        this.testItems[i].id = i + 1
      }
    },
    bulkAdd () {
      for (let i = 0; i < this.addItemsPopup.amount; ++i) {
        this.addTestItem(this.addItemsPopup.item)
      }

      this.addItemsPopup.active = false

      this.$vs.notify({
        title: 'Items added',
        text: 'Items added successfully',
        color: 'success',
        // icon: 'publish',
        position: this.settings.notifPos,
        time: 4000
      })
    },

    // -----------------------------------------------   API  -----------------------------------------------

    // Get AZCI project metadata
    apiGetJiraProjectData (auth) {
      return axios.get(`https://rimilia.atlassian.net/rest/api/3/issue/createmeta?projectKeys=AZCI`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'json'
        })
        .then(response => {
          // Check issue retrived is a task
          if (response.data.projects.length === 0) {
            this.$vs.notify({
              title: `No Projects found`,
              text: 'Please check the AZCI project is visible and that you have permission to view it.',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
            this.$vs.loading.close('#jiraUploadButton > .con-vs-loading')
            this.exportToJiraPopup.working = false
            return
          }

          this.project.id = parseInt(response.data.projects[0].id)
          this.project.subTaskId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Sub-task' && x.subtask === true).id)
          this.project.taskId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Task' && x.subtask === false).id)
        })
        .catch(error => {
          // If Unauthorised
          if (error.response.status === 401) {
            this.$vs.notify({
              title: 'Unauthorised',
              text: 'Please check you entered the password correctly and that you have permission to view the AZCI Project.',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          // if project not found
          } else if (error.response.status === 404) {
            this.$vs.notify({
              title: 'No response was found',
              text: 'Please check the AZCI project is visible and that you have permission to view it.',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          }
        })
    },

    apiGetJiraPriorities (auth) {
      return axios.get('https://rimilia.atlassian.net/rest/api/3/priority',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'json'
        })
        .then(response => {
          let data = response.data
          data.forEach(element => {
            let index = data.findIndex((e) => e.id === element.id)
            if (index === -1) {
              this.project.priorities.push({ id: element.id, name: element.name })
            } else {
              this.project.priorities[index] = { id: element.id, name: element.name }
            }
          })
        })
        .catch(error => {
          // If Unauthorised
          if (error.response.status === 401) {
            this.$vs.notify({
              title: 'Unauthorised',
              text: 'Please check you entered the password correctly and that you have permission to view the AZCI Project.',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          // if project not found
          } else if (error.response.status === 404) {
            this.$vs.notify({
              title: 'No response was found',
              text: 'Please check the AZCI project is visible and that you have permission to view it.',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          }
        })
    },

    // ----------------------------------------------- Export -----------------------------------------------

    exportToJiraCSV (showDialog) {
      if (!this.jiraTask) {
        this.$vs.notify({
          title: 'Error!',
          text: 'Please specify a Jira Task ID',
          color: 'danger',
          position: this.settings.notifPos,
          time: 4000
        })
        return
      }
      let csvContent = ''
      csvContent += ['Test Name (Summary)', 'Test Purpose (Description)', 'Jira Task (Parent Id)', 'Issue Type', 'Assignee', 'Priority', 'Application'].join(',') + '\r\n'

      this.testItems.forEach(element => {
        let title = `"${element.testName}"`
        let description = `"Test Description: ${element.testPurpose} \r\n\r\nTest Type: ${element.testType} \r\n\r\n{code}\r\n${element.gherkin}\r\n{code}"`
        let row = [title, description, this.jiraTask, 'sub-task', this.assignee, this.projectpriorities.find(x => x.id === element.priority).name, this.app].join(',')
        csvContent += row + '\r\n'
      })

      this.exportFile(`Jira Issue Import ${this.jiraTask}.csv`, csvContent, 'CSV File', 'csv', showDialog)
    },
    exportToJson (showDialog) {
      if (!this.jiraTask) {
        this.$vs.notify({
          title: 'Error!',
          text: 'Please specify a Jira Task ID',
          color: 'danger',
          position: this.settings.notifPos,
          time: 4000
        })
        return
      }

      let plan = {
        testItems: this.testItems,
        jiraTask: this.jiraTask,
        planDesc: this.planDesc,
        assignee: this.assignee,
        app: this.app
      }

      let jsonContent = JSON.stringify(plan)
      this.exportFile(`Test Plan ${this.jiraTask}.json`, jsonContent, 'JSON File', 'json', showDialog)
    },

    uploadToJira () {
      this.exportToJiraPopup.working = true
      if (!this.jiraTask) {
        this.$vs.notify({
          title: 'Error!',
          text: 'Please specify a Jira Task ID',
          color: 'danger',
          position: this.settings.notifPos,
          time: 4000
        })
        return
      }

      this.$vs.loading({
        color: '#000',
        container: '#jiraUploadButton',
        scale: 0.45,
        type: 'sound'
      })

      /**
       * 1. Fetch AZCI metadata
       * 2. Fetch AZCI Issue
       * 3. check for existing sub-tasks
       * 4. create new sub-task if ticket it does not exist
       * 5. update sub-tasks with information
       */

      // Create Base64 auth value
      let auth = btoa(`${this.exportToJiraPopup.username}:${this.exportToJiraPopup.password}`)

      axios.all([this.apiGetJiraProjectData(auth), this.apiGetJiraPriorities(auth)])
        .then(axios.spread(function (acct, perms) {
        }))

      // call for jira task
      axios.get(`https://rimilia.atlassian.net/rest/api/3/issue/${this.jiraTask}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'json'
        })
        .then(response => {
          // Check issue retrived is a task
          if (parseInt(response.data.fields.issuetype.id) !== this.project.taskId) {
            this.$vs.notify({
              title: 'Error',
              text: `The issue <strong>${this.jiraTask}</strong> is not a task, pleae check you have the correct issue ID.`,
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
            this.exportToJiraPopup.log += `Specified Task ID ${this.jiraTask} is not of type 'Task'\n`
            return
          }

          // get sub tasks
          let subTasks = response.data.fields.subtasks

          // Create sub-tasks that do not exist, update current ones
          let grammer = subTasks.length === 1 ? 's' : ''
          this.exportToJiraPopup.log += `Found ${subTasks.length} sub-task${grammer} for ${this.jiraTask}.\n`
          this.exportToJiraPopup.log += `Updating exisiting sub-task${grammer}${this.testItems.length > subTasks.length ? ' and adding new tasks' : ''}`

          let subTaskKeys = subTasks.map(item => item.key)

          /**
           * id, jiraTaskId, testType, testName, testPurpose, gherkin, priority
           */

          /** let issues = {
                issueUpdates: [
                  {
                    update: {},
                    fields: {
                      project: {
                        id: '1000'
                      },
                      summary: 'something\'s very wrong',
                      issuetype: {
                        id: '10000'
                      },
                      assignee: {
                        name: 'jerry'
                      },
                      priority: {
                        id: '20000'
                      },
                      labels: [
                        'new_release'
                      ],
                      timetracking: {
                        originalEstimate: '15',
                        remainingEstimate: '5'
                      },
                      security: {
                        id: '10000'
                      },
                      versions: [
                        {
                          id: '10000'
                        }
                      ],
                      environment: {
                        type: 'doc',
                        version: 1,
                        content: [
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                text: 'environment'
                              }
                            ]
                          }
                        ]
                      },
                      description: {
                        type: 'doc',
                        version: 1,
                        content: [
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                text: 'description'
                              }
                            ]
                          }
                        ]
                      },
                      duedate: '2011-04-16',
                      fixVersions: [
                        {
                          id: '10001'
                        }
                      ],
                      components: [
                        {
                          id: '10000'
                        }
                      ],
                      customfield_30000: [
                        '10000',
                        '10002'
                      ],
                      customfield_80000: {
                        value: 'red'
                      },
                      customfield_20000: '06/Jul/11 3:25 PM',
                      customfield_40000: 'this is a text field',
                      customfield_70000: [
                        'jira-administrators',
                        'jira-software-users'
                      ],
                      customfield_60000: 'jira-software-users',
                      customfield_50000: 'this is a text area. big text.',
                      customfield_10000: '09/Jun/81'
                    }
                  }
                ]
                }
                */

          this.testItems.forEach(element => {
            if (subTaskKeys.includes(element.jiraTaskId)) {
            }
          })

          // axios.post('/user', {
          // })
          //   .then(function (response) {
          //     console.log(response)
          //   })
          //   .catch(function (error) {
          //     console.log(error)
          //   })
        })
        .catch(function (error) {
          // If Unauthorised
          if (error.response.status === 401) {
            this.$vs.notify({
              title: 'Unauthorised',
              text: `Please check you entered the password correctly and that you have permission to view issue ${this.jiraTask}.`,
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          // if issue not found
          } else if (error.response.status === 404) {
            this.$vs.notify({
              title: `Task ${this.jiraTask} was not found`,
              text: 'Please check you entered the correct <strong>Jira Task ID</strong> and that you have permission to view it.',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          }
        }.bind(this))
        .then(function () {
          // close loading, set working to false
          this.$vs.loading.close('#jiraUploadButton > .con-vs-loading')
          this.exportToJiraPopup.working = false
        }.bind(this))
    },

    // ----------------------------------------------- App Saving / Loading -----------------------------------------------

    // Will save to internal storage and external is file location is specified
    save () {
      let plan = {
        testItems: this.testItems,
        jiraTask: this.jiraTask,
        assignee: this.assignee,
        app: this.app
      }

      if (!(this.validation.jiraTask || this.validation.assignee || this.validation.application)) {
        let jsonContent = {
          data: JSON.stringify(plan),
          planDesc: this.planDesc
        }
        let externalSave = false

        this.$root.saveTestPlan(`${this.jiraTask}`, jsonContent)

        this.allTestPlans[this.jiraTask] = jsonContent

        if (this.fileLocation.type === 'json') {
          this.exportToJson(false)
          externalSave = true
        } else if (this.fileLocation.type === 'csv') {
          this.exportToJiraCSV(false)
          externalSave = true
        }

        this.$vs.notify({
          title: 'Plan Saved',
          text: `Plan ${this.jiraTask} was saved to app${externalSave ? ' and external file' : ' '} successfully`,
          color: 'success',
          // icon: 'publish',
          position: this.settings.notifPos,
          time: 4000
        })
      } else {
        this.$vs.notify({
          title: 'Validation Errors',
          text: `Please first resolve all current validation errors before saving`,
          color: 'danger',
          // icon: 'publish',
          position: this.settings.notifPos,
          time: 4000
        })
      }
    },
    load (key) {
      if (key === '') {
        this.LoadPlanWarning = true
        return
      }
      let plan = this.$root.getTestPlan(key)
      let parsedData = JSON.parse(plan.data)
      this.fileLocation = {location: '', type: ''}

      if (parsedData === {}) {
        return
      }

      this.testItems = parsedData.testItems
      this.jiraTask = parsedData.jiraTask
      this.planDesc = plan.planDesc
      this.assignee = parsedData.assignee
      this.app = parsedData.app

      this.LoadPlanWarning = false
      this.activePromptLoadPlan = false
    },
    deletePlan (key) {
      if (key === '') {
        this.LoadPlanWarning = true
        return
      }

      this.$root.deleteTestPlan(key)

      delete this.allTestPlans[key]

      this.planID = ''

      this.$vs.notify({
        title: 'Plan deleted',
        text: `Plan "${key}" was deleted successfully`,
        color: 'success',
        // icon: 'delete_forever',
        position: this.settings.notifPos,
        time: 4000
      })

      this.LoadPlanWarning = false
      this.activePromptLoadPlan = false
    },

    // ----------------------------------------------- Import -----------------------------------------------

    importFromJson () {
      remote.dialog.showOpenDialog({
        filters: [
          { name: 'JSON File', extensions: ['json'] }
        ]
      },
      (fileName) => {
        // fileNames is an array that contains all the selected
        if (fileName === undefined) {
          return
        }

        fs.readFile(fileName[0], 'utf-8', (err, data) => {
          if (err) {
            this.$vs.notify({
              title: 'Error!',
              text: `An error ocurred creating the file: ${err.message}`,
              color: 'danger',
              // icon: 'error_outline',
              position: this.settings.notifPos,
              time: 4000
            })
          } else {
            if (confirm('Saving and auto-saving will save your test plan in the app, would you like it to also save to this file?')) {
              this.fileLocation = {location: fileName[0], type: 'csv'}
            } else {
              this.fileLocation = {location: '', type: ''}
            }
            this.$vs.notify({
              title: 'File Imported!',
              text: `File "${fileName[0]}" was imported successfully`,
              color: 'success',
              // icon: 'publish',
              position: this.settings.notifPos,
              time: 4000
            })
            let parsedData = JSON.parse(data)

            this.testItems = parsedData.testItems
            this.jiraTask = parsedData.jiraTask
            this.planDesc = parsedData.planDesc
            this.assignee = parsedData.assignee
            this.app = parsedData.app
          }
        })
      })
    },
    importFromJiraCSV () {
      remote.dialog.showOpenDialog({
        filters: [
          { name: 'CSV File', extensions: ['csv'] }
        ]
      },
      (fileName) => {
        // fileNames is an array that contains all the selected
        if (fileName === undefined) {
          return
        }

        fs.readFile(fileName[0], 'utf-8', (err, data) => {
          if (err) {
            this.$vs.notify({
              title: 'Error!',
              text: `An error ocurred loading the file: ${err.message}`,
              color: 'danger',
              // icon: 'error_outline',
              position: this.settings.notifPos,
              time: 4000
            })
          } else {
            if (confirm('Saving and auto-saving will save your test plan in the app, would you like it to also save to this file?')) {
              this.fileLocation = {location: fileName[0], type: 'csv'}
            } else {
              this.fileLocation = {location: '', type: ''}
            }
            this.$vs.notify({
              title: 'File Imported!',
              text: `File "${fileName[0]}" was imported successfully`,
              color: 'success',
              // icon: 'publish',
              position: this.settings.notifPos,
              time: 4000
            })
            let parsedData = Papa.parse(data).data

            for (let index = 1; index < parsedData.length; index++) {
              let testPurposeSplit = parsedData[index][1].split('\r\n\r\n')

              let testItem = {
                id: this.testItems.length + 1,
                jiraTaskId: parsedData[index][2],
                testType: testPurposeSplit[1].substring(11).trim(),
                testName: parsedData[index][0],
                testPurpose: testPurposeSplit[0].substring(18).trim(),
                gherkin: testPurposeSplit[2].split('{code}').join('').trim(),
                priority: parseInt(parsedData[index][5])
              }

              this.testItems.push(testItem)
            }
          }
        })
      })
    },
    importFromExcelData () {
      this.$refs.excelTable.hotInstance.getData().forEach(element => {
        this.testItems.push({
          id: this.testItems.length + 1,
          jiraTaskId: element[0] == null ? 'AZCI-XXX' : element[0],
          testType: element[1] == null ? '' : element[1],
          testName: element[2] == null ? 'Enter a Test name' : element[2],
          testPurpose: element[3] == null ? 'Enter Description' : element[3],
          gherkin: '',
          priority: 0
        }
        )
      })

      this.$vs.notify({
        title: 'Test Plan Imported',
        text: 'A Test Plan has been created from your excel data',
        color: 'success',
        // icon: 'publish',
        position: this.settings.notifPos,
        time: 4000
      })

      this.activePromptImportFromExcel = false
    },

    // ----------------------------------------------- Generate -----------------------------------------------

    generateJiraTable () {
      let jiraTable = ''
      let formattedPurpose = ''
      jiraTable += '||JIRA Issue ID||Type||Test Name||Test Purpose||\r\n'

      this.testItems.forEach(element => {
        // Going to add New lines
        if (this.$store.state.settings.planCreator.jiraNewLine) {
          let words = element.testPurpose.split(' ')
          let currentCharacterCount = 0
          words.forEach(element => {
            currentCharacterCount += element.length
            if (currentCharacterCount > this.$store.state.settings.planCreator.jiraNewLineAmount) {
              formattedPurpose += element + '\\\\'
              currentCharacterCount = 0
            } else {
              formattedPurpose += element
            }
          })
        } else {
          formattedPurpose = element.testPurpose
        }

        jiraTable += `|[${element.jiraTaskId}]|${element.testType}|${element.testName}|${formattedPurpose}|\r\n`
      })

      return jiraTable
    },
    generateSpecflow (type) {
      let Specflow = ''

      this.testItems.forEach(element => {
        if (type.toLowerCase() === element.testType.toLowerCase()) {
          Specflow += `Scenario: ${element.testName}\r\n`
        }
      })
      clipboard.writeText(Specflow)
      this.$vs.notify({
        title: 'Copied to clipboard',
        text: `SpecFlow ${type.toUpperCase()} scenario definitions have been copied to your clipboard`,
        color: 'success',
        // icon: 'assignment',
        position: this.settings.notifPos,
        time: 4000
      })
    },
    // -------------------------------------------- Bulk Operations --------------------------------------------

    bulkChangeJiraIds () {
      let jiraIssuePattern = new RegExp('^((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\\d+)$')

      if (jiraIssuePattern.test(this.bulkOpPopup.changeJiraID.startID)) {
        this.bulkOpPopup.changeJiraID.valid = true

        if (this.testItems.length === 0) {
          this.$vs.notify({
            title: 'Error',
            text: 'You do not have any Tests to update',
            color: 'danger',
            position: this.settings.notifPos,
            time: 4000
          })
          this.bulkOpPopup.changeJiraID.startID = ''
          this.bulkOpPopup.active = false
          return
        }

        for (let index = 0; index < this.testItems.length; index++) {
          let element = this.testItems[index]

          try {
            let id = parseInt(this.bulkOpPopup.changeJiraID.startID.match('([0-9]+\\d)'))

            let projectKey = this.bulkOpPopup.changeJiraID.startID.match('([A-Z]{1,})')
            console.log(projectKey)
            element.jiraTaskId = (index === 0 ? `${projectKey[0]}-${id}` : `${projectKey[0]}-${id + index}`)
          } catch (error) {
            this.$vs.notify({
              title: 'Error',
              text: `Error occured: ${error}`,
              color: 'error',
              position: this.settings.notifPos,
              time: 4000
            })
          }
        }
        this.bulkOpPopup.changeJiraID.startID = ''
        this.bulkOpPopup.active = false
        this.$vs.notify({
          title: 'Operation completed',
          text: 'Bulk operation completed with no errors',
          color: 'success',
          position: this.settings.notifPos,
          time: 4000
        })
      } else {
        this.bulkOpPopup.changeJiraID.valid = false
      }
    },
    bulkChangePriorities () {
      if (this.bulkOpPopup.changePriorities.priority !== 0) {
        this.bulkOpPopup.changePriorities.valid = true

        if (this.testItems.length === 0) {
          this.$vs.notify({
            title: 'Error',
            text: 'You do not have any Tests to update',
            color: 'danger',
            position: this.settings.notifPos,
            time: 4000
          })
          this.bulkOpPopup.changePriorities.priority = 0
          this.bulkOpPopup.active = false
          return
        }

        for (let index = 0; index < this.testItems.length; index++) {
          let element = this.testItems[index]
          element.priority = this.bulkOpPopup.changePriorities.priority
        }

        this.bulkOpPopup.changePriorities.priority = 0
        this.bulkOpPopup.active = false
      } else {
        this.bulkOpPopup.changePriorities.valid = false
      }
      this.$vs.notify({
        title: 'Operation completed',
        text: 'Bulk operation completed with no errors',
        color: 'success',
        position: this.$store.state.settings.notifPos,
        time: 4000
      })
    },
    bulkChangeTestType () {
      if (this.bulkOpPopup.changeTestType.testType !== '') {
        this.bulkOpPopup.changeTestType.valid = true

        if (this.testItems.length === 0) {
          this.$vs.notify({
            title: 'Error',
            text: 'You do not have any Tests to update',
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 4000
          })
          this.bulkOpPopup.changeTestType.testType = ''
          this.bulkOpPopup.active = false
          return
        }

        for (let index = 0; index < this.testItems.length; index++) {
          let element = this.testItems[index]
          element.testType = this.bulkOpPopup.changeTestType.testType
        }

        this.bulkOpPopup.changeTestType.testType = ''
        this.bulkOpPopup.active = false
      } else {
        this.bulkOpPopup.changeTestType.valid = false
      }
      this.$vs.notify({
        title: 'Operation completed',
        text: 'Bulk operation completed with no errors',
        color: 'success',
        position: this.settings.notifPos,
        time: 4000
      })
    },

    // -------------------------------------------------- Misc --------------------------------------------------
    copy (content, message) {
      this.$root.copyToClipboard(content, message)
    },
    previewJiraTable () {
      let jiraTable = []

      this.testItems.forEach(element => {
        let formattedPurpose = ''
        // Going to add New lines
        if (this.$store.state.settings.planCreator.jiraNewLine) {
          // Split up each word
          let words = element.testPurpose.split(' ')
          // keep track of the number of charcters on each line
          let currentCharacterCount = 0

          // foreach word...
          words.forEach(element => {
            // ... add the number of chars ...
            currentCharacterCount += element.length
            // ... if the number of chars is larger than the limit set in the settings
            if (currentCharacterCount > this.$store.state.settings.planCreator.jiraNewLineAmount) {
              // ... then add a new line ...
              formattedPurpose += element + '<br/>'
              currentCharacterCount = 0
            } else {
              // ... else just add the word
              formattedPurpose += ` ${element}`
            }
          })
        } else {
          // if not adding new lines then just proceed as normal

          formattedPurpose = element.testPurpose.replace('\n', '</hr>')
        }
        formattedPurpose = formattedPurpose.replace(/\*(.*?)\*/gi, '<strong>$1</strong>')
        formattedPurpose = formattedPurpose.replace(/_(.*?)_/gi, '<i>$1</i>')
        formattedPurpose = formattedPurpose.replace(/-(.*?)-/gi, ' <span style="text-decoration: line-through;">$1</span>')
        formattedPurpose = formattedPurpose.replace(/\+(.*?)\+/gi, ' <span style="text-decoration: underline;">$1</span>')
        jiraTable.push(`<tr><td>[${element.jiraTaskId}]</td><td>${element.testType}</td><td>${element.testName}</td><td>${formattedPurpose}</td></tr>`)
      })
      this.JiraPreviewPopup.text = jiraTable.join('\n')
      this.JiraPreviewPopup.active = true
    },
    showPreview (object) {
      this.previewPopup.active = true
      this.previewPopup.syntax = object.syntax
      this.previewPopup.code = object.code
    },
    /**
     * Will begin the download of a file
     * @param {string} filename name of file
     * @param {string} content content of file
     */
    exportFile (filename, content, extensionName, extension, showDialog) {
      let path = this.fileLocation.location ? this.fileLocation.location : ''

      if (showDialog) {
        path = remote.dialog.showSaveDialog({
          title: `Export ${extension} file`,
          filters: [{
            name: extensionName,
            extensions: [extension]
          }],
          defaultPath: filename,
          buttonLabel: 'Export'
        })
      }

      if (!path) {
        return
      }

      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(path, content, (err) => {
        if (err) {
          this.$vs.notify({
            title: 'Error!',
            text: `An error ocurred creating the file: ${err.message}`,
            color: 'danger',
            icon: 'error_outline',
            position: this.settings.notifPos,
            time: 4000
          })
        } else {
          this.fileLocation = {location: path, type: extension}
          if (showDialog) {
            this.$vs.notify({
              title: 'File Exported!',
              text: `File '${filename}' was exported successfully`,
              color: 'success',
              icon: 'save',
              position: this.settings.notifPos,
              time: 10000
            })
            if (this.settings.autoOpenOnExport) {
              setTimeout(remote.shell.showItemInFolder(path), 3000)
            }
          }
        }
      })
    }
  }
}
</script>

<style>
@import url('../../../node_modules/handsontable/dist/handsontable.full.min.css');

.open-item {
  box-shadow: 0px 2px 15px 0px rgba(0,0,0,0.15) !important;
}
</style>
