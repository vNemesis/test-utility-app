<template>
<div>

  <!-- Tabs -->
  <vs-tabs vs-alignment="fixed" vs-position="top" color="success" v-model="activeTab">

    <vs-tab vs-label="Configuration">
      <ledger-config
        v-bind:ledgerConfigItems="ledgerConfigItems"
        v-bind:hasValidated="hasValidated"
        v-bind:delimiterValue="delimiter"
        v-bind:ledgerDataItems="ledgerDataItems"
        v-on:has-validated="hasValidated = $event;"
        v-on:export-file="exportFile"
        v-on:clear="clear"
        v-on:clear-field="clearField"
        v-on:set-delimiter="delimiter = $event"
        ></ledger-config>
    </vs-tab>
    <vs-tab vs-label="Data" >
      <ledger-data v-if="hasValidated"
        v-bind:ledgerDataItems="ledgerDataItems"
        v-bind:ledgerConfigItems="ledgerConfigItems"
        v-bind:delimiter="delimiter"
        v-bind:includeHeaders="includeHeaders"
        v-on:export-file="exportFile"
        ></ledger-data>
      <vs-alert v-if="!hasValidated" color="danger" active="true" class="mt-3">Please validate the configuration before entering data.</vs-alert>
    </vs-tab>

    <vs-tab vs-label="Import / Export">
      <ledger-import-export
        v-bind:ledgerDataItems="ledgerDataItems"
        v-bind:ledgerConfigItems="ledgerConfigItems"
        v-bind:delimiter="delimiter"
        v-bind:includeHeaders="includeHeaders"
        v-on:export-file="exportFile"
        v-on:update-config="updateConfig"
        v-on:update-data="updateData"
        ></ledger-import-export>
    </vs-tab>

  </vs-tabs>
  <!-- Tabs -->

  <!-- Wrapper Div -->
</div>
</template>

<script>
import LedgerConfig from './Config/LedgerFileConfig'
import LedgerData from './Data/LedgerFileData'
import LedgerImportExport from './LedgerImportExport'

export default {
  name: 'ledger-file-creator',
  components: { LedgerConfig, LedgerData, LedgerImportExport },

  data: function () {
    return {
      // Ledger Config
      ledgerConfigItems: [],
      ledgerDataItems: [],
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
      this.ledgerDataItems = []
      this.ledgerConfigItems = data
      this.delimiter = delimiter
      this.activeTab = 0
    },
    updateData (data, headersToggle) {
      this.ledgerDataItems = data
      this.includeHeaders = headersToggle
    },
    clear (clearConfig, clearData) {
      if (clearConfig) {
        this.ledgerConfigItems = []
      }

      if (clearData) {
        this.ledgerDataItems = []
      }
    },
    clearField (configID, type) {
      this.ledgerDataItems.forEach(element => {
        element[`${configID}_data`] = type === 'number' ? 0 : ''
      })
    }
  }
}
</script>

<style>
</style>
