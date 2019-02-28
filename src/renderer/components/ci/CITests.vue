<template>
<div>
  <div id="results-div" class="row">
    <div class="col-md-12 text-center">

      <p class="mt-2">Use this tool to fetch results for CI runs and export them to a CSV file.</p>
      <p>First specify a date range (VSTS API only allows 100 results returned so if your test run isn't there try specifiying a smaller data range)</p>
      <p>Then filter the results to the set of run you want</l>
      <p>Select the outcome type you want and then fetch the results, easy as pie!</l>

      <hr>

      <div class="row">
        <div class="col-md-6">

          <h4>Test Runs</h4>

          <div class="row">
            <div class="col-md-4">
              <vs-input type="date" class="w-100" label="From Date" v-model="fromDate"/>
            </div>
            <div class="col-md-4">
              <vs-input type="date" class="w-100" label="To Date" v-model="toDate"/>
            </div>
            <div class="col-md-4">
              <vs-button @click="getRuns()" :disabled="!validDate.valid" color="dark" type="border" class="mt-4 w-100" >Get Test Runs</vs-button>
            </div>
          </div>

          <small class="text-danger" v-if="!validDate.valid">{{ validDate.message }}</small>

          <vs-input type="text" class="mt-2 w-100" label="Release Filter" :disabled="this.runs.length === 0" v-model="releaseFilter"/>

          <br>

          <div class="row">
            <div class="col-md-12">

              <div class="row">
                <!-- <div class="col-md-6">
                  <h5>Test Runs returned: <span :class="runs.length === 0 ? 'text-danger' : ''">{{ runs.length === 0 ? 'No Results' : runs.length }}</span></h5>
                </div> -->
                <div class="col-md-12">
                  <h5>
                    <span :class="releaseFilter !== '' ? 'text-primary' : ''">
                      Showing: {{ runs.length === 0 ? 'No Results' : releaseFilter === '' ? `${runs.length}/${runs.length}` : `${filteredRuns.length}/${runs.length}` }}
                     runs
                    </span>
                  </h5>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Run Title</th>
                      <th>Run ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(run, index) in releaseFilter === '' ? runs : filteredRuns" :key="index" class="text-left">
                      <td>{{ run.runTitle }}</td>
                      <td>{{ run.runID }}</td>
                    </tr>

                    <p v-if="releaseFilter !== '' && filteredRuns.length === 0" class="text-danger">No Results found, try narrowing the date search range.</p>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>

        <div class="col-md-6">

          <h4>Test Results</h4>

          <div class="row">
            <div class="col-md-6">
              <vs-select autocomplete placeholder="Outcome" label="Test Outcome" class="w-100" label-placeholder="vs-Autocomplete" v-model="outcome">
                <vs-select-item :key="index" :value="item" :text="item" v-for="(item,index) in { Failed: 'Failed', Passed: 'Passed' }" />
              </vs-select>
            </div>
            <div class="col-md-6">
                 <vs-select autocomplete multiple placeholder="Select fields" label="Fields" class="w-100" v-model="selectedFields" >
                <vs-select-item :key="index" :value="item.id" :text="item.name" v-for="(item, index) in availableFieldsSorted" />
              </vs-select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <vs-button @click="getTests()" :disabled="filteredRuns.length === 0 && releaseFilter !== ''" color="primary" type="filled" class="mt-4 w-100" >Get Tests</vs-button>
            </div>
            <div class="col-md-6">
              <vs-button @click="exportToCSV()" :disabled="results.data.length === 0" color="success" type="filled" class="mt-4 w-100" >Export to CSV</vs-button>
            </div>
          </div>

          <br>

          <div class="row mt-2">
            <div class="col-md-12">

              <h5>Tests returned: <span :class="results.data.length === 0 ? 'text-danger' : ''">{{ results.data.length === 0 ? 'No Results' : results.data.length }}</span></h5>

              <div class="table-responsive" style="margin-top: 10px">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Test Case Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(name, index) in testNames" :key="index" class="text-left">
                      <td>{{ name }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>    
  </div>
</div>
</template>
<script>
import axios from 'axios'
import Papa from 'papaparse'
import _ from 'lodash'

const remote = require('electron').remote
var fs = require('fs')

// const {clipboard} = require('electron')
// TODO: Add customisable columns

export default {
  name: 'ci-tests',

  data: function () {
    return {
      results: {
        fields: [],
        data: []
      },
      testNames: [],
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      toDate: new Date(Date.now()).toISOString().substring(0, 10),
      releaseFilter: '',
      runs: [],
      filteredRuns: [],
      outcome: 'Failed',
      selectedFields: [21, 11],
      availableFields: [
        { id: 0, name: 'ID', value: 'id' },
        { id: 1, name: 'Started Date', value: 'startedDate' },
        { id: 2, name: 'Completed Date', value: 'completedDate' },
        { id: 3, name: 'Duration In Ms', value: 'durationInMs' },
        { id: 4, name: 'Outcome', value: 'outcome' },
        { id: 5, name: 'Revision', value: 'revision' },
        { id: 6, name: 'State', value: 'state' },
        { id: 7, name: 'Last Updated Date', value: 'lastUpdatedDate' },
        { id: 9, name: 'Priority', value: 'priority' },
        { id: 10, name: 'Computer Name', value: 'computerName' },
        { id: 11, name: 'Error Message', value: 'errorMessage' },
        { id: 12, name: 'Created Date', value: 'createdDate' },
        { id: 13, name: 'URL', value: 'url' },
        { id: 14, name: 'Failure Type', value: 'failureType' },
        { id: 15, name: 'Automated Test Storage', value: 'automatedTestStorage' },
        { id: 16, name: 'Automated Test Type', value: 'automatedTestType' },
        { id: 17, name: 'Test Case Title', value: 'testCaseTitle' },
        { id: 18, name: 'Stack Trace', value: 'stackTrace' },
        { id: 19, name: 'Test Case Reference ID', value: 'testCaseReferenceId' },
        { id: 20, name: 'Result Group Type', value: 'resultGroupType' },
        { id: 21, name: 'Automated Test Name', value: 'automatedTestName' },
        { id: 22, name: 'Test Case Name', value: 'testCase.name' },
        { id: 23, name: 'Test Run - ID', value: 'testRun.id' },
        { id: 24, name: 'Test Run - Name', value: 'testRun.name' },
        { id: 25, name: 'Test Run - URL', value: 'testRun.url' },
        { id: 26, name: 'Build - ID', value: 'build.id' },
        { id: 27, name: 'Build - Name', value: 'build.name' },
        { id: 28, name: 'Failing Since - Date', value: 'failingSince.date' },
        { id: 29, name: 'Failing Since - Build - Id', value: 'failingSince.build.id' },
        { id: 30, name: 'Failing Since - Build - Definition ID', value: 'failingSince.build.definitionId' },
        { id: 31, name: 'Failing Since - Build - Branch Name', value: 'failingSince.build.branchName' },
        { id: 32, name: 'Failing Since - Release - Id', value: 'failingSince.release.id' },
        { id: 33, name: 'Failing Since - Release - Name', value: 'failingSince.release.name' },
        { id: 34, name: 'Failing Since - Release - Environment ID', value: 'failingSince.release.environmentId' },
        { id: 35, name: 'Failing Since - Release - Environment Name', value: 'failingSince.release.environmentName' },
        { id: 36, name: 'Failing Since - Release - Definition ID', value: 'failingSince.release.definitionId' },
        { id: 37, name: 'Failing Since - Release - Environment Definition ID', value: 'failingSince.release.environmentDefinitionId' },
        { id: 38, name: 'Failing Since - Release - Environment Definition Name', value: 'failingSince.release.environmentDefinitionName' },
        { id: 39, name: 'Release Reference - ID', value: 'releaseReference.id' },
        { id: 40, name: 'Release Reference - Name', value: 'releaseReference.name' },
        { id: 41, name: 'Release Reference - Environment ID', value: 'releaseReference.environmentId' },
        { id: 42, name: 'Release Reference - Environment Name', value: 'releaseReference.environmentName' },
        { id: 43, name: 'Release Reference - Definition ID', value: 'releaseReference.definitionId' },
        { id: 44, name: 'Release Reference - Environment Definition Id', value: 'releaseReference.environmentDefinitionId' },
        { id: 45, name: 'Release Reference - Environment Definition Name', value: 'releaseReference.environmentDefinitionName' },
        { id: 46, name: 'Last Updated By - Display Name', value: 'lastUpdatedBy.displayName' }
      ]
    }
  },

  computed: {
    settings () {
      return this.$store.state.settings
    },
    PAT () {
      return btoa(`:${this.settings.api.vstsPAT}`)
    },
    validDate () {
      let result = { valid: true, message: '' }

      if (new Date(Date.parse(this.toDate)).getTime() < new Date(Date.parse(this.fromDate)).getTime()) {
        return { valid: false, message: 'The "To date" cannot be greater than the "from date"' }
      }

      if ((new Date(Date.parse(this.toDate)).getTime() - new Date(Date.parse(this.fromDate)).getTime()) / 86400000 > 7) {
        return { valid: false, message: 'The date range must be 7 days or less' }
      }

      return result
    },
    availableFieldsSorted () {
      return this.availableFields.sort(function (a, b) {
        let nameA = a.name.toUpperCase() // ignore upper and lowercase
        let nameB = b.name.toUpperCase() // ignore upper and lowercase
        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }

        // names must be equal
        return 0
      })
    }
  },

  mounted () {
  },

  watch: {
    releaseFilter (val) {
      // TODO: Look at this again
      this.filteredRuns = this.runs.filter(element => element.runTitle.includes(val))
    }
  },

  methods: {
    getRuns () {
      this.$vs.loading({
        color: '#000',
        container: '#results-div',
        scale: 1
      })

      axios.get(`https://rimilia.visualstudio.com/Alloc8%20Tests/_apis/test/runs?minLastUpdatedDate=${this.fromDate}&maxLastUpdatedDate=${this.toDate}&api-version=5.0`,
        {
          headers: {
            Authorization: `Basic ${this.PAT}`
          }
        })
        .then(response => {
          response.data.value.forEach(element => {
            this.runs.push({
              runTitle: element.name,
              runID: element.id
            })
          })
        })
        .catch(function (error) {
          // handle error
          console.log(error)
        })
        .then(() => {
          this.$vs.loading.close('#results-div > .con-vs-loading')
        })
    },

    getTests () {
      let output = {
        fields: [],
        data: []
      }

      let data = this.releaseFilter === '' ? this.runs : this.filteredRuns

      // Set fields to be the names selected
      this.selectedFields.forEach(fieldID => { output.fields.push(this.availableFields.find(field => field.id === fieldID).name) })

      // foreach test run
      data.forEach(run => {
        axios.get(`https://rimilia.visualstudio.com/Alloc8%20Tests/_apis/test/runs/${run.runID}/results?outcome=Failed&api-version=5.0`,
          {
            headers: {
              Authorization: `Basic ${this.PAT}`
            }
          })
          .then(response => {
            // Fetch results

            // Next loops through each response
            response.data.value.forEach(result => {
              // if the outcome matches the desired one
              if (result.outcome === this.outcome) {
                let dataFields = []
                this.testNames.push(result.testCase.name)

                // for each selected field
                this.selectedFields.forEach(fieldID => {
                  // get the object reference path
                  let jsonField = this.availableFields.find(field => field.id === fieldID).value

                  // then push the data to to the data fields ready for export
                  dataFields.push(_.get(result, jsonField, ''))
                })

                output.data.push(dataFields)
              }
            })
          })
          .catch(function (error) {
            // handle error
            output = ['error', error]
          })
          .then(() => {
            this.results = output
          })
      })
    },
    // ----------------------------------------------- Export -----------------------------------------------
    exportToCSV () {
      let csv = Papa.unparse(this.results)
      this.exportFile(`CI Test Results ${this.releaseFilter} - ${new Date(Date.now()).toISOString().substring(0, 10)}.csv`, csv, 'CSV File', 'csv')
    },
    /**
     * Will begin the download of a file
     * @param {string} filename name of file
     * @param {string} content content of file
     */
    exportFile (filename, content, extensionName, extension) {
      let path = remote.dialog.showSaveDialog({
        title: `Export ${extension} file`,
        filters: [{
          name: extensionName,
          extensions: [extension]
        }],
        defaultPath: filename,
        buttonLabel: 'Export'
      })

      if (!path) {
        return
      }

      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(path, content, (err) => {
        console.log(err)
        if (err.code === 'EBUSY') {
          this.$vs.notify({
            title: 'Error!',
            text: 'File is locaked or in use. please ensure the file is not open in another program and try again.',
            color: 'danger',
            position: this.settings.notifPos,
            time: 4000,
            click: () => { remote.shell.showItemInFolder(err.path) }
          })
        } else if (err) {
          this.$vs.notify({
            title: 'Error!',
            text: `An error ocurred creating the file: ${err.message}`,
            color: 'danger',
            position: this.settings.notifPos,
            time: 4000
          })
        } else {
          this.$vs.notify({
            title: 'File Exported!',
            text: `File was exported successfully`,
            color: 'success',
            position: this.settings.notifPos,
            time: 10000
          })
          setTimeout(remote.shell.showItemInFolder(path), 3000)
        }
      })
    }
  }
}
</script>

<style>
</style>
