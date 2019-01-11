<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12">

      <vs-row>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
          <vs-list>

            <vs-list-header title="Posting date"></vs-list-header>

            <vs-list-item title="Date">
              <vs-input type="date" v-model="postingDate.date"/>
            </vs-list-item>

            <vs-list-item title="Row Number">
              <vs-input-number v-model="postingDate.rowNumber"/>
            </vs-list-item>

            <vs-list-item title="Line Start">
              <vs-input-number v-model="postingDate.lineStart"/>
            </vs-list-item>

          </vs-list>         
        </vs-col>

        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="4" class="mt-4 px-4">
          <vs-select autocomplete placeholder="File Type" label="File Type" v-model="fileType">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in fileTypes" />
          </vs-select>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="flex-start" vs-w="4" class="mt-4">
          <vs-button @click="exportFile()" color="primary" type="flat" class="w-100">Export</vs-button>
        </vs-col>

      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="12">
          <div class="table-responsive">
            <table class="table mt-2">
              <thead>
                <th width="5%"></th>
                <th width="12%">Recieving Sortcode</th>
                <th width="12%">Recieving AccountNo</th>
                <th width="12%">Sortcode</th>
                <th width="12%">AccountNo</th>
                <th width="12%">Amount</th>
                <th width="20%">Account Name</th>
                <th width="5%"></th>
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
  <!-- Wrapper Div -->
</div>
</template>

<script>
import $ from 'jquery'
import PaymentItem from './PaymentItem'
export default {
  name: 'bank-file-creator',
  components: { PaymentItem },

  data: function () {
    return {
      postingDate: {
        date: '',
        rowNumber: 4,
        lineStart: 6
      },
      fileTypes: {
        'HSBC BACS': 'hsbcbacs'
      },
      fileType: '',
      paymentItems: [],
      order: true
    }
  },

  computed: {
  },

  mounted () {
    this.postingDate.date = new Date(Date.now()).toISOString().substring(0, 10)
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
          recSortcode: '',
          recAccountNo: '',
          Sortcode: '',
          AccountNo: '',
          Amount: 0.00,
          AccountName: ''
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
    // ----------------------------------------------- Export -----------------------------------------------
    exportFile () {
      if (this.fileType === 'hsbcbacs') {
        this.exportHSBCBACS()
      }
    },
    exportHSBCBACS () {
      let content = '\r\n\r\n\r\n'
      content += `UHL1 ${this.getJulianDate(this.postingDate.date)}000977    0000000013DAILY  001            SYNDC           DISK 000                        `
      this.paymentItems.forEach(element => {
        content += `${element.recSortcode}${element.recAccountNo}0099${element.Sortcode}${element.AccountNo}${element.Amount}${element.AccountName}\r\n`
      })
      content += '\r\n\r\n\r\n'
      console.log(content)
    },
    getJulianDate (date) {
      var now = new Date(Date.parse(date))
      var start = new Date(now.getFullYear(), 0, 0)
      var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
      var oneDay = 1000 * 60 * 60 * 24
      var day = Math.floor(diff / oneDay)
      return `${now.getFullYear().toString().substring(2, 4)}${day.toString().padStart(3, 0)}`
    }
  }
}
</script>

<style>
</style>
