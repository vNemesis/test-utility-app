<template>
<div>
  <vs-progress indeterminate color="primary" v-if="editing"> Validating</vs-progress>
  <div class="row" :class="editing ? 'my-4' : 'my-5'">
    <div class="col-md-12">

      <p>Define a configuration for the ledger file</p>

      <div class="alert alert-warning" role="alert">
        Any changes to the configuration <strong>type</strong> will clear any data!
      </div>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="10">
          <vs-switch class="ml-2" v-model="order">
            <span slot="on">Order On</span>
            <span slot="off">Order Off</span>
          </vs-switch>
          <vs-switch class="ml-2" v-model="autoValidate">
            <span slot="on">Auto Validate On</span>
            <span slot="off">Auto Validate Off</span>
          </vs-switch>
          <vs-select autocomplete placeholder="Please select a delimiter" class="ml-2" v-model="delimiter">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in { None: '', Pipe: '|', Comma: ',' }" />
          </vs-select> 
          <vs-button @click="validateConfig()" :color="hasValidated ? 'success' : 'danger'" type="border" class="ml-2" >Validate</vs-button>
        </vs-col>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
          <vs-button @click="clear()" color="danger" type="filled" class="ml-2" >Clear Config and Data</vs-button>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="12">
          <div class="table-responsive">
            <table class="table mt-2">
              <thead>
                <th v-if="order" width="2.5%"></th>
                <th :width="order ? '2.5%' : '5%'">ID</th>
                <th width="18%">Field Name</th>
                <th width="15%">Line Position</th>
                <th width="22%">Length (Chars)</th>
                <th width="10%">Type</th>
                <th width="25%">Options</th>
                <th width="5%">Action</th>
              </thead>
              <tbody>
                <tr is="ledger-config-item" v-for="(ledgerConfig, index) in ledgerConfigItems" :key="ledgerConfig.id"
                v-bind:ledgerConfigData="ledgerConfig"
                v-bind:totalNumberOfLedgerConfigItems="ledgerConfigItems.length"
                v-bind:order="order"
                v-bind:ledgerConfigItems="ledgerConfigItems"
                v-on:remove-self="removeLedgerConfigItem(index)"
                v-on:move-up="moveLedgerConfigItem(index, index - 1)"
                v-on:move-down="moveLedgerConfigItem(index, index + 1)"
                v-on:duplicate="addLedgerConfigItem(ledgerConfig)"
                v-on:editing="editingHandler"
                ></tr>
              </tbody>
            </table>
          </div>
        </vs-col>
      </vs-row>

      <vs-button @click="addLedgerConfigItem()" color="primary" type="flat" class="py-2 w-100"><font-awesome-icon icon="plus" size="2x" /></vs-button>

      <!-- Row -->
    </div>
    <!-- Container -->
  </div>
  <!-- Wrapper Div -->
</div>
</template>

<script>
/**
 * Todos
 * TODO: Create logic to switch between delimiters and Fixed Width
 * TODO: Configuration import Validation
 * TODO: Date Conversion
 * TODO: Duplicate Column Identifier
 */
import $ from 'jquery'
import _ from 'lodash'
import LedgerConfigItem from './LedgerConfigItem'
import LedgerConfigItemObject from '../../../../classes/LedgerConfigItem.js'

export default {
  name: 'ledger-file-config',
  components: { LedgerConfigItem },

  props: ['ledgerConfigItems', 'ledgerDataItems', 'hasValidated', 'delimiterValue'],

  data: function () {
    return {
      order: false,
      editing: false,
      autoValidate: true
    }
  },

  computed: {
    delimiter: {
      get () {
        return this.delimiterValue
      },
      set (value) {
        this.$emit('set-delimiter', value)
      }
    }
  },

  watch: {
    ledgerConfigItems: {
      handler: _.debounce(function () {
        this.editing = false
      }, 2000),
      deep: true
    },
    editing (val) {
      if (!val) {
        this.validateConfig()
      }
    }
  },

  methods: {
    // ----------------------------------------------- Test Items -----------------------------------------------
    moveLedgerConfigItem (from, to) {
      this.ledgerConfigItems.splice(to, 0, this.ledgerConfigItems.splice(from, 1)[0])
      for (let i = 0; i < this.ledgerConfigItems.length; i++) {
        this.ledgerConfigItems[i].id = i + 1
      }
    },
    addLedgerConfigItem (ledgerConfigItem = null) {
      if (ledgerConfigItem === null) {
        let linePos = 1
        if (this.ledgerConfigItems.length !== 0) {
          let last = this.ledgerConfigItems[this.ledgerConfigItems.length - 1]
          linePos = parseInt(last.linePosition.value) + parseInt(last.charLength.value) + 1
        }

        let newItem = new LedgerConfigItemObject(this.ledgerConfigItems.length + 1, '', linePos, 1, 'text', [])

        this.ledgerConfigItems.push(newItem)
      } else {
        let duplicate = $.extend(true, {}, ledgerConfigItem)
        duplicate.id = this.ledgerConfigItems.length + 1
        this.ledgerConfigItems.push(duplicate)
      }
    },
    removeLedgerConfigItem (index) {
      let removedDataID = this.ledgerConfigItems[index].id
      this.ledgerConfigItems.splice(index, 1)
      for (let i = 0; i < this.ledgerConfigItems.length; i++) {
        this.ledgerConfigItems[i].id = i + 1
      }

      for (let j = 0; j < this.ledgerDataItems.length; ++j) {
        let element = this.ledgerDataItems[j]
        delete element[`${removedDataID}_data`]

        let newElement = { id: element.id }
        let dataIndex = 1

        for (let i = 0; i < Object.keys(element).length; i++) {
          if (Object.keys(element)[i] !== 'id') {
            newElement[`${dataIndex}_data`] = element[Object.keys(element)[i]]
            dataIndex++
          }
        }
        this.ledgerDataItems[j] = newElement
      }
    },
    // ----------------------------------------------- Export -----------------------------------------------

    validateConfig () {
      if (this.ledgerConfigItems.length === 0) {
        this.$emit('has-validated', false)
        this.$vs.notify({
          title: 'Validation Errors',
          text: 'The current configuration contains no elements',
          color: 'danger',
          position: this.$store.state.settings.notifPos,
          time: 4000
        })
        return
      }
      let errored = 0

      for (let i = 0; i < this.ledgerConfigItems.length; ++i) {
        let element = this.ledgerConfigItems[i]
        let eStart = element.linePosition.value
        let eEnd = element.endLinePosition

        // Clear error messages
        element.linePosition.errors = []
        element.charLength.errors = []

        // Checking for range conflicts
        for (let j = 0; j < this.ledgerConfigItems.length; ++j) {
          if (i === j) {
            continue
          }
          let item = this.ledgerConfigItems[j]
          let iStart = item.linePosition.value
          let iEnd = item.endLinePosition

          // Does the start of this element conflict with the start or end of the other?
          if (eStart >= iStart && eStart <= iEnd) {
            if (!element.linePosition.errors.find(x => x.conflictID === item.id)) {
              element.linePosition.errors.push({
                message: `Starting Position conflicts with item ID ${item.id}`,
                conflictID: item.id
              })
            } else if (!item.linePosition.errors.find(x => x.conflictID === element.id)) {
              item.linePosition.errors.push({
                message: `Starting Position conflicts with item ID ${item.id}`,
                conflictID: item.id
              })
            }
            errored++
          }

          // does the end of this element conflict with the start or end of the other
          if (eEnd >= iStart && eEnd <= iEnd) {
            if (!element.charLength.errors.find(x => x.conflictID === item.id)) {
              element.charLength.errors.push({
                message: `Ending Position conflicts with item ID ${item.id}`,
                conflictID: item.id
              })
            }

            if (!item.charLength.errors.find(x => x.conflictID === element.id)) {
              item.charLength.errors.push({
                message: `Ending Position conflicts with item ID ${element.id}`,
                conflictID: element.id
              })
            }

            errored++
          }
        }
      }

      if (errored === 0) {
        this.$emit('has-validated', true)
        this.$vs.notify({
          title: 'Validation Successful',
          text: 'The current configuration contains no errors',
          color: 'success',
          position: this.$store.state.settings.notifPos,
          time: 4000
        })
      } else if (errored > 0) {
        this.$emit('has-validated', false)
        this.$vs.notify({
          title: 'Validation Errors',
          text: `The current configuration contains ${errored} error${errored > 1 ? 's' : ''}`,
          color: 'danger',
          position: this.$store.state.settings.notifPos,
          time: 4000
        })
      }
    },

    clear () {
      if (confirm('This will clear all config and data, Press "OK" if you wish to proceed')) {
        this.$emit('clear', true, true)
      }
    },

    editingHandler (clearData, clearfield = false, configID, type) {
      this.$emit('has-validated', false)
      // Check if this needs auto-validating
      if (this.autoValidate) {
        this.editing = true
      }

      if (clearData) {
        this.$emit('clear', false, true)
      }

      if (clearfield) {
        this.$emit('clear-field', configID, type)
      }
    }
  }
}
</script>

<style>
</style>
