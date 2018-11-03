<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      <h1>Formatter</h1>

      <vs-textarea v-model="input" label="Input" rows="10" class="w-100 border-dark"/>

      <vs-row class="my-3">

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">

          <vs-select autocomplete placeholder="Input Delimiter" label="Input Delimiter" class="w-75" v-model="inputDelimiter">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in delimiter" />
          </vs-select>

        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">

          <vs-select autocomplete placeholder="Conversion Type" label="Conversion Type" class="w-75" v-model="conversionType">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in conversionTypes" />
          </vs-select>

        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="flex-end" vs-w="4">

          <vs-button type="border" color="success" class="w-75" :disabled="invalid" @click="format()">Format Input</vs-button>

        </vs-col>

      </vs-row>

      <vs-textarea v-model="output" label="Output" rows="10" class="w-100 border-info" readonly/>

    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'formatter',
  components: { },

  data: function () {
    return {
      input: '',
      output: '',
      conversionType: '',
      inputDelimiter: '',
      delimiter: {
        Comma: ',',
        'Whitespace': ' ',
        Tab: '\t',
        NewLine: '\n'
      },
      conversionTypes: {
        'Comma Seperated Line': 'commasepline',
        'Comma Seperated Quoted Line': 'commasepquoteline',
        'Comma Seperated List': 'commaseplist',
        'Comma Seperated Quoted List': 'commasepquotelist',
        'Whitespace Seperated': 'spacesep',
        'Whitespace Seperated Quoted': 'spacesepquote',
        'Tab Seperated': 'tabsep',
        'Tab Seperated Quoted': 'tabsepquote',
        'New Line Seperated': 'newlinesep',
        'New Line Seperated Quoted': 'newlinesepquote'
      }
    }
  },

  computed: {
    invalid () {
      return this.conversionType === '' || this.inputDelimiter === '' || this.outputDelimiter === ''
    }
  },

  methods: {
    format () {
      switch (this.conversionType) {
        case 'commasepline':
          this.Seperate(false, false, ',')
          break
        case 'commasepquoteline':
          this.Seperate(true, false, ',')
          break
        case 'commaseplist':
          this.Seperate(false, true, ',')
          break
        case 'commasepquotelist':
          this.Seperate(true, true, ',')
          break
        case 'spacesep':
          this.Seperate(false, false, ' ')
          break
        case 'spacesepquote':
          this.Seperate(true, false, ' ')
          break
        case 'tabsep':
          this.Seperate(false, false, '\t')
          break
        case 'tabsepquote':
          this.Seperate(true, false, '\t')
          break
        case 'newlinesep':
          this.Seperate(false, false, '\n')
          break
        case 'newlinesepquote':
          this.Seperate(true, false, '\n')
          break
      }
    },
    Seperate (quotes, list, delimiter) {
      let values = this.input.split(this.inputDelimiter)

      if (quotes) {
        values = values.map(i => `"${i}"`)
      }

      if (list) {
        this.output = values.join(`${delimiter}\n`)
      } else {
        this.output = values.join(delimiter)
      }
    }
  }
}
</script>

<style>
</style>
