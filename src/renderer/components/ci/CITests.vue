<template>
<div>
  <div class="row">
    <div class="col-md-12 text-center">
      <h1>CI Tests</h1>


      <br>
    </div>    
  </div>
</div>
</template>
<script>
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
      fromDate: '',
      toDate: '',
      release: '',
      runIDs: []
    }
  },

  computed: {
    settings () {
      return this.$store.state.settings
    }
  },

  mounted () {
  },

  watch: {
  },

  methods: {
    // ----------------------------------------------- Export -----------------------------------------------
    exportToJson (showDialog) {
      // if (!this.jiraTask) {
      //   this.$vs.notify({
      //     title: 'Error!',
      //     text: 'Please specify a Jira Task ID',
      //     color: 'danger',
      //     position: this.settings.notifPos,
      //     time: 4000
      //   })
      //   return
      // }

      // let plan = {
      //   testItems: this.testItems,
      //   jiraTask: this.jiraTask,
      //   planDesc: this.planDesc,
      //   assignee: this.assignee,
      //   app: this.app
      // }

      // let jsonContent = JSON.stringify(plan)
      // this.exportFile(`Test Plan ${this.jiraTask}.json`, jsonContent, 'JSON File', 'json', showDialog)
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
