<template>
<div>
  <!-- Wrapper Div -->

  <h3>Template Files</h3>
  <p>Load data and configuration from a TUL Template file</p>
  <vs-row vs-justify="center">
    <vs-col vs-type="flex" vs-align="center" vs-w="8">
      <vs-list>
        <vs-list-item title="Export Config and data to file">
          <vs-button @click="exportToJson()" color="primary" type="border" >Export</vs-button>
        </vs-list-item>
        <vs-list-item title="Import configuration from file">
          <vs-button @click="importFromJson(false)" color="primary" type="border" class="ml-2" >Import</vs-button>
        </vs-list-item>
        <vs-list-item title="Import configuration and data from file" >
          <vs-button @click="importFromJson(true)" color="primary" type="border" class="ml-2" >Import</vs-button>
        </vs-list-item>
      </vs-list>
    </vs-col>
  </vs-row>

  <hr>

  <div class="row justify-content-center mt-3">
    <div class="col-md-8">

      <h3>Import SSMS Configuration</h3>
      <p>Copy a configuration from SSMS and paste it in here to load it.</p>
      <p>The format assumed is <strong>field name</strong>, <strong>line from</strong> and <strong>char length</strong>, left to right seperated with <strong>tabs</strong></p>

      <vs-textarea rows="10" style="border-color: black;" v-model="textConfig" />
      <vs-button @click="importFromSSMS()" color="primary" type="border" class="ml-2" >Import from SSMS text</vs-button>

      <hr>

      <p>Or you can import the CSV export from SSMS</p>
      <p>The format assumed is <strong>field name</strong>, <strong>line from</strong> and <strong>char length</strong>, left to right with <strong>no headers</strong></p>

      <vs-button @click="importFromSSMSCSV()" color="primary" type="border" class="ml-2" >Import from SSMS CSV</vs-button>

    </div>
  </div>

  <!-- Wrapper Div -->
</div>
</template>

<script>
import Papa from 'papaparse'
import FileConfigItemObject from '../../../classes/FileConfigItem.js'
const remote = require('electron').remote
const fs = require('fs')

export default {
  name: 'file-file-creator',

  props: ['fileConfigItems', 'fileDataItems', 'delimiter', 'includeHeaders'],

  data: function () {
    return {
      textConfig: ''
    }
  },

  methods: {
    exportToJson () {
      let file = {
        configItems: this.fileConfigItems,
        dataItems: this.fileDataItems,
        delimiter: this.delimiter,
        includeHeaders: this.includeHeaders
      }

      let jsonContent = JSON.stringify(file)
      this.$emit('export-file', `Test Utility File file ${new Date(Date.now()).toISOString().substring(0, 10)}.tul`, jsonContent, 'TU File File', 'tul', 'Template File')
    },

    // Import
    importFromJson (importData) {
      remote.dialog.showOpenDialog({
        filters: [
          { name: 'TU File File', extensions: ['tul'] }
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
              position: this.$store.state.settings.notifPos,
              time: 4000
            })
          } else {
            this.$vs.notify({
              title: 'File Imported!',
              text: `File "${fileName[0]}" was imported successfully`,
              color: 'success',
              position: this.$store.state.settings.notifPos,
              time: 4000
            })
            let parsedData = JSON.parse(data)

            // Config Load
            let configData = []

            parsedData.configItems.forEach(element => {
              configData.push(new FileConfigItemObject(element.id, element.fieldName, element.linePosition.value, element.charLength.value, element.type, element.options))
            })

            this.$emit('update-config', configData, parsedData.delimiter)

            if (importData) {
              this.$emit('update-data', parsedData.dataItems, parsedData.includeHeaders)
            }
          }
        })
      })
    },

    importFromSSMS () {
      let configLine = this.textConfig.split('\n')
      let configData = []

      configLine.forEach(element => {
        let columns = element.split('\t')
        configData.push(new FileConfigItemObject(configData.length + 1, columns[0], parseInt(columns[1]), parseInt(columns[2]), 'text', []))
      })

      this.$emit('update-config', configData)
    },

    importFromSSMSCSV () {
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
              position: this.$store.state.settings.notifPos,
              time: 4000
            })
          } else {
            this.$vs.notify({
              title: 'File Imported!',
              text: `File "${fileName[0]}" was imported successfully`,
              color: 'success',
              position: this.$store.state.settings.notifPos,
              time: 4000
            })
            let parsedData = Papa.parse(data).data
            let configData = []

            for (let index = 0; index < parsedData.length; index++) {
              if (!parsedData[index][0] && !parsedData[index][1] && !parsedData[index][0]) {
                continue
              }
              configData.push(new FileConfigItemObject(configData.length + 1, parsedData[index][0], parseInt(parsedData[index][1]), parseInt(parsedData[index][2]), 'text', []))
            }
            this.$emit('update-config', configData)
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
