<template>
<tr>
    <td class="align-middle">
      <font-awesome-icon icon="arrow-up" size="2x" v-if="canMoveUp" @click="$emit('move-up')" class="sorting-buttons"/>
      {{ paymentData.id }}
      <font-awesome-icon icon="arrow-down" size="2x" v-if="canMoveDown" @click="$emit('move-down')" class="sorting-buttons"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="123456" class="w-100" v-model="paymentData.recSortcode"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="12345678" class="w-100" v-model="paymentData.recAccountNo"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="123456" class="w-100" v-model="paymentData.Sortcode"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="12345678" class="w-100" v-model="paymentData.AccountNo"/>
    </td>
    <td class="align-middle">
      <vs-input-number v-model="paymentData.Amount"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="" class="w-100" v-model="paymentData.AccountName"/>
    </td>
    <td class="align-middle">
      <vs-dropdown vs-custom-content vs-trigger-click>

        <font-awesome-icon icon="ellipsis-h" size="lg" class="more-button"/>

        <vs-dropdown-menu style="width: 17.5%;">

          <vs-dropdown-item @click="$emit('duplicate')">
            <font-awesome-icon icon="clone" size="lg" class="text-primary"/>
            <span class="float-right">Duplicate</span>
          </vs-dropdown-item>

          <vs-dropdown-item divider @click="$emit('remove-self')">
            <font-awesome-icon icon="trash" size="lg" class="text-danger"/>
            <span class="float-right">Delete</span> 
          </vs-dropdown-item>

        </vs-dropdown-menu>

      </vs-dropdown>
    </td>
</tr>
</template>

<script>
  export default {
    name: 'payment-item',

    props: ['paymentData', 'totalNumberOfPaymentItems', 'order'],

    data: function () {
      return {
      }
    },

    computed: {
      canMoveUp () {
        return (this.paymentData.id !== 1 && this.order === true)
      },
      canMoveDown () {
        return (this.paymentData.id !== this.totalNumberOfPaymentItems && this.order === true)
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
</style>
