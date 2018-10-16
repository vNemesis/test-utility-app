<template>
<div>
    <vs-dropdown >
    <button class="btn-sm btn-info" href="#">H</button>
    <vs-dropdown-menu>
        <vs-dropdown-item v-for="(heading, key) in headings" v-bind:key="key" @click="insertAtCaret(heading)">
        {{key}}
        </vs-dropdown-item>
    </vs-dropdown-menu>
    </vs-dropdown>
    <button class="btn-sm btn-info" @click="popupSettings = true">Settings</button>

    <textarea id="editor" v-model="textEdited" class="form-control" rows="6"></textarea>

    <vs-popup class="holamundo"  title="Settings" :active.sync="popupSettings">
    <div class="form-row">
        <div class="col-sm-3">
        Auto new line
        <vs-switch v-model="disableNewLine">
            <span slot="on">On</span>
            <span slot="off">Off</span>
        </vs-switch>
        </div>
    </div>
    </vs-popup>
    <button class="btn-sm btn-info" @click="$emit('save-text', newText)">Save</button>
</div>
</template>

<script>
  export default {
    name: 'jira-wiki-editor',

    props: ['text'],

    data: function () {
      return {
        newText: '',
        showEditor: false,
        popupSettings: false,
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
      textEdited: {
        // getter
        get: function () {
          return this.text
        },
        // setter
        set: function (newValue) {
          this.newText = newValue
        }
      }
    },

    methods: {
      insertAtCaret (formatting) {
        if (!this.disableNewLine) {
          formatting = '\n' + formatting
        }
        var elementID = 'editor'
        var element = document.getElementById(elementID)
        var caretPos = element.selectionStart
        var caretEnd = element.selectionEnd
        var textAreaTxt = this.textEdited
        this.textEdited = textAreaTxt.substring(0, caretPos) + formatting + textAreaTxt.substring(caretEnd)

        element.selectionStart = caretPos + formatting.length
        element.selectionEnd = caretPos + formatting.length
      }
    }
  }
</script>

<style>
</style>
