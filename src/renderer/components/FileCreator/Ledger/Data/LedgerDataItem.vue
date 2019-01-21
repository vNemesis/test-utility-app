<template>
<tr>
    <td class="align-middle">
      <font-awesome-icon icon="arrow-up" size="2x" v-if="canMoveUp" @click="$emit('move-up')" class="sorting-buttons"/>
      {{ ledgerData.id }}
      <font-awesome-icon icon="arrow-down" size="2x" v-if="canMoveDown" @click="$emit('move-down')" class="sorting-buttons"/>
    </td>

    <td v-for="item in ledgerConfigData" :key="item.id">
      <vs-input v-if="item.type === 'text'" :placeholder="item.fieldName" class="w-100" :maxLength="item.charLength" v-model="ledgerData[`${item.id}_data`]"/>
      <vs-input-number v-if="item.type === 'number'" max="999999" min="1" step="1" v-model="ledgerData[`${item.id}_data`]"/>
      <vs-input v-if="item.type === 'date'" type="date" class="w-100" v-model="ledgerData[`${item.id}_data`]"/>
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
    name: 'ledger-data-item',

    props: ['ledgerConfigData', 'ledgerData', 'totalNumberOfLedgerDataItems', 'order'],

    data: function () {
      return {
        editFieldName: {
          edit: false,
          max: 50
        }
      }
    },

    methods: {
    },

    computed: {
      canMoveUp () {
        return (this.ledgerData.id !== 1 && this.order === true)
      },
      canMoveDown () {
        return (this.ledgerData.id !== this.totalNumberOfLedgerDataItems && this.order === true)
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
