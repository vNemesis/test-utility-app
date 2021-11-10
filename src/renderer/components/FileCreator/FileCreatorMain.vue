<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      
      <!-- Tabs -->
      <vs-tabs vs-alignment="fixed">

        <vs-tab vs-label="Custom File">
          <file-creator v-on:export-file="exportFile"></file-creator>
        </vs-tab>
        <vs-tab vs-label="Bank File">
          <bank-file-creator v-on:export-file="exportFile"></bank-file-creator>
        </vs-tab>
        <vs-tab vs-label="SQL File">
          <sql-file-creator v-on:export-file="exportFile"></sql-file-creator>
        </vs-tab>

      </vs-tabs>
      <!-- Tabs -->

      <!-- Row -->
    </div>
    <!-- Container -->
  </div>
  <!-- Wrapper Div -->
</div>
</template>

<script>
import BankFileCreator from './BankFileCreator'
import FileCreator from './File/FileCreator'
import SQLFileCreator from './SQL/SQLFileCreator'

const remote = require('electron').remote
const fs = require('fs')

export default {
  name: 'file-creator-main',
  components: { BankFileCreator, FileCreator, SQLFileCreator },

  data: function () {
    return {
    }
  },

  computed: {
    settings () {
      return this.$store.state.settings
    }
  },

  methods: {
    exportFile (filename, content, extensionName, extension, filetype) {
      let path = remote.dialog.showSaveDialog({
        title: `Export ${filetype} file`,
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
            // icon: 'error_outline',
            position: this.settings.notifPos,
            time: 4000
          })
        } else {
          this.$vs.notify({
            title: 'File Exported!',
            text: `File '${filename}' was exported successfully`,
            color: 'success',
            // icon: 'save',
            position: this.settings.notifPos,
            time: 10000
          })
          if (this.settings.autoOpenOnExport) {
            setTimeout(remote.shell.showItemInFolder(path), 3000)
          }
        }
      })
    }
  }
}
</script>

<style>
</style>
