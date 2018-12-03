<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      <h1>Formatter</h1>

      <vs-textarea v-model="input" label="Input" rows="10" class="w-100 border-dark"/>

      <vs-row class="my-3">

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">

          <vs-select autocomplete placeholder="Input Delimiter" label="Input Delimiter" class="w-75" v-model="inputDelimiter">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in delimiter" />
          </vs-select>

        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="3">

          <vs-select autocomplete placeholder="Conversion Type" label="Conversion Type" class="w-75" v-model="conversionType">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in conversionTypes" />
          </vs-select>

        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">

          <vs-select autocomplete placeholder="Wrapper" label="Wrapper" class="w-75" v-model="wrapper">
            <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in wrappers" />
          </vs-select>

        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
          <small class="mt-3 mr-2">Seperate elements with whitespaces? </small>
          <vs-switch id="space" v-model="seperateWithSpace" class="mt-4">
            <span slot="on">Yes</span>
            <span slot="off">No</span>
          </vs-switch>

        </vs-col>


        <vs-col vs-type="flex" vs-justify="center" vs-align="flex-end" vs-w="2">

          <vs-button type="border" color="success" class="w-75" :disabled="invalid" @click="format()">Format Input</vs-button>

        </vs-col>

      </vs-row>

      <vs-row>

        <vs-col vs-type="flex" vs-w="11" class="mt-3">

          <vs-textarea v-model="output" label="Output" rows="5" class="w-100 border-info" readonly/>

        </vs-col>


        <vs-col vs-type="flex" vs-w="1">
          <vs-button color="dark" type="flat" class="my-3 w-100" @click="copy()"><font-awesome-icon icon="copy" size="2x" /></vs-button>
        </vs-col>

      </vs-row>

      

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
      wrapper: '',
      inputDelimiter: '',
      seperateWithSpace: false,
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
      },
      wrappers: {
        'No Wrapping': 'none',
        '( )': 'bracket',
        '{ }': 'curly',
        '[ ]': 'square',
        '" "': 'doublequote',
        '\'\'': 'singlequote'
      }
    }
  },

  computed: {
    invalid () {
      return this.conversionType === '' || this.inputDelimiter === '' || this.outputDelimiter === '' || this.wrapper === ''
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
      let result = ''

      if (quotes) {
        values = values.map(i => `"${i}"`)
      }

      if (list) {
        result = values.join(`${delimiter}\n`)
      } else {
        result = values.join(this.seperateWithSpace ? `${delimiter} ` : delimiter)
      }

      this.output = this.wrap(result)
    },
    wrap (content) {
      switch (this.wrapper) {
        case 'none':
          return content
        case 'bracket':
          return `( ${content} )`
        case 'curly':
          return `{ ${content} }`
        case 'square':
          return `[ ${content} ]`
        case 'doublequote':
          return `" ${content} "`
        case 'singlequote':
          return `' ${content} '`
      }
    },
    copy () {
      this.$root.copyToClipboard(this.output, 'Output copied to clipboard!')
    }
  }
}
</script>

<style>
</style>
