<template>
<tr>
    <td class="align-middle">
      <font-awesome-icon icon="arrow-up" size="2x" v-if="canMoveUp" @click="$emit('move-up')" class="sorting-buttons"/>
      {{ testdata.id }}
      <font-awesome-icon icon="arrow-down" size="2x" v-if="canMoveDown" @click="$emit('move-down')" class="sorting-buttons"/>
    </td>
    <td class="align-middle">
      <vs-input placeholder="AZCI-XXX" v-model="testdata.jiraTaskId"/>
    </td>
    <td class="align-middle">
      <textarea v-model="testdata.testName" class="form-control" style="height: 100px;" placeholder="Test Name (Summary)"></textarea>
    </td>
    <td class="align-middle">
      <vs-select v-model="testdata.testType" class="w-100">
        <vs-select-item :key="index" :value="item" :text="item" v-for="(item,index) in types" />
      </vs-select>
    </td>
    <td class="align-middle">

      <div class="btn-toolbar" role="toolbar" ref="toolbar" v-if="toggleEditor">
        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="First group">
          <!-- Headings -->
          <vs-dropdown >
            <button type="button" class="btn btn-info border-right-flat">H</button>
            <vs-dropdown-menu>
                <vs-dropdown-item v-for="(heading, key) in editor.headings" v-bind:key="key" @click="insertAtCaret(heading)">
                {{key}}
                </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <!-- Headings -->

          <button type="button" class="btn btn-info" @click="insertAroundSelection('*')"><strong>B</strong></button>
          <button type="button" class="btn btn-info" @click="insertAroundSelection('_')"><i>I</i></button>

          <!-- More Text Effects -->
          <vs-dropdown >
            <button type="button" class="btn btn-info border-left-flat"><font-awesome-icon icon="ellipsis-h" size="lg"/></button>
            <vs-dropdown-menu>
                <vs-dropdown-item v-for="(effect, key) in editor.effects" v-bind:key="key" @click="insertAroundSelection(effect, key)">
                {{key}}
                </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <!-- More Text Effects -->
        </div>
        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Third group">
          <button type="button" class="btn btn-info" @click="insertAtCaret('*')"><font-awesome-icon icon="list-ul" size="lg"/></button>
          <button type="button" class="btn btn-info" @click="insertAtCaret('#')"><font-awesome-icon icon="list-ol" size="lg"/></button>
        </div>

        <div class="btn-group btn-group-sm" role="group" aria-label="Third group">
          <button type="button" class="btn btn-danger" @click="toggleEditor = false">X</button>
        </div>
      </div>

      <textarea ref="textbox" class="form-control" style="height: 100px;" v-model="testdata.testPurpose" @focus="toggleEditor = true"></textarea>

    </td>

    <!-- Gherkin -->
    <td class="align-middle">

      <div class="btn-toolbar" role="toolbar" ref="toolbar" v-if="gherkinToolbar">
        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="First group">
          <button type="button" class="btn btn-info" @click="$emit('show-preview', { syntax: 'gherkin', code: testdata.gherkin})">Preview</button>
        </div>

        <div class="btn-group btn-group-sm" role="group" aria-label="Third group">
          <button type="button" class="btn btn-danger" @click="gherkinToolbar = false">X</button>
        </div>
      </div>

      <vs-tooltip text="Only paste Gherkin code. Formatting for Jira is done Automatically">
        <textarea v-model="testdata.gherkin" class="form-control" style="height: 100px;" placeholder="Gherkin code for test" @focus="gherkinToolbar = true"></textarea>
      </vs-tooltip>

    </td>
    <!-- Gherkin -->

    <td class="align-middle">
      <vs-select label="Priority" v-model="testdata.priority" class="w-100">
        <vs-select-item :key="index" :value="item" :text="item" v-for="(item,index) in priorities" />
      </vs-select>
    </td>
    <td class="align-middle">
      <vs-dropdown vs-custom-content vs-trigger-click>

        <font-awesome-icon icon="ellipsis-h" size="lg" class="more-button"/>

        <vs-dropdown-menu style="width: 17.5%;">

          <vs-dropdown-item @click="copySubTaskDesc()">
            <font-awesome-icon icon="align-left" size="lg" class="text-primary"/>
            <span class="float-right">Copy Sub-Task Description</span>
          </vs-dropdown-item>

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
  const {clipboard} = require('electron')
  export default {
    name: 'test-item',

    props: ['testdata', 'totalNumberOfTestItems', 'order'],

    data: function () {
      return {
        gherkinToolbar: false,
        types: {
          API: 'API',
          UI: 'UI'
        },
        priorities: {
          Trivial: 'Trivial',
          Minor: 'Minor',
          Major: 'Major',
          Critical: 'Critical'
        },
        editorState: false,
        editor: {
          headings: {
            H1: '.h1',
            H2: '.h2',
            H3: '.h3',
            H4: '.h4',
            H5: '.h5',
            H6: '.h6'
          },
          effects: {
            Strike: '-',
            Underline: '+',
            Super: '^',
            Sub: '~',
            Citation: '??',
            Quote: '{quote}'
          }
        }
      }
    },

    computed: {
      toggleEditor: {
        get () {
          if (this.$store.state.settings.editor.showEditor) {
            return this.editorState
          }
        },
        set (value) {
          this.editorState = value
        }
      },
      canMoveUp () {
        return (this.testdata.id !== 1 && this.order === true)
      },
      canMoveDown () {
        return (this.testdata.id !== this.totalNumberOfTestItems && this.order === true)
      }
    },

    methods: {
      insertAtCaret (formatting) {
        if (this.$store.state.settings.editor.autoLine) {
          formatting = '\n' + formatting
        }
        var element = this.$refs.textbox
        var caretPos = element.selectionStart
        var caretEnd = element.selectionEnd
        var textAreaTxt = this.$refs.textbox.value
        this.$refs.textbox.value = textAreaTxt.substring(0, caretPos) + formatting + textAreaTxt.substring(caretEnd)

        element.selectionStart = caretPos + formatting.length
        element.selectionEnd = caretPos + formatting.length

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('input', false, true)
        element.dispatchEvent(evt)
      },
      insertAroundSelection (formatting, name = 'Text') {
        // Get textbox element
        var element = this.$refs.textbox
        // Get selection start index
        var caretPos = element.selectionStart
        // Get Selection end index
        var caretEnd = element.selectionEnd
        // Get Current text value
        var textAreaTxt = this.$refs.textbox.value

        // Set the value
        let selectedText = textAreaTxt.substring(caretPos, caretEnd)

        if (selectedText === '') {
          this.$refs.textbox.value = `${textAreaTxt.substring(0, caretPos)}${formatting}${name}${formatting}${textAreaTxt.substring(caretEnd)}`
        } else {
          this.$refs.textbox.value = `${textAreaTxt.substring(0, caretPos)}${formatting}${selectedText}${formatting}${textAreaTxt.substring(caretEnd)}`
        }

        element.selectionStart = caretPos + formatting.length
        element.selectionEnd = caretPos + formatting.length

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('input', false, true)
        element.dispatchEvent(evt)
      },
      copySubTaskDesc () {
        let description = `Test Description: ${this.testdata.testPurpose} \r\n\r\nTest Type: ${this.testdata.testType} \r\n\r\n{code}\r\n${this.testdata.gherkin}\r\n{code}`
        clipboard.writeText(description)
        this.$vs.notify({
          title: 'Copied to clipboard',
          text: 'Sub-task Description has been copied to your clipboard',
          color: 'success',
          // icon: 'publish',
          position: this.$store.state.settings.notifPos,
          time: 4000
        })
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
