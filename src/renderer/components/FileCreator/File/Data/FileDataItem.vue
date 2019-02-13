<template>
<tr>
    <td class="align-middle">
      <font-awesome-icon icon="arrow-up" size="2x" v-if="canMoveUp" @click="$emit('move-up')" class="sorting-buttons"/>
      {{ fileData.id }}
      <font-awesome-icon icon="arrow-down" size="2x" v-if="canMoveDown" @click="$emit('move-down')" class="sorting-buttons"/>
    </td>

    <td v-for="item in fileConfigData" :key="item.id">
      <vs-input v-if="item.type === 'text'" :placeholder="item.fieldName" class="w-100" :maxLength="delimiter === '' ? item.charLength.value : 99999999" v-model="fileData[`${item.id}_data`]"/>
      <vs-input-number v-if="item.type === 'number'" :max="delimiter === '' ? numberMaxLength(item.charLength.value) : 999999999999" min="1" step="1" v-model="fileData[`${item.id}_data`]"/>
      <vs-input v-if="item.type === 'date'" type="date" class="w-100" v-model="fileData[`${item.id}_data`]"/>
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
    name: 'file-data-item',

    props: ['fileConfigData', 'fileData', 'totalNumberOfFileDataItems', 'order', 'delimiter'],

    data: function () {
      return {
        editFieldName: {
          edit: false,
          max: 50
        }
      }
    },

    methods: {
      numberMaxLength (length) {
        return parseInt('9'.repeat(length))
      }
    },

    computed: {
      canMoveUp () {
        return (this.fileData.id !== 1 && this.order === true)
      },
      canMoveDown () {
        return (this.fileData.id !== this.totalNumberOfFileDataItems && this.order === true)
      }
    }
  }
</script>

<style>
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
