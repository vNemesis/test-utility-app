<template>
<tr>
    <td class="align-middle">
      <font-awesome-icon icon="arrow-up" size="2x" v-if="canMoveUp" @click="$emit('move-up')" class="sorting-buttons"/>
      {{ paymentData.id }}
      <font-awesome-icon icon="arrow-down" size="2x" v-if="canMoveDown" @click="$emit('move-down')" class="sorting-buttons"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="123456" class="w-100"
        :maxLength="6"
        @keydown="numbersOnly"
        v-model="paymentData.Sortcode"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="12345678" class="w-100"
      :maxLength="8"
      @keydown="numbersOnly"
      v-model="paymentData.AccountNo"/>
    </td>
    <td class="align-middle">
      <vs-input-number v-model="paymentData.Amount"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="Bank Account Name" class="w-100" :maxLength="editAccountName.max" @focus="editAccountName.edit = true" @blur="editAccountName.edit = false" v-model="paymentData.AccountName"/>
      <small v-if="editAccountName.edit" class="float-right">{{accountNameRemainingChars}}/{{editAccountName.max}}</small>
    </td>
    <td class="align-middle">
      <vs-input placeholder="Payee Ref" class="w-100" :maxLength="editPaymentRef.max" @focus="editPaymentRef.edit = true" @blur="editPaymentRef.edit = false" v-model="paymentData.PaymentRef"/>
      <small v-if="editPaymentRef.edit" class="float-right">{{paymentRefRemainingChars}}/{{editPaymentRef.max}}</small>
    </td>
    <td class="align-middle">
      <a title="Duplicate"><font-awesome-icon icon="clone" size="lg" class="text-primary" @click="$emit('duplicate')"/></a>
      |
      <a title="Delete"><font-awesome-icon icon="trash" size="lg" class="text-danger" @click="$emit('remove-self')"/></a>
    </td>
</tr>
</template>

<script>
  export default {
    name: 'payment-item',

    props: ['paymentData', 'totalNumberOfPaymentItems', 'order'],

    data: function () {
      return {
        editAccountName: {
          edit: false,
          max: 18
        },
        editPaymentRef: {
          edit: false,
          max: 18
        }
      }
    },

    methods: {
      numbersOnly (evt) {
        if (evt.keyCode < 48 || evt.keyCode > 57) {
          if (evt.keyCode !== 8) {
            evt.preventDefault()
          }
        }
      }
    },

    computed: {
      canMoveUp () {
        return (this.paymentData.id !== 1 && this.order === true)
      },
      canMoveDown () {
        return (this.paymentData.id !== this.totalNumberOfPaymentItems && this.order === true)
      },
      accountNameRemainingChars () {
        return this.editAccountName.max - this.paymentData.AccountName.length
      },
      paymentRefRemainingChars () {
        return this.editPaymentRef.max - this.paymentData.PaymentRef.length
      }
    }
  }
</script>

<style>
.border-right-flat {
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.border-left-flat {
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}

.border-right-dark {
    border-right-color: black !important;
}

.border-left-dark {
    border-left-color: black !important;
}

.sorting-buttons {
  background-color: rgb(31,116,255);
  color: white;
  border-radius: 5px;
  padding: 4px;
}

.more-button:hover {
  color: grey;
}

/* For Firefox */
input[type='number'] {
    -moz-appearance:textfield;
}
/* Webkit browsers like Safari and Chrome */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
