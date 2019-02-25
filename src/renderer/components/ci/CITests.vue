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

          <vs-input type="text" class="mt-2" label="Release Filter" :disabled="this.runs.length === 0" v-model="releaseFilter"/>

          <br>

          <div class="row">
            <div class="col-md-12">

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
              <vs-button @click="getTests()" :disabled="filteredRuns.length === 0 && releaseFilter !== ''" color="primary" type="filled" class="mt-4 w-100" >Get Tests</vs-button>
            </div>
          </div>

          <vs-button @click="exportToCSV()" :disabled="results.data.length === 0" color="success" type="filled" class="mt-2 w-100" >Export to CSV</vs-button>

          <br>

          <div class="row mt-2">
            <div class="col-md-12">

              <h5>Tests returned: <span :class="results.data.length === 0 ? 'text-danger' : ''">{{ results.data.length === 0 ? 'No Results' : results.data.length }}</span></h5>

              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Test Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(test, index) in results.data" :key="index" class="text-left">
                      <td>{{ test[0] }}</td>
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

const remote = require('electron').remote
var fs = require('fs')

// const {clipboard} = require('electron')

export default {
  name: 'ci-tests',

  data: function () {
    return {
      results: {
        fields: [],
        data: []
      },
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      toDate: new Date(Date.now()).toISOString().substring(0, 10),
      releaseFilter: '',
      runs: [],
      filteredRuns: [],
      outcome: 'Failed'
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
    }
  },

  mounted () {
  },

  watch: {
    releaseFilter (val) {
      this.filteredRuns = this.runs.filter(element => element.runTitle.split('-').includes(val))
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
        fields: [
          'Test Name',
          'Error Message'
        ],
        data: []
      }

      let data = this.releaseFilter === '' ? this.runs : this.filteredResults

      data.forEach(run => {
        axios.get(`https://rimilia.visualstudio.com/Alloc8%20Tests/_apis/test/runs/${run.runID}/results?outcome=Failed&api-version=5.0`,
          {
            headers: {
              Authorization: `Basic ${this.PAT}`
            }
          })
          .then(response => {
            // Fetch results
            response.data.value.forEach(result => {
              if (result.outcome === this.outcome) {
                output.data.push([result.automatedTestName, result.errorMessage])
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
      this.exportFile(`CI Test Results ${Date.now()}.csv`, csv, 'CSV File', 'csv')
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
          this.$vs.notify({
            title: 'File Exported!',
            text: `File was exported successfully`,
            color: 'success',
            icon: 'save',
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
