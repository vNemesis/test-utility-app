<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12">

      <p>Define a configuration for the ledger file</p>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="12">
          <vs-button @click="validateConfig()" :color="hasValidated ? 'success' : 'danger'" type="border" class="ml-2" >Validate</vs-button>
          <vs-switch class="ml-2" v-model="order">
            <span slot="on">Order On</span>
            <span slot="off">Order Off</span>
          </vs-switch>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="12">
          <div class="table-responsive">
            <table class="table mt-2">
              <thead>
                <th v-if="order" width="2.5%"></th>
                <th :width="order ? '2.5%' : '5%'">ID</th>
                <th width="22.5%">Field Name</th>
                <th width="22.5%">Line Position</th>
                <th width="22.5%">Length (Chars)</th>
                <th width="22.5%">Type</th>
                <th width="5%">Options</th>
              </thead>
              <tbody>
                <tr is="ledger-config-item" v-for="(ledgerConfig, index) in ledgerConfigItems" :key="ledgerConfig.id"
                v-bind:ledgerConfigData="ledgerConfig" v-bind:totalNumberOfLedgerConfigItems="ledgerConfigItems.length" v-bind:order="order"
                v-on:remove-self="removeLedgerConfigItem(index)" v-on:move-up="moveLedgerConfigItem(index, index - 1)" v-on:move-down="moveLedgerConfigItem(index, index + 1)"
                  v-on:duplicate="addLedgerConfigItem(ledgerConfig)" v-on:editing="editing = true"></tr>
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
import $ from 'jquery'
import _ from 'lodash'
import LedgerConfigItem from './LedgerConfigItem'

export default {
  name: 'ledger-file-config',
  components: { LedgerConfigItem },

  props: ['ledgerConfigItems', 'hasValidated'],

  data: function () {
    return {
      order: false,
      editing: false
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
          linePos = last.linePosition.value + last.charLength.value + 1
        }

        this.ledgerConfigItems.push({
          id: this.ledgerConfigItems.length + 1,
          fieldName: '',
          linePosition: {
            value: linePos,
            errors: []
          },
          charLength: {
            value: 1,
            errors: []
          },
          get endLinePosition () {
            return this.linePosition.value + this.charLength.value
          },
          type: 'text'
        }
        )
      } else {
        let duplicate = $.extend(true, {}, ledgerConfigItem)
        duplicate.id = this.ledgerConfigItems.length + 1
        this.ledgerConfigItems.push(duplicate)
      }
    },
    removeLedgerConfigItem (index) {
      this.ledgerConfigItems.splice(index, 1)
      for (let i = 0; i < this.ledgerConfigItems.length; i++) {
        this.ledgerConfigItems[i].id = i + 1
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

          // does the end of this element conflict with the start or end of the pther
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
    }
  }
}
</script>

<style>
</style>
