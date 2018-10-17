<template>
<tr>
    <td class="align-middle">
      {{ testdata.id }}
    </td>
    <td class="align-middle">
      <textarea v-model="testdata.testName" class="form-control" style="height: 100px;" placeholder="Test Name (Summary)"></textarea>
    </td>
    <td class="align-middle">
      <vs-select v-model="testdata.testType" class="w-100">
        <vs-select-item :key="index" :vs-value="item" :vs-text="item" v-for="(item,index) in types" />
      </vs-select>
    </td>
    <td class="align-middle">
      <div ref="toolbar" v-if="toggleEditor">

          <!-- Headings -->
          <vs-dropdown >
            <button class="btn-sm btn-info" href="#">H</button>
            <vs-dropdown-menu>
                <vs-dropdown-item v-for="(heading, key) in editor.headings" v-bind:key="key" @click="insertAtCaret(heading)">
                {{key}}
                </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <!-- Headings -->

      </div>  
      <textarea ref="textbox" class="form-control" style="height: 100px;" v-model="testdata.testPurpose" @focus="toggleEditor = true" @blur="toggleEditor = false"></textarea>
    </td>
    <td class="align-middle">
      <textarea v-model="testdata.gherkin" class="form-control" style="height: 100px;" placeholder="Gherkin code for test"></textarea>
    </td>
    <td class="align-middle">
      <vs-select label="Priority" v-model="testdata.priority" class="w-100">
        <vs-select-item :key="index" :vs-value="item" :vs-text="item" v-for="(item,index) in priorities" />
      </vs-select>
    </td>
    <td class="align-middle">
      <a @click="$emit('remove-self')" class="text-danger"><font-awesome-icon icon="trash" size="lg" /></a>
    </td>
</tr>
</template>

<script>
  import JiraWikiEditor from './JiraWikiEditor'
  export default {
    name: 'test-item',
    components: { JiraWikiEditor },

    props: ['testdata'],

    data: function () {
      return {
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
        toggleEditor: false,
        editor: {
          headings: {
            H1: '.h1',
            H2: '.h2',
            H3: '.h3',
            H4: '.h4',
            H5: '.h5',
            H6: '.h6'
          }
        }
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
      }
    }
  }
</script>

<style>
</style>
