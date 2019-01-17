<template>
<div>
  <!-- Wrapper Div -->

  <vs-row vs-justify="center">
    <vs-col vs-type="flex" vs-align="center" vs-w="8">
      <vs-list>
        <vs-list-item title="Export Config and data to file">
          <vs-button @click="exportToJson()" color="dark" type="border" >Export</vs-button>
        </vs-list-item>
        <vs-list-item title="Import configuration from file">
          <vs-button @click="importFromJson(false)" color="dark" type="border" class="ml-2" >Import</vs-button>
        </vs-list-item>
        <vs-list-item title="Import configuration and data from file" >
          <vs-button @click="importFromJson(true)" color="dark" type="border" class="ml-2" >Import</vs-button>
        </vs-list-item>>
      </vs-list>

      <vs-textarea v-model="textarea" />
    </vs-col>
  </vs-row>

  <!-- Wrapper Div -->
</div>
</template>

<script>
const remote = require('electron').remote
const fs = require('fs')

export default {
  name: 'ledger-file-creator',

  props: ['ledgerConfigItems', 'ledgerDataItems'],

  data: function () {
    return {
      textConfig: ''
    }
  },

  methods: {
    exportToJson () {
      let file = {
        configItems: this.ledgerConfigItems,
        dataItems: this.ledgerDataItems
      }

      let jsonContent = JSON.stringify(file)
      this.$emit('export-file', `Test Utility Ledger file ${new Date(Date.now()).toISOString().substring(0, 10)}.tul`, jsonContent, 'TU Ledger File', 'tul', 'Template File')
    },

    // Import
    importFromJson (importData) {
      remote.dialog.showOpenDialog({
        filters: [
          { name: 'TU Ledger File', extensions: ['tul'] }
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
              configData.push({
                id: element.id,
                fieldName: element.fieldName,
                linePosition: {
                  value: element.linePosition.value,
                  errors: []
                },
                charLength: {
                  value: element.charLength.value,
                  errors: []
                },
                get endLinePosition () {
                  return this.linePosition.value + this.charLength.value
                },
                type: element.type
              })
            })

            this.$emit('update-config', configData)

            if (importData) {
              this.$emit('update-data', parsedData.dataItems)
            }
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
