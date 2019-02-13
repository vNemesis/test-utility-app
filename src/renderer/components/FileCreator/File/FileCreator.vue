<template>
<div>

  <!-- Tabs -->
  <vs-tabs vs-alignment="fixed" vs-position="top" color="success" v-model="activeTab">

    <vs-tab vs-label="Configuration">
      <file-config
        v-bind:fileConfigItems="fileConfigItems"
        v-bind:hasValidated="hasValidated"
        v-bind:delimiterValue="delimiter"
        v-bind:fileDataItems="fileDataItems"
        v-on:has-validated="hasValidated = $event;"
        v-on:export-file="exportFile"
        v-on:clear="clear"
        v-on:clear-field="clearField"
        v-on:set-delimiter="delimiter = $event"
        ></file-config>
    </vs-tab>
    <vs-tab vs-label="Data" >
      <file-data v-if="hasValidated"
        v-bind:fileDataItems="fileDataItems"
        v-bind:fileConfigItems="fileConfigItems"
        v-bind:delimiter="delimiter"
        v-bind:includeHeaders="includeHeaders"
        v-on:export-file="exportFile"
        ></file-data>
      <vs-alert v-if="!hasValidated" color="danger" active="true" class="mt-3">Please validate the configuration before entering data.</vs-alert>
    </vs-tab>

    <vs-tab vs-label="Import / Export">
      <file-import-export
        v-bind:fileDataItems="fileDataItems"
        v-bind:fileConfigItems="fileConfigItems"
        v-bind:delimiter="delimiter"
        v-bind:includeHeaders="includeHeaders"
        v-on:export-file="exportFile"
        v-on:update-config="updateConfig"
        v-on:update-data="updateData"
        ></file-import-export>
    </vs-tab>

  </vs-tabs>
  <!-- Tabs -->

  <!-- Wrapper Div -->
</div>
</template>

<script>
import FileConfig from './Config/FileConfig'
import FileData from './Data/FileData'
import FileImportExport from './FileImportExport'

export default {
  name: 'file-creator',
  components: { FileConfig, FileData, FileImportExport },

  data: function () {
    return {
      // File Config
      fileConfigItems: [],
      fileDataItems: [],
      delimiter: '',
      hasValidated: false,
      includeHeaders: false,
      activeTab: 0,
      order: true
    }
  },

  methods: {
    exportFile (filename, content, extensionName, extension, filetype) {
      this.$emit('export-file', filename, content, extensionName, extension, filetype)
    },
    updateConfig (data, delimiter) {
      this.fileDataItems = []
      this.fileConfigItems = data
      this.delimiter = delimiter
      this.activeTab = 0
    },
    updateData (data, headersToggle) {
      this.fileDataItems = data
      this.includeHeaders = headersToggle
    },
    clear (clearConfig, clearData) {
      if (clearConfig) {
        this.fileConfigItems = []
      }

      if (clearData) {
        this.fileDataItems = []
      }
    },
    clearField (configID, type) {
      this.fileDataItems.forEach(element => {
        element[`${configID}_data`] = type === 'number' ? 0 : ''
      })
    }
  }
}
</script>

<style>
</style>
