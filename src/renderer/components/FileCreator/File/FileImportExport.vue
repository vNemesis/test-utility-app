<template>
<div>
  <!-- Wrapper Div -->

  <h3>Template Files</h3>
  <p>Load data and configuration from a CFT file</p>
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
      <p>The format for <strong>Fixed Width</strong> assumed is <strong>field name</strong>, <strong>line from</strong> and <strong>char length</strong>, left to right seperated with <strong>tabs</strong></p>
      <p>The format for <strong>Delimited</strong> assumed is <strong>field name</strong> and <strong>sub column</strong>, left to right seperated with <strong>tabs</strong></p>

      <vs-textarea rows="10" style="border-color: black;" v-model="textConfig" />
      <vs-button @click="importFromSSMSFixedWidth()" color="primary" type="border" class="ml-2" >Import Fixed width from SSMS text</vs-button>
      <vs-button @click="importFromSSMSDelimited()" color="primary" type="border" class="ml-2" >Import delimited from SSMS text</vs-button>

      <hr>

      <p>Or you can import the CSV export from SSMS</p>
      <p>The format assumed is <strong>field name</strong>, <strong>line from</strong> and <strong>char length</strong>, left to right with <strong>no headers</strong></p>
      <p>The format for <strong>Delimited</strong> assumed is <strong>field name</strong> and <strong>sub column</strong>, left to right with <strong>no headers</strong></p>

      <vs-button @click="importFromSSMSFixedWidthCSV()" color="primary" type="border" class="ml-2" >Import from SSMS CSV</vs-button>
      <vs-button @click="importFromSSMSDelimitedCSV()" color="primary" type="border" class="ml-2" >Import delimited from SSMS CSV</vs-button>

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
      this.$emit('export-file', `Test Utility File Template ${new Date(Date.now()).toISOString().substring(0, 10)}.cft`, jsonContent, 'CFT File File', 'cft', 'Custom Template File')
    },

    // Import
    importFromJson (importData) {
      remote.dialog.showOpenDialog({
        filters: [
          { name: 'CFT File File', extensions: ['cft'] }
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

    // Text and file Imports
    importFromSSMSFixedWidth () {
      let configLine = this.textConfig.split('\n')
      let configData = []

      // for each line
      for (let i = 0; i < configLine.length; ++i) {
        let columns = configLine[i].split('\t')

        // check the values are of type number
        if (isNaN(columns[1])) {
          this.$vs.notify({
            title: 'Error!',
            text: `The value ${columns[1]} on line ${i + 1} is not a valid number. Aborting import.`,
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 8000
          })
          configData = []
        } else if (isNaN(columns[2])) {
          this.$vs.notify({
            title: 'Error!',
            text: `The value ${columns[2]} on line ${i + 1} is not a valid number. Aborting import.`,
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 8000
          })
          configData = []
        } else {
          configData.push(new FileConfigItemObject(configData.length + 1, columns[0], parseInt(columns[1]), parseInt(columns[2]), 'text', []))
        }
      }

      this.$emit('update-config', configData)
    },

    importFromSSMSDelimited () {
      let configLine = this.textConfig.split('\n')
      let configData = []
      let ids = []
      let hasConflicts = false

      for (let i = 0; i < configLine.length; ++i) {
        let columns = configLine[i].split('\t')

        // Import validation
        if (columns[1] === 'undefined') {
          this.$vs.notify({
            title: 'Error!',
            text: `No Column value found on line ${i + 1}. Aborting import.`,
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 8000
          })
          configData = []
        } else if (isNaN(columns[1])) {
          this.$vs.notify({
            title: 'Error!',
            text: `The value ${columns[1]} on line ${i + 1} is not a valid number. Aborting import.`,
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 8000
          })
          configData = []
        } else {
          let conflicts = ids.includes(parseInt(columns[1]))

          // configData.sort((a, b) => a.id - b.id)

          if (conflicts) {
            hasConflicts = true
            continue
          } else {
            ids.push(parseInt(columns[1]))
            configData.push(new FileConfigItemObject(parseInt(columns[1]), columns[0], 0, 10, 'text', []))
          }
        }
      }

      if (hasConflicts) {
        this.$vs.notify({
          title: 'Error!',
          text: `The file had columns that conflicted, please check the column order and add in nay columns that are missing`,
          color: 'danger',
          position: this.$store.state.settings.notifPos,
          time: 8000
        })
      }

      this.$emit('update-config', configData, ',')
    },

    importFromSSMSFixedWidthCSV () {
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

            for (let i = 0; i < parsedData.length; i++) {
              if (!parsedData[i][0] && !parsedData[i][1] && !parsedData[i][0]) {
                continue
              }
              configData.push(new FileConfigItemObject(configData.length + 1, parsedData[i][0], parseInt(parsedData[i][1]), parseInt(parsedData[i][2]), 'text', []))
            }
            this.$emit('update-config', configData)
          }
        })
      })
    },

    importFromSSMSDelimitedCSV () {
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

            for (let i = 0; i < parsedData.length; i++) {
              if (parsedData[i][1] === 'undefined') {
                this.$vs.notify({
                  title: 'Error!',
                  text: `No Column value found on line ${i + 1}. Aborting import.`,
                  color: 'danger',
                  position: this.$store.state.settings.notifPos,
                  time: 8000
                })
                configData = []
              } else if (isNaN(parsedData[i][1])) {
                this.$vs.notify({
                  title: 'Error!',
                  text: `The value ${parsedData[i][0]} on line ${i + 1} is not a valid number. Aborting import.`,
                  color: 'danger',
                  position: this.$store.state.settings.notifPos,
                  time: 8000
                })
                configData = []
              } else {
                configData.push(new FileConfigItemObject(parseInt(parsedData[i][1]), parsedData[i][0], 0, 10, 'text', []))
              }
            }
            this.$emit('update-config', configData, ',')
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
