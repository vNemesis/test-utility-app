<template>
<div>
  <div ref="toolbar" v-if="showEditor">
  </div>

      <vs-dropdown >
        <button class="btn-sm btn-info" href="#">H</button>
        <vs-dropdown-menu>
            <vs-dropdown-item v-for="(heading, key) in headings" v-bind:key="key" @click="insertAtCaret(heading)">
            {{key}}
            </vs-dropdown-item>
        </vs-dropdown-menu>
      </vs-dropdown>
      
  <textarea ref="textbox" class="form-control" style="border-color: rgba(0,0,0,0.1); height: 100px;" :value="propText" @input="updateText()"></textarea>
</div>
</template>

<script>
  export default {
    name: 'jira-wiki-editor',

    props: ['text'],

    data: function () {
      return {
        showEditor: false,
        disableNewLine: false,
        headings: {
          H1: '.h1',
          H2: '.h2',
          H3: '.h3',
          H4: '.h4',
          H5: '.h5',
          H6: '.h6'
        }
      }
    },

    computed: {
      propText () {
        return this.text
      }
    },

    methods: {
      insertAtCaret (formatting) {
        if (this.$store.state.settings.autoLine) {
          formatting = '\n' + formatting
        }
        var element = this.$refs.textbox
        var caretPos = element.selectionStart
        var caretEnd = element.selectionEnd
        var textAreaTxt = this.$refs.textbox.value
        this.$refs.textbox.value = textAreaTxt.substring(0, caretPos) + formatting + textAreaTxt.substring(caretEnd)

        element.selectionStart = caretPos + formatting.length
        element.selectionEnd = caretPos + formatting.length
        this.updateText()
      },
      updateText () {
        this.$emit('input', `${this.$refs.textbox.value}`)
      }
    }
  }
</script>

<style>
</style>
