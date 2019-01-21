<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12">

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="9">
        </vs-col>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="3">
          <vs-button @click="addItemsPopup.active = true" color="danger" type="filled" class="w-50 mr-2">Bulk Add</vs-button>
          <vs-button @click="exportFile()" color="rgb(100, 175, 134)" type="filled" class="w-50" >Export File</vs-button>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="12">
          <div class="table-responsive">
            <table class="table mt-2">
              <thead>
                <th></th>
                <th v-for="ledgerConfigItem in ledgerConfigItems" :key="ledgerConfigItem.id">{{ ledgerConfigItem.fieldName }}</th>
                <th></th>
              </thead>
              <tbody>
                <tr is="ledger-data-item" v-for="(ledgerData, index) in ledgerDataItems" :key="ledgerData.id"
                v-bind:ledgerData="ledgerData" v-bind:ledgerConfigData="ledgerConfigItems" v-bind:totalNumberOfLedgerDataItems="ledgerDataItems.length" v-bind:order="order"
                v-on:remove-self="removeLedgerDataItem(index)" v-on:move-up="moveLedgerDataItem(index, index - 1)" v-on:move-down="moveLedgerDataItem(index, index + 1)"
                 v-on:duplicate="addLedgerDataItem(payment)"></tr>
              </tbody>
            </table>
          </div>
        </vs-col>
      </vs-row>

      <vs-button @click="addLedgerDataItem()" color="primary" type="flat" class="py-2 w-100"><font-awesome-icon icon="plus" size="2x" /></vs-button>

      <!-- Row -->
    </div>
    <!-- Container -->
  </div>
  <!-- Popups -->
      <!-- Add Items -->
      <vs-popup title="Add Ledger Items" :active.sync="addItemsPopup.active">

        <td v-for="item in ledgerConfigItems" :key="item.id">
          <vs-input v-if="item.type === 'text'" :placeholder="item.fieldName" class="w-100" :maxLength="item.charLength" v-model="ledgerData[`${item.id}_data`]"/>
          <vs-input-number v-if="item.type === 'number'" max="999999" min="1" step="1" v-model="ledgerData[`${item.id}_data`]"/>
          <vs-input v-if="item.type === 'date'" type="date" class="w-100" v-model="ledgerData[`${item.id}_data`]"/>
        </td>

        <div class="row mt-2">
          <div class="col-sm-3">
            <vs-button @click="bulkAdd()" color="primary" type="border">Add Items</vs-button>
          </div>
          <div class="col-sm-9 text-center">
            <small>Amount</small>
            <vs-input-number v-model="addItemsPopup.amount" size="mini" min="1"/>
          </div>
        </div>
      </vs-popup>
      <!-- Add Items -->
  <!-- Popups -->
  <!-- Wrapper Div -->
</div>
</template>

<script>
import $ from 'jquery'
import LedgerDataItem from './LedgerDataItem'

export default {
  name: 'ledger-data',
  components: { LedgerDataItem },

  props: ['ledgerConfigItems', 'ledgerDataItems'],

  data: function () {
    return {
      // TODO: Move this to parent component
      order: true,
      addItemsPopup: {
        active: false,
        item: {
          id: 0,
          Sortcode: '',
          AccountNo: '',
          Amount: 0.00,
          AccountName: '',
          PaymentRef: ''
        },
        amount: 1
      }
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
    // ----------------------------------------------- Test Items -----------------------------------------------
    moveLedgerDataItem (from, to) {
      this.ledgerDataItems.splice(to, 0, this.ledgerDataItems.splice(from, 1)[0])
      for (let i = 0; i < this.ledgerDataItems.length; i++) {
        this.ledgerDataItems[i].id = i + 1
      }
    },
    addLedgerDataItem (ledgerDataItem = null) {
      if (ledgerDataItem === null) {
        let obj = {
          id: this.ledgerDataItems.length + 1
        }

        this.ledgerConfigItems.forEach(element => {
          obj[`${element.id}_data`] = ''
        })

        this.ledgerDataItems.push(obj)
      } else {
        let duplicate = $.extend(true, {}, ledgerDataItem)
        duplicate.id = this.ledgerDataItems.length + 1
        this.ledgerDataItems.push(duplicate)
      }
    },
    removeLedgerDataItem (index) {
      this.ledgerDataItems.splice(index, 1)
      for (let i = 0; i < this.ledgerDataItems.length; i++) {
        this.ledgerDataItems[i].id = i + 1
      }
    },
    // TODO: Fix this
    bulkAdd () {
      for (let i = 0; i < this.addItemsPopup.amount; ++i) {
        this.addLedgerDataItem(this.addItemsPopup.item)
      }

      this.addItemsPopup.active = false

      this.$vs.notify({
        title: 'Items added',
        text: 'Items added successfully',
        color: 'success',
        // icon: 'publish',
        position: this.$store.state.settings.notifPos,
        time: 4000
      })
    },
    // ----------------------------------------------- Export -----------------------------------------------
    exportFile () {
      if (this.fileType === 'hsbcbacs') {
        this.exportHSBCBACS()
      } else if (this.fileType === '') {
        this.$vs.notify({
          title: 'Error!',
          text: 'Please select a file type',
          color: 'danger',
          position: this.$store.state.settings.notifPos,
          time: 4000
        })
      }
    },
    exportHSBCBACS () {
      let content = '\r\n\r\n\r\n'
      content += `UHL1 ${this.getJulianDate(this.postingDate)}000977    0000000013DAILY  001            SYNDC           DISK 000                        \r\n`
      this.ledgerDataItems.forEach(element => {
        let amount = Math.round(element.Amount * 100)
        content += `00000000000000099${element.Sortcode}${element.AccountNo}${String(amount).padStart(15, '0')}${element.AccountName.padEnd(18, ' ')}${element.PaymentRef.padEnd(18, ' ')}\r\n`
      })

      // exportFile (filename, content, extensionName, extension, filetype)
      this.$emit('export-file', 'Custom HSBC BACS.txt', content, 'Text File', 'txt', 'HSBC BACS')
    },
    numbersOnly (evt) {
      if (evt.keyCode < 48 || evt.keyCode > 57) {
        if (evt.keyCode !== 8) {
          evt.preventDefault()
        }
      }
    }
  }
}
</script>

<style>
</style>
