<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12">

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="8">
          <vs-switch class="ml-2" v-model="includeHeaders">
            <span slot="on">Include Headers</span>
            <span slot="off">Exclude Headers</span>
          </vs-switch>
        </vs-col>
        <vs-col vs-type="flex" vs-justify="flex-end" vs-align="center" vs-w="4">
          <vs-button @click="addItemsPopup.active = true" color="danger" type="filled" class="mr-2">Bulk Add</vs-button>
          <vs-button @click="exportFileFile()" color="rgb(100, 175, 134)" type="filled" class="mr-2" >Export Fixed Width File</vs-button>
          <vs-button @click="exportFileCSV()" color="rgb(100, 175, 134)" type="filled" class="" >Export Delimited File</vs-button>
        </vs-col>
      </vs-row>

      <vs-row>
        <vs-col vs-type="flex" vs-justify="flex-start" vs-align="flex-start" vs-w="12">
          <div class="table-responsive">
            <table class="table mt-2">
              <thead>
                <th></th>
                <th v-for="fileConfigItem in fileConfigItems" :key="fileConfigItem.id">{{ fileConfigItem.fieldName }}</th>
                <th></th>
              </thead>
              <tbody>
                <tr style="min-width: 100px" is="file-data-item" v-for="(fileDataItem, index) in fileDataItems" :key="fileDataItem.id"
                v-bind:fileData="fileDataItem"
                v-bind:fileConfigData="fileConfigItems"
                v-bind:totalNumberOfFileDataItems="fileDataItems.length"
                v-bind:order="order"
                v-bind:delimiter="delimiter"
                v-on:remove-self="removeFileDataItem(index)"
                v-on:move-up="moveFileDataItem(index, index - 1)"
                v-on:move-down="moveFileDataItem(index, index + 1)"
                v-on:duplicate="addFileDataItem(payment)"
                ></tr>
              </tbody>
            </table>
          </div>
        </vs-col>
      </vs-row>

      <vs-button @click="addFileDataItem()" color="primary" type="flat" class="py-2 w-100"><font-awesome-icon icon="plus" size="2x" /></vs-button>

      <!-- Row -->
    </div>
    <!-- Container -->
  </div>
  <!-- Popups -->
      <!-- Add Items -->
      <vs-popup title="Add File Items" :active.sync="addItemsPopup.active" class="custom-width">

        <vs-row>
          <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="6">
            <div><strong>Field</strong></div>
          </vs-col>
          <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="6">
            <div><strong>Data</strong></div>
          </vs-col>
        </vs-row>

        <hr>

        <vs-row v-for="item in fileConfigItems" :key="item.id" class="mt-2">
          <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="6">
            {{item.fieldName}}
          </vs-col>
          <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="6">
            <vs-input v-if="item.type === 'text'" :placeholder="item.fieldName" class="w-100" :maxLength="item.charLength.value" v-model="addItemsPopup.item[`${item.id}_data`]"/>
            <vs-input-number v-if="item.type === 'number'" :max="numberMaxLength(item.charLength.value)" min="1" step="1" v-model="addItemsPopup.item[`${item.id}_data`]"/>
            <vs-input v-if="item.type === 'date'" type="date" class="w-100" v-model="addItemsPopup.item[`${item.id}_data`]"/>
          </vs-col>
        </vs-row>

        <vs-row class="mt-2">
          <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="3">
            <vs-button @click="bulkAdd()" color="primary" type="border">Add Items</vs-button>
          </vs-col>
          <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="9">
            <small>Amount</small>
            <vs-input-number v-model="addItemsPopup.amount" size="mini" min="1"/>
          </vs-col>
        </vs-row>
      </vs-popup>
      <!-- Add Items -->
  <!-- Popups -->
  <!-- Wrapper Div -->
</div>
</template>

<script>
import $ from 'jquery'
import FileDataItem from './FileDataItem'

/**
 * TODO: fixed width export fix
 */

export default {
  name: 'file-data',
  components: { FileDataItem },

  props: ['fileConfigItems', 'fileDataItems', 'delimiter', 'includeHeaders'],

  data: function () {
    return {
      order: true,
      addItemsPopup: {
        active: false,
        item: {
          id: 0
        },
        test: 0,
        amount: 1
      }
    }
  },

  computed: {
  },

  beforeMount () {
    this.fileConfigItems.forEach(element => {
      if (element.type === 'number') {
        this.$set(this.addItemsPopup.item, `${element.id}_data`, 0)
      } else {
        this.$set(this.addItemsPopup.item, `${element.id}_data`, '')
      }
    })
  },

  methods: {
    // ----------------------------------------------- Test Items -----------------------------------------------
    moveFileDataItem (from, to) {
      this.fileDataItems.splice(to, 0, this.fileDataItems.splice(from, 1)[0])
      for (let i = 0; i < this.fileDataItemsItems.length; i++) {
        this.fileDataItemsItems[i].id = i + 1
      }
    },
    addFileDataItem (fileDataItem = null) {
      if (fileDataItem === null) {
        let obj = {
          id: this.fileDataItems.length + 1
        }

        this.fileConfigItems.forEach(element => {
          if (element.type === 'number') {
            obj[`${element.id}_data`] = 0
          } else {
            obj[`${element.id}_data`] = ''
          }
        })

        this.fileDataItems.push(obj)
      } else {
        let duplicate = $.extend(true, {}, fileDataItem)
        duplicate.id = this.fileDataItems.length + 1
        this.fileDataItems.push(duplicate)
      }
    },
    removeFileDataItem (index) {
      this.fileDataItems.splice(index, 1)
      for (let i = 0; i < this.fileDataItems.length; i++) {
        this.fileDataItems[i].id = i + 1
      }
    },
    // TODO: Add Auto-increment feature
    bulkAdd () {
      for (let i = 0; i < this.addItemsPopup.amount; ++i) {
        this.addFileDataItem(this.addItemsPopup.item)
      }

      this.addItemsPopup.active = false

      this.$vs.notify({
        title: 'Items added',
        text: 'Items added successfully',
        color: 'success',
        position: this.$store.state.settings.notifPos,
        time: 4000
      })
    },
    // ----------------------------------------------- Export -----------------------------------------------
    exportFileFile () {
      // Create a template aray
      let lineTemplate = []
      let lineLength = 0
      this.fileConfigItems.forEach(element => {
        lineTemplate.push(new Array(element.charLength.length).fill(' '))
        if (parseInt(element.endLinePosition) > lineLength) {
          lineLength = parseInt(element.endLinePosition)
        }
      })
      // Content to be written to file
      let content = ''

      if (this.includeHeaders) {
        let line = []

        this.fileConfigItems.forEach(configItem => {
          line.push(`${configItem.fieldName.padEnd(configItem.charLength.value, ' ')}`)
        })

        content += `${line.join('')}\r\n`
      }

      // For each of the file data items ...
      this.fileDataItems.forEach(element => {
        // ... create a new array from the template ...
        // let line = lineTemplate.slice()
        let line = ' '.repeat(lineLength)

        // ... foreach config, get the configuration and add the data to the array based on that ...
        line = this.fillData(line, element)

        content += `${line}\r\n`
      })

      // exportFileFile (filename, content, extensionName, extension, filetype)
      this.$emit('export-file', 'Custom File.txt', content, 'Text File', 'txt', 'File')
    },
    exportFileCSV () {
      let content = ''

      if (this.includeHeaders) {
        let line = []

        this.fileConfigItems.forEach(configItem => {
          line.push(`${configItem.fieldName}`)
        })

        content += `${line.join(this.delimiter)}\r\n`
      }

      this.fileDataItems.forEach(element => {
        let line = []

        this.fileConfigItems.forEach(configItem => {
          if (configItem.type === 'number') {
            line.push(parseFloat(element[`${configItem.id}_data`]).toFixed(2).toString())
          } else {
            line.push(element[`${configItem.id}_data`].toString())
          }
        })

        content += `${line.join(this.delimiter)}\r\n`
      })

      // exportFileFile (filename, content, extensionName, extension, filetype)
      this.$emit('export-file', 'Custom File.txt', content, 'Text File', 'txt', 'File')
    },
    fillData (line, element) {
      // for (let i = 0; i < this.fileConfigItems.length; ++i) {
      //   let configItem = this.fileConfigItems[i]
      //   let data = element[`${configItem.id}_data`].toString()

      //   if (data.length > configItem.charLength.value) {
      //     line[i] = data.substring(0, configItem.charLength.value)
      //   } else {
      //     line[i] = data.padEnd(configItem.charLength.value, ' ')
      //   }
      // }
      // return line

      for (let i = 0; i < this.fileConfigItems.length; ++i) {
        let configItem = this.fileConfigItems[i]
        let data = element[`${configItem.id}_data`].toString()

        let start = parseInt(configItem.linePosition.value) - 1
        let length = parseInt(configItem.charLength.value)
        let end = parseInt(configItem.endLinePosition)

        if (data.length > configItem.charLength.value) {
          // line[i] = data.substring(0, configItem.charLength.value)
          line = this.replaceRange(line, start, end, data.substring(0, length))
        } else {
          // line[i] = data.padEnd(configItem.charLength.value, ' ')
          line = this.replaceRange(line, start, end, data.padEnd(length, ' '))
        }

        console.log(line)
      }
      return line
    },
    // Helpers
    numberMaxLength (length) {
      return parseInt(''.padEnd(length, '9'))
    },
    replaceRange (s, start, end, substitute) {
      return s.substring(0, start) + substitute + s.substring(end)
    }
  }
}
</script>

<style>
.custom-width .vs-popup {
  width: '1000px'
}
</style>
