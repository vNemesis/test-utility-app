<template>
<tr>
    <td v-if="order" class="align-middle">
      <font-awesome-icon icon="arrow-up" size="2x" v-if="canMoveUp" @click="$emit('move-up')" class="sorting-buttons"/>
      
      <font-awesome-icon icon="arrow-down" size="2x" v-if="canMoveDown" @click="$emit('move-down')" class="sorting-buttons"/>
    </td>

    <td class="align-middle">
      {{ ledgerConfigData.id }}
    </td>

    <td class="align-middle">
      <vs-input placeholder="Field Name" class="w-100"
      :maxLength="editFieldName.max"
      danger-text="Cannot be empty"
      :danger="ledgerConfigData.fieldName === ''"
      @focus="editFieldName.edit = true"
      @blur="editFieldName.edit = false"
      v-model="ledgerConfigData.fieldName"
      @input="$emit('editing', false)"/>
      <small v-if="editFieldName.edit" class="float-right">{{fieldNameRemainingChars}}/{{editFieldName.max}}</small>
    </td>

    <td class="align-middle">
      <vs-row>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="12">
          <vs-input-number max="999999" min="1" step="1" v-model="ledgerConfigData.linePosition.value" @input="$emit('editing', false)"/>
        </vs-col>
      </vs-row>
      <small>
        <vs-list v-for="(error, index) in ledgerConfigData.linePosition.errors" :key="index">
          <vs-list-item><vs-chip color="danger">{{error.message}}</vs-chip></vs-list-item>
        </vs-list>
      </small>
    </td>

    <td class="align-middle">
      <vs-row>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="6">
          <vs-input-number max="999999" min="1" step="1" v-model="ledgerConfigData.charLength.value" @input="$emit('editing', false, true, ledgerConfigData.id, ledgerConfigData.type)"/>
        </vs-col>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="6">
          <small>Character Range: {{ledgerConfigData.linePosition.value}} - {{ledgerConfigData.endLinePosition}}</small>
        </vs-col>
      </vs-row>
            <small>
        <vs-list v-for="(error, index) in ledgerConfigData.charLength.errors" :key="index">
          <vs-list-item><vs-chip color="danger">{{error.message}}</vs-chip></vs-list-item>
        </vs-list>
      </small>
    </td>

    <td class="align-middle">
      <vs-select autocomplete placeholder="Type" v-model="ledgerConfigData.type" class="w-100" @input="$emit('editing', true)">
        <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in { Text: 'text', Date: 'date', Number: 'number' }" />
      </vs-select>  
    </td>

    <td class="align-middle">
      <vs-select autocomplete multiple placeholder="Options" v-model="ledgerConfigData.options" class="w-100" @input="$emit('editing', false);">
        <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in options" />
      </vs-select>  
    </td>

    <td class="align-middle">
      <a title="Duplicate"><font-awesome-icon icon="clone" size="lg" class="text-primary" @click="$emit('duplicate'); $emit('editing', false)"/></a>
      |
      <a title="Delete"><font-awesome-icon icon="trash" size="lg" class="text-danger" @click="$emit('remove-self'); $emit('editing', false)"/></a>
    </td>
</tr>
</template>

<script>
  export default {
    name: 'ledger-config-item',

    props: ['ledgerConfigData', 'totalNumberOfLedgerConfigItems', 'order', 'ledgerConfigItems'],

    data: function () {
      return {
        editFieldName: {
          edit: false,
          max: 50
        },
        options: {
          Required: 'required'
        }
      }
    },

    methods: {
    },

    computed: {
      canMoveUp () {
        return (this.ledgerConfigData.id !== 1 && this.order === true)
      },
      canMoveDown () {
        return (this.ledgerConfigData.id !== this.totalNumberOfLedgerConfigItems && this.order === true)
      },
      fieldNameRemainingChars () {
        return this.editFieldName.max - this.ledgerConfigData.fieldName.length
      },
      configItems () {
        let items = {}
        this.ledgerConfigItems.forEach(element => {
          if (element.id !== this.ledgerConfigData.id) {
            items[`(${element.id})-${element.fieldName}`] = element.id
          }
        })

        return items
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
