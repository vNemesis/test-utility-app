<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      <h1>Test Data Creator</h1>


      <br>

      <div class="row">
        <div class="col-sm-12">
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
                Export to JSON
              </vs-dropdown-item>
              <vs-dropdown-item @click="importFromJson()">
                Import JSON
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
                Save Test Data
              </vs-dropdown-item>
              <vs-dropdown-item @click="activePromptLoadPlan = true">
                Load Test Data
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <!-- Application Save / Load -->

          <vs-tooltip text="Refresh the table to fix any rendering issues">
            <vs-button @click="refresh()" color="primary" vs-type="border">Refresh Table</vs-button>
          </vs-tooltip>
        </div>
      </div>

      <hr>

      <div class="row justify-content-center mt-2">
        <div class="col-md-4">
          <vs-select vs-autocomplete placeholder="Select Column" vs-label="Modify Column" vs-label-placeholder="vs-Autocomplete" class="w-100" v-model="selectedColumn">
            <vs-select-item :key="index" :vs-value="index" :vs-text="item" v-for="(item,index) in hotTableSettings.colHeaders" />
          </vs-select>
        </div>
        <div class="col-md-4">
          <vs-input vs-label="Column Name" placeholder="Column 1" v-model="selectedColumData.name" class="w-100"/>
          <vs-button @click="renameColumn()" color="primary" vs-type="border">Rename</vs-button>
        </div>
        <div class="col-md-4">
          <!-- <vs-input vs-label="Jira Task (Parent Task ID)" placeholder="AZCI-XXX" v-model="jiraTask" class="w-100"/> -->
        </div>
      </div>

      <br>

      <div id="hot-preview">
        <HotTable ref="dataTable" :settings="hotTableSettings"></HotTable>
      </div>

      <hr>

    </div>
  </div>
  <div id="globals">
     <vs-popup title="Load Test Plan" :active.sync="activePromptLoadPlan">
        <div class="row justify-content-center">
          <div class="col-sm-12">
            <!-- <vs-select vs-label="Select a test plan to load" vs-autocomplete v-model="planID" :vs-danger="LoadPlanWarning" vs-danger-text="Please select a test plan" class="w-100">
              <vs-select-item :key="index" :vs-value="index" :vs-text="index" v-for="(item,index) in allTestPlans" />
            </vs-select> -->
            <vs-button @click="load(planID)" color="primary" vs-type="border">Load Test Data</vs-button>
          </div>
       </div>
      </vs-popup>
  </div>
</div>
</template>

<script>
import TestItem from './TestItem'
import { HotTable } from '@handsontable/vue'
// import Papa from 'papaparse'

// const {dialog} = require('electron').remote
// var fs = require('fs')

export default {
  name: 'test-data-creator',
  components: { TestItem, HotTable },

  data: function () {
    return {
      selectedColumn: 0,
      selectedColumData: {
        name: ''
      },
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
        startCols: 1,
        colHeaders: ['A'],
        rowHeaders: true,
        contextMenu: true,
        manualColumnResize: true,
        manualRowResixe: true,
        autoColumnSize: {syncLimit: 50}
      }
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {

    // Table Operations

    renameColumn () {
      this.hotTableSettings.colHeaders[this.selectedColumn] = this.selectedColumData.name
      this.selectedColumData.name = ''
      this.$refs.dataTable.hotInstance.render()
    },

    refresh () {
      this.$refs.dataTable.hotInstance.render()
    },

    addTestItem () {
      // this.testItems.push({
      //   id: this.testItems.length + 1,
      //   jiraTaskId: 'AZCI-XXX',
      //   testType: '',
      //   testName: '',
      //   testPurpose: '',
      //   gherkin: '',
      //   priority: ''
      // }
      // )
    },

    removeTestItem (index) {
      // this.testItems.splice(index, 1)
      // for (let i = 0; i < this.testItems.length; i++) {
      //   this.testItems[i].id = i + 1
      // }
    },

    exportToCSV () {
      // let csvContent = ''
      // csvContent += ['Test Name (Summary)', 'Test Purpose (Description)', 'Jira Task (Parent Id)', 'Issue Type', 'Assignee', 'Priority', 'Application'].join(',') + '\r\n'

      // this.testItems.forEach(element => {
      //   let description = `"Test Description: ${element.testPurpose} \r\n\r\nTest Type: ${element.testType} \r\n\r\n{code}\r\n${element.gherkin}\r\n{code}"`
      //   let row = [element.testName, description, this.jiraTask, 'sub-task', this.assignee, element.priority, this.app].join(',')
      //   csvContent += row + '\r\n'
      // })

      // // this.csvEncodedUri = encodeURI(csvContent)

      // this.$root.exportFile(`Jira Issue Import ${this.jiraTask}.csv`, csvContent)
    },

    exportToJson () {
      // let plan = {
      //   testItems: this.testItems,
      //   jiraTask: this.jiraTask,
      //   assignee: this.assignee,
      //   app: this.app
      // }

      // let jsonContent = JSON.stringify(plan)
      // this.$root.exportFile(`Test Plan ${this.jiraTask}.json`, jsonContent)
    },

    save () {
      // let plan = {
      //   testItems: this.testItems,
      //   jiraTask: this.jiraTask,
      //   assignee: this.assignee,
      //   app: this.app
      // }

      // let jsonContent = JSON.stringify(plan)
      // this.$root.saveTestPlan(`${this.jiraTask}`, jsonContent)

      // this.$vs.notify({
      //   title: 'Plan Saved',
      //   text: `Plan was saved successfully`,
      //   color: 'success',
      //   icon: 'publish',
      //   position: 'top-center',
      //   time: 4000
      // })
    },
    load (key) {
      // if (key === '') {
      //   this.LoadPlanWarning = true
      //   return
      // }

      // let parsedData = JSON.parse(this.$root.getTestPlan(key))

      // if (parsedData === {}) {
      //   return
      // }

      // this.testItems = parsedData.testItems
      // this.jiraTask = parsedData.jiraTask
      // this.assignee = parsedData.assignee
      // this.app = parsedData.app

      // this.LoadPlanWarning = false
      // this.activePromptLoadPlan = false
    },

    importFromJson () {
    //   dialog.showOpenDialog({
    //     filters: [
    //       { name: 'JSON File', extensions: ['json'] }
    //     ]
    //   },
    //   (fileName) => {
    //     // fileNames is an array that contains all the selected
    //     if (fileName === undefined) {
    //       console.log('No file selected')
    //       return
    //     }

    //     fs.readFile(fileName[0], 'utf-8', (err, data) => {
    //       if (err) {
    //         this.$vs.notify({
    //           title: 'Error!',
    //           text: `An error ocurred creating the file: ${err.message}`,
    //           color: 'danger',
    //           icon: 'error_outline',
    //           position: 'top-center',
    //           time: 4000
    //         })
    //       } else {
    //         this.$vs.notify({
    //           title: 'File Imported!',
    //           text: `File "${fileName[0]}" was imported successfully`,
    //           color: 'success',
    //           icon: 'publish',
    //           position: 'top-center',
    //           time: 4000
    //         })
    //         let parsedData = JSON.parse(data)

    //         this.testItems = parsedData.testItems
    //         this.jiraTask = parsedData.jiraTask
    //         this.assignee = parsedData.assignee
    //         this.app = parsedData.app
    //       }
    //     })
    //   })
    // },

    // importFromCSV () {
    //   dialog.showOpenDialog({
    //     filters: [
    //       { name: 'CSV File', extensions: ['csv'] }
    //     ]
    //   },
    //   (fileName) => {
    //     // fileNames is an array that contains all the selected
    //     if (fileName === undefined) {
    //       console.log('No file selected')
    //       return
    //     }

    //     fs.readFile(fileName[0], 'utf-8', (err, data) => {
    //       if (err) {
    //         this.$vs.notify({
    //           title: 'Error!',
    //           text: `An error ocurred creating the file: ${err.message}`,
    //           color: 'danger',
    //           icon: 'error_outline',
    //           position: 'top-center',
    //           time: 4000
    //         })
    //       } else {
    //         this.$vs.notify({
    //           title: 'File Imported!',
    //           text: `File "${fileName[0]}" was imported successfully`,
    //           color: 'success',
    //           icon: 'publish',
    //           position: 'top-center',
    //           time: 4000
    //         })
    //         let parsedData = Papa.parse(data).data

    //         console.log(parsedData)

    //         for (let index = 1; index < parsedData.length; index++) {
    //           let testItem = {
    //             id: this.testItems.length + 1,
    //             jiraTaskId: parsedData[index][2],
    //             testType: 'API',
    //             testName: parsedData[index][0],
    //             testPurpose: parsedData[index][1],
    //             gherkin: '',
    //             priority: parsedData[index][5]
    //           }

    //           this.testItems.push(testItem)
    //         }
    //       }
    //     })
    //   })
    }
  }
}
</script>

<style>
@import url('../../../node_modules/handsontable/dist/handsontable.full.min.css');
</style>
