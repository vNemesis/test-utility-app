<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12">

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="6">

          <vs-input type="date" label="Posting date" v-model="postingDate"/>

          <vs-select autocomplete placeholder="File Type" label="File Type" class="ml-2" v-model="fileType" :danger="fileType === ''" danger-text="Please select a file type">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in fileTypes" />
          </vs-select>          
        </vs-col>
        <vs-col vs-type="flex" vs-justify="flex-end" vs-align="center" vs-w="4">
          <vs-button @click="exportToJson()" color="dark" type="border" class="mt-4" >Export template</vs-button>
          <vs-button @click="importFromJson()" color="dark" type="border" class="mx-2 mt-4" >Import template</vs-button>
        </vs-col>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="2">
          <vs-button @click="exportFile()" color="rgb(100, 175, 134)" type="filled" class="mt-4 w-100" >Export File</vs-button>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="12">
          <div class="table-responsive">
            <table class="table mt-2">
              <thead>
                <th width="2.5%"></th>
                <th width="18%">Sortcode</th>
                <th width="18%">AccountNo</th>
                <th width="18%">Amount</th>
                <th width="18%">Account Name</th>
                <th width="18%">Payment Ref</th>
                <th width="7.5%"><vs-button @click="addItemsPopup.active = true" color="danger" type="filled" class="py-0">Bulk Add</vs-button></th>
              </thead>
              <tbody>
                <tr is="payment-item" v-for="(payment, index) in paymentItems" :key="payment.id"
                v-bind:paymentData="payment" v-bind:totalNumberOfPaymentItems="paymentItems.length" v-bind:order="order"
                v-on:remove-self="removePaymentItem(index)" v-on:move-up="movePaymentItem(index, index - 1)" v-on:move-down="movePaymentItem(index, index + 1)"
                 v-on:duplicate="addPaymentItem(payment)"></tr>
              </tbody>
            </table>
          </div>
        </vs-col>
      </vs-row>

      <vs-button @click="addPaymentItem()" color="primary" type="flat" class="py-2 w-100"><font-awesome-icon icon="plus" size="2x" /></vs-button>

      <!-- Row -->
    </div>
    <!-- Container -->
  </div>
  <!-- Popups -->
      <!-- Add Items -->
      <vs-popup title="Add Payment Items" :active.sync="addItemsPopup.active">

          <vs-input placeholder="123456" label="Sortcode" class="w-100"
            :maxLength="6"
            @keydown="numbersOnly"
            v-model="addItemsPopup.item.Sortcode"/>

          <vs-input placeholder="12345678" label="Account Number" class="w-100 mt-2"
          :maxLength="8"
          @keydown="numbersOnly"
          v-model="addItemsPopup.item.AccountNo"/>

          <small class="mt-2">Payment Amount</small>
          <vs-input-number v-model="addItemsPopup.item.Amount"/>

          <vs-input placeholder="Bank Account Name" label="Account Name " class="w-100 mt-2" :maxLength="18" v-model="addItemsPopup.item.AccountName"/>

          <vs-input placeholder="Payee Ref" class="w-100 mt-2" label="Payment Reference" :maxLength="18" v-model="addItemsPopup.item.PaymentRef"/>

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
import PaymentItem from './PaymentItem'
const remote = require('electron').remote
const fs = require('fs')

export default {
  name: 'bank-file-creator',
  components: { PaymentItem },

  data: function () {
    return {
      postingDate: '',
      fileTypes: {
        'HSBC BACS': 'hsbcbacs',
        'Barclays CSV': 'barclayscsv'
      },
      fileType: '',
      paymentItems: [],
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
    this.postingDate = new Date(Date.now()).toISOString().substring(0, 10)
  },

  methods: {
    // ----------------------------------------------- Test Items -----------------------------------------------
    movePaymentItem (from, to) {
      this.paymentItems.splice(to, 0, this.paymentItems.splice(from, 1)[0])
      for (let i = 0; i < this.paymentItems.length; i++) {
        this.paymentItems[i].id = i + 1
      }
    },
    addPaymentItem (paymentItem = null) {
      if (paymentItem === null) {
        this.paymentItems.push({
          id: this.paymentItems.length + 1,
          Sortcode: '',
          AccountNo: '',
          Amount: 0.00,
          AccountName: '',
          PaymentRef: ''
        }
        )
      } else {
        let duplicate = $.extend(true, {}, paymentItem)
        duplicate.id = this.paymentItems.length + 1
        this.paymentItems.push(duplicate)
      }
    },
    removePaymentItem (index) {
      this.paymentItems.splice(index, 1)
      for (let i = 0; i < this.paymentItems.length; i++) {
        this.paymentItems[i].id = i + 1
      }
    },
    bulkAdd () {
      for (let i = 0; i < this.addItemsPopup.amount; ++i) {
        this.addPaymentItem(this.addItemsPopup.item)
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
    exportToJson (showDialog) {
      let file = {
        paymentItems: this.paymentItems,
        postingDate: this.postingDate,
        fileType: this.fileType
      }

      let jsonContent = JSON.stringify(file)
      this.$emit('export-file', `Bank file template ${new Date(Date.now()).toISOString().substring(0, 10)}.json`, jsonContent, 'JSON File', 'json', 'Template File')
    },
    exportFile () {
      switch (this.fileType) {
        case 'hsbcbacs':
          this.exportHSBCBACS()
          break
        case 'barclayscsv':
          this.exportBarclaysCSV()
          break
        case '':
          this.$vs.notify({
            title: 'Error!',
            text: 'Please select a file type',
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 4000
          })
          break
        default:
          this.$vs.notify({
            title: 'Error!',
            text: 'Code BFC001',
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 4000
          })
          break
      }
    },
    exportHSBCBACS () {
      let content = '\r\n\r\n\r\n'
      content += `UHL1 ${this.getJulianDate(this.postingDate)}000977    0000000013DAILY  001            SYNDC           DISK 000                        \r\n`
      this.paymentItems.forEach(element => {
        let amount = Math.round(element.Amount * 100)
        content += `00000000000000099${element.Sortcode}${element.AccountNo}${String(amount).padStart(15, '0')}${element.AccountName.padEnd(18, ' ')}${element.PaymentRef.padEnd(18, ' ')}\r\n`
      })

      // exportFile (filename, content, extensionName, extension, filetype)
      this.$emit('export-file', 'Custom HSBC BACS.txt', content, 'Text File', 'txt', 'HSBC BACS')
    },

    exportBarclaysCSV () {
      let content = ''
      this.paymentItems.forEach(element => {
        let amount = parseFloat(element.Amount).toFixed(2)
        let pDate = new Date(Date.parse(this.postingDate))
        content += `,,,,,${pDate.getUTCDate()}${(pDate.getUTCMonth() + 1).toString().padStart(2, '0')}${pDate.getUTCFullYear()},,,,,,${element.AccountName.padEnd(18, ' ')},13,14,${element.PaymentRef.padEnd(18, ' ')},${element.Sortcode},${element.AccountNo},,${amount}\r\n`
      })

      // exportFile (filename, content, extensionName, extension, filetype)
      this.$emit('export-file', `Custom Barclays CSV ${new Date(Date.now()).toISOString().substring(0, 10)}.csv`, content, 'Comma Seperated Value File', 'CSV', 'Barclays CSV')
    },

    // Import
    importFromJson () {
      remote.dialog.showOpenDialog({
        filters: [
          { name: 'JSON File', extensions: ['json'] }
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
              // icon: 'publish',
              position: this.$store.state.settings.notifPos,
              time: 4000
            })
            let parsedData = JSON.parse(data)

            this.paymentItems = parsedData.paymentItems
            this.postingDate = parsedData.postingDate
            this.fileType = parsedData.fileType
          }
        })
      })
    },

    // Helpers
    getJulianDate (date) {
      var now = new Date(Date.parse(date))
      var start = new Date(now.getFullYear(), 0, 0)
      var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
      var oneDay = 1000 * 60 * 60 * 24
      var day = Math.floor(diff / oneDay)
      return `${now.getFullYear().toString().substring(2, 4)}${day.toString().padStart(3, 0)}`
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
