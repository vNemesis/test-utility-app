<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      <h1>Test Plan Creator</h1>


      <br>

      <div class="row">
        <div class="col-sm-12">
          <vs-button @click="generateJiraTable()" color="rgb(26, 155, 252)" vs-type="filled">Generate Jira Table</vs-button>
          <!-- Export / Import -->
          <vs-dropdown>
            <vs-tooltip text="Export/Import the test plan to/from outside of the application">
              <vs-button vs-type="gradient">Import / Export</vs-button>
            </vs-tooltip>
            <vs-dropdown-menu>
              <vs-dropdown-item @click="exportToCSV()">
                Export to CSV
              </vs-dropdown-item>
              <vs-dropdown-item @click="importFromCSV()">
                Import CSV
              </vs-dropdown-item>
              <vs-dropdown-item vs-divider @click="exportToJson()">
                Export JSON
              </vs-dropdown-item>
              <vs-dropdown-item @click="importFromJson()">
                Import JSON
              </vs-dropdown-item>
              <vs-dropdown-item vs-divider @click="activePromptImportFromExcel = true">
                Import from Excel Clipboard
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <!-- Export / Import -->

          <!-- Application Save / Load -->
          <vs-dropdown>
            <vs-tooltip text="Save/Load test plan in the application">
              <vs-button vs-type="gradient">Save / Load</vs-button>
            </vs-tooltip>
            <vs-dropdown-menu>
              <vs-dropdown-item @click="save()">
                Save Test Plan
              </vs-dropdown-item>
              <vs-dropdown-item @click="activePromptLoadPlan = true">
                Load Test Plan
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <!-- Application Save / Load -->
        </div>
      </div>

      <hr>

      <div class="row justify-content-center mt-2">
        <div class="col-md-4">
          <vs-select vs-autocomplete placeholder="Search and select" vs-label="Application" vs-label-placeholder="vs-Autocomplete" class="w-100" v-model="app">
            <vs-select-item :key="index" :vs-value="item.value" :vs-text="item.text" v-for="(item,index) in appOptions" />
          </vs-select>
        </div>
        <div class="col-md-4">
          <vs-input vs-label="Assignee" placeholder="User.Name" v-model="assignee" class="w-100"/>
        </div>
        <div class="col-md-4">
          <vs-input vs-label="Jira Task (Parent Task ID)" placeholder="AZCI-XXX" v-model="jiraTask" class="w-100"/>
        </div>
      </div>

      <br>

      <div class="table-responsive">
        <table class="table mt-2">
          <thead>
            <th width="2.5%"></th>
            <th width="5%">Jira Task ID</th>
            <th width="20%">Test Name</th>
            <th width="7.5%">Test Type</th>
            <th width="30%">Test Purpose</th>
            <th width="25%">Gherkin</th>
            <th width="7.5%">Priority</th>
            <th width="2.5%"></th>
          </thead>
          <tbody>
              <tr is="test-item" v-for="(test, index) in testItems" :key="test.id" v-bind:testdata="test" v-on:remove-self="removeTestItem(index)"></tr>
          </tbody>
        </table>
      </div>

      <hr>

      <a @click="addTestItem()" class="text-success"><font-awesome-icon icon="plus" size="2x" /></a>
    </div>
  </div>
  <div id="globals">
     <vs-popup title="Load Test Plan" :active.sync="activePromptLoadPlan">
        <div class="row justify-content-center">
          <div class="col-sm-12">
            <vs-select vs-label="Select a test plan to load" vs-autocomplete v-model="planID" :vs-danger="LoadPlanWarning" vs-danger-text="Please select a test plan" class="w-100">
              <vs-select-item :key="index" :vs-value="index" :vs-text="index" v-for="(item,index) in allTestPlans" />
            </vs-select>
            <vs-button @click="load(planID)" color="primary" vs-type="border">Load Test Plan</vs-button>
          </div>
       </div>
      </vs-popup>

      <vs-popup fullscreen title="Load Test Plan" :active.sync="activePromptImportFromExcel">
        <div class="row justify-content-center">
          <div class="col-sm-12">
            <small>You may need to click inside this window for the table to appear!</small>
            <div id="hot-preview">
              <HotTable ref="excelTable" :settings="hotTableSettings"></HotTable>
            </div>
            <vs-button @click="importFromExcelData()" color="primary" vs-type="border">Import</vs-button>
          </div>
       </div>
      </vs-popup>
  </div>
</div>
</template>

<script>
import TestItem from './TestItem'
import { HotTable } from '@handsontable/vue'
import Papa from 'papaparse'

const {dialog} = require('electron').remote
var fs = require('fs')

const {clipboard} = require('electron')

export default {
  name: 'test-plan-creator',
  components: { TestItem, HotTable },

  data: function () {
    return {
      planID: '',
      jiraTask: '',
      assignee: '',
      app: '',
      testItems: [
        {
          id: 1,
          jiraTaskId: 'AZCI-001',
          testType: 'API',
          testName: 'Example Name',
          testPurpose: 'Example Purpose',
          gherkin: 'Not Yet Implemented',
          priority: 'Trivial'
        }
      ],
      csvEncodedUri: '',
      appOptions: [
        {text: 'Cash', value: 'Cash'},
        {text: 'Collect', value: 'Collect'}
      ],
      activePromptLoadPlan: false,
      LoadPlanWarning: false,
      activePromptImportFromExcel: false,
      hotTableSettings: {
        startRows: 5,
        startCols: 4,
        colHeaders: ['Jira ID', 'Test Type', 'Test Name', 'Test Purpose'],
        rowHeaders: true
      }
    }
  },

  computed: {
    allTestPlans () {
      return this.$root.getTestPlans()
    }
  },

  mounted () {
    if (this.assignee === '' && this.$store.state.settings.defaultAssignee !== '') {
      this.assignee = this.$store.state.settings.defaultAssignee
    }
  },

  methods: {

    goBack () {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/')
    },

    addTestItem () {
      this.testItems.push({
        id: this.testItems.length + 1,
        jiraTaskId: 'AZCI-XXX',
        testType: '',
        testName: '',
        testPurpose: '',
        gherkin: '',
        priority: ''
      }
      )
    },

    removeTestItem (index) {
      this.testItems.splice(index, 1)
      for (let i = 0; i < this.testItems.length; i++) {
        this.testItems[i].id = i + 1
      }
    },

    exportToCSV () {
      let csvContent = ''
      csvContent += ['Test Name (Summary)', 'Test Purpose (Description)', 'Jira Task (Parent Id)', 'Issue Type', 'Assignee', 'Priority', 'Application'].join(',') + '\r\n'

      this.testItems.forEach(element => {
        let description = `"Test Description: ${element.testPurpose} \r\n\r\nTest Type: ${element.testType} \r\n\r\n{code}\r\n${element.gherkin}\r\n{code}"`
        let row = [element.testName, description, this.jiraTask, 'sub-task', this.assignee, element.priority, this.app].join(',')
        csvContent += row + '\r\n'
      })

      // this.csvEncodedUri = encodeURI(csvContent)

      this.$root.exportFile(`Jira Issue Import ${this.jiraTask}.csv`, csvContent)
    },

    exportToJson () {
      let plan = {
        testItems: this.testItems,
        jiraTask: this.jiraTask,
        assignee: this.assignee,
        app: this.app
      }

      let jsonContent = JSON.stringify(plan)
      this.$root.exportFile(`Test Plan ${this.jiraTask}.json`, jsonContent)
    },

    save () {
      let plan = {
        testItems: this.testItems,
        jiraTask: this.jiraTask,
        assignee: this.assignee,
        app: this.app
      }

      let jsonContent = JSON.stringify(plan)
      this.$root.saveTestPlan(`${this.jiraTask}`, jsonContent)

      this.$vs.notify({
        title: 'Plan Saved',
        text: `Plan was saved successfully`,
        color: 'success',
        icon: 'publish',
        position: 'top-center',
        time: 4000
      })
    },
    load (key) {
      if (key === '') {
        this.LoadPlanWarning = true
        return
      }

      let parsedData = JSON.parse(this.$root.getTestPlan(key))

      if (parsedData === {}) {
        return
      }

      this.testItems = parsedData.testItems
      this.jiraTask = parsedData.jiraTask
      this.assignee = parsedData.assignee
      this.app = parsedData.app

      this.LoadPlanWarning = false
      this.activePromptLoadPlan = false
    },

    importFromJson () {
      dialog.showOpenDialog({
        filters: [
          { name: 'JSON File', extensions: ['json'] }
        ]
      },
      (fileName) => {
        // fileNames is an array that contains all the selected
        if (fileName === undefined) {
          console.log('No file selected')
          return
        }

        fs.readFile(fileName[0], 'utf-8', (err, data) => {
          if (err) {
            this.$vs.notify({
              title: 'Error!',
              text: `An error ocurred creating the file: ${err.message}`,
              color: 'danger',
              icon: 'error_outline',
              position: 'top-center',
              time: 4000
            })
          } else {
            this.$vs.notify({
              title: 'File Imported!',
              text: `File "${fileName[0]}" was imported successfully`,
              color: 'success',
              icon: 'publish',
              position: 'top-center',
              time: 4000
            })
            let parsedData = JSON.parse(data)

            this.testItems = parsedData.testItems
            this.jiraTask = parsedData.jiraTask
            this.assignee = parsedData.assignee
            this.app = parsedData.app
          }
        })
      })
    },

    importFromCSV () {
      dialog.showOpenDialog({
        filters: [
          { name: 'CSV File', extensions: ['csv'] }
        ]
      },
      (fileName) => {
        // fileNames is an array that contains all the selected
        if (fileName === undefined) {
          console.log('No file selected')
          return
        }

        fs.readFile(fileName[0], 'utf-8', (err, data) => {
          if (err) {
            this.$vs.notify({
              title: 'Error!',
              text: `An error ocurred creating the file: ${err.message}`,
              color: 'danger',
              icon: 'error_outline',
              position: 'top-center',
              time: 4000
            })
          } else {
            this.$vs.notify({
              title: 'File Imported!',
              text: `File "${fileName[0]}" was imported successfully`,
              color: 'success',
              icon: 'publish',
              position: 'top-center',
              time: 4000
            })
            let parsedData = Papa.parse(data).data

            console.log(parsedData)

            for (let index = 1; index < parsedData.length; index++) {
              let testItem = {
                id: this.testItems.length + 1,
                jiraTaskId: parsedData[index][2],
                testType: 'API',
                testName: parsedData[index][0],
                testPurpose: parsedData[index][1],
                gherkin: '',
                priority: parsedData[index][5]
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
          priority: ''
        }
        )
      })

      this.$vs.notify({
        title: 'Test Plan Imported',
        text: 'A Test Plan has been created from your excel data',
        color: 'success',
        icon: 'publish',
        position: 'top-center',
        time: 4000
      })

      this.activePromptImportFromExcel = false
    },

    generateJiraTable () {
      let jiraTable = ''
      jiraTable += '||JIRA Issue ID||Type||Test Name||Test Purpose||\r\n'

      this.testItems.forEach(element => {
        jiraTable += `|[${element.jiraTaskId}]|${element.testType}|${element.testName}|${element.testPurpose}|\r\n`
      })
      clipboard.writeText(jiraTable)
      this.$vs.notify({
        title: 'Copied to clipboard',
        text: 'Jira Table has been copied to your clipboard',
        color: 'success',
        icon: 'publish',
        position: 'top-center',
        time: 4000
      })
    }
  }
}
</script>

<style>
@import url('../../../node_modules/handsontable/dist/handsontable.full.min.css');
</style>
