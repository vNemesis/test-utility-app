<template>
<vs-popup class="holamundo"  title="Editor" :active.sync="editor.showEditor">
    <vs-dropdown >
    <button class="btn-sm btn-info" href="#">H</button>
    <vs-dropdown-menu>
        <vs-dropdown-item v-for="(heading, key) in editor.headings" v-bind:key="key" @click="insertAtCaret(heading)">
        {{key}}
        </vs-dropdown-item>
    </vs-dropdown-menu>
    </vs-dropdown>

    <textarea id="editor" v-model="testItems[(editor.id - 1)].testPurpose" class="form-control" rows="2"></textarea>

    <button class="btn-sm btn-info" @click="popupSettings = true">Settings</button>
    <vs-popup class="holamundo"  title="Settings" :active.sync="editor.popupSettings">
    <div class="form-row">
        <div class="col-sm-3">
        Auto new line
        <vs-switch v-model="editor.disableNewLine">
            <span slot="on">On</span>
            <span slot="off">Off</span>
        </vs-switch>
        </div>
    </div>
    </vs-popup>
</vs-popup>
</template>

<script>
  export default {
    name: 'jira-wiki-editor',

    props: [],

    data: function () {
      return {
        id: 1,
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

    methods: {
      insertAtCaret (text) {
        if (!this.disableNewLine) {
          text = '\n' + text
        }
        var elementID = 'editor'
        var element = document.getElementById(elementID)
        var caretPos = element.selectionStart
        var caretEnd = element.selectionEnd
        var textAreaTxt = this.testdata.testPurpose
        this.testItems[(this.editor.id - 1)].testPurpose = textAreaTxt.substring(0, caretPos) + text + textAreaTxt.substring(caretEnd)

        element.selectionStart = caretPos + text.length
        element.selectionEnd = caretPos + text.length
      }
    }
  }
</script>

<style>
</style>
