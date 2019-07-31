<template>
<div>
  <div id="results-div" class="row mt-3 mx-3">
    <div class="col-md-12 text-center">

        <div class="row">
        
            <div class="col-md-11">
              <vs-input label-placeholder="Jira Query" class="w-100" v-model="queryString" :danger="queryString === ''" danger-text="Please provide the Jira Query in URL form" />
                <vs-popup title="Find Jira Query URL" :active.sync="jsqlInfoPopup" class="info-popup">
                  <div class="row">
                    
                    <div class="col-md-12 col-sm-6">
                      <h4>Write Query</h4>

                      <p>You can write the jira query yourself if you wish following a similar structure to Jira's advanced search:</p>
                      <p>Here is an example of a query:</p>
                      <vs-card>
                          <pre style="white-space: pre-line;">
                            assignee=user.name+AND+status="Done"
                          </pre>
                      </vs-card>
                      <p> Write the query how you normally would but make sure to replace any whitespace characters with a <b>+</b> symbol.</p>
                      <p class="text-danger"><b>Note!:</b> Some values may need there raw data form, for example Sprints are search by there data id not name</p>
                    </div>

                  </div>

                  <hr />

                  <div class="row">
                    
                    <div class="col-md-6 col-sm-3">
                      <h4>Add via URL</h4>
                      <p>To get the correct link format follow these steps:</p>
                      <ol class="ml-4">
                        <li>Naviagte to the advanced search in Jira</li>
                        <li>In the <b>Top-Right Corner</b> selected the <b>Export</b> button</li>
                        <li><b>Right-click</b> on the <b>Export XML</b> button and select <b>Copy link Address</b></li>
                      </ol>
                    </div>

                    <div class="col-md-6 col-sm-9">
                      <img id="logo" src="~@/assets/cardExportExample1.png" alt="example1">
                    </div>

                  </div>
              </vs-popup>
            </div>

            <div class="col-md-1">
              <div @click="jsqlInfoPopup = true" class="text-info" style="margin-top: 20px; cursor: pointer;">
                <font-awesome-icon class="float-left" :icon="['fas', 'info-circle']" size="2x"/>
              </div>
            </div>
        
        </div>

        <div class="row">

              <div class="col-md-2 mt-3">
                <button type="button" class="btn btn-info w-100" @click="previewIssues()">Fetch Tickets</button>
                <small>{{ status }}</small>
              </div>

              <div class="col-md-2 mt-3">
                <button type="button" class="btn btn-primary w-100" @click="exportIssuesToPdf(issuesToPrintSelection)" :disabled="!canExport">{{ exportText }}</button>
                <small class="text-danger" v-if="!canExport">Please previw the results before exporting</small>
              </div>

              <div class="col-md-2 mt-3 offset-md-4">
                <vs-input placeholder="Porject Key i.e. ABC" class="float-left" style="width: 80%" v-model="projectKey" :danger="projectKey === ''"
                danger-text="Please enter the Key for the project this will be used for. This will be used to fetch the ID for issue types etc. If you have multiple projects pick the most used one"/>
                <font-awesome-icon @click="saveProjectKey" class="float-left ml-2 mt-1 text-primary" :icon="['fas', 'save']" size="2x"/>
              </div>

              <div class="col-md-2 mt-3">
                <button type="button" class="btn btn-dark w-100" @click="openEditor">Edit template</button>
              </div>
    
        </div>

        <vs-row class="mt-5" vs-align="center">

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
            <h6 class="text-success" :class="(!project.types.useStory ? 'disable' : '')">Stories: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.storyId).length }}</h6>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
            <h6 class="text-success" :class="(!project.types.useImprovement ? 'disable' : '')">Improvements: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.improvementId).length }}</h6>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
            <h6 class="text-success" :class="(!project.types.useFeature ? 'disable' : '')">New Features: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.newFeatureId).length }}</h6>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
            <h6 class="text-danger" :class="(!project.types.useBug ? 'disable' : '')">Bugs: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.bugId).length }}</h6>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1">
            <h6 class="text-info" :class="(!project.types.useTask ? 'disable' : '')">Tasks: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.taskId).length }}</h6>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
            <h6 class="text-info" :class="(!project.types.useSubTask ? 'disable' : '')">Sub-Tasks: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.subTaskId).length }}</h6>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1">
            <h6 >Total: {{ issues.length }}</h6>
          </vs-col>

        </vs-row>

        <vs-collapse>
          <vs-collapse-item>
              <div slot="header" class="text-right mr-3">
                Filter Types
              </div>
              <vs-row class="mt-3" vs-align="center">

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
                  <small>Include Stories</small>
                  <vs-switch class="ml-2" v-model="project.types.useStory" ></vs-switch>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
                  <small>Include Improvements</small>
                  <vs-switch class="ml-2" v-model="project.types.useImprovement" ></vs-switch>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
                  <small>Include New Features</small>
                  <vs-switch class="ml-2" v-model="project.types.useFeature" ></vs-switch>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
                  <small>Include Bugs</small>
                  <vs-switch class="ml-2" v-model="project.types.useBug" ></vs-switch>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1">
                  <small>Include Tasks</small>
                  <vs-switch class="ml-2" v-model="project.types.useTask" ></vs-switch>
                </vs-col>

                <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="2">
                  <small>Include Sub-tasks</small>
                  <vs-switch class="ml-2" v-model="project.types.useSubTask" ></vs-switch>
                </vs-col>

              </vs-row>
          </vs-collapse-item>
        </vs-collapse>

        <div class="row mt-3">
        
            <div class="col-md-12">
              <!-- <div class="table-responsive">
                <table class="table vs-con-loading__container">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Epic</th>
                      <th>Story Points</th>
                    </tr>
                  </thead>
                  <tbody ref="resultsTable">
                    <tr v-for="issue in issues" :key="issue.key" class="text-left">
                      <td>{{ issue.key }}</td>
                      <td :class="cardColour(issue.type.id)">{{ issue.type.name }}</td>
                      <td>{{ issue.title }}</td>
                      <td>{{ issue.epic }}</td>
                      <td>{{ issue.storyPoints }}</td>
                    </tr>
                  </tbody>
                </table>
              </div> -->

              <p class="text-info text-left">
                <font-awesome-icon :icon="['fas', 'info-circle']" size="lg" style="cursor: pointer;" @click="showTableHint = !showTableHint"/>
                <span v-if="!showTableHint">
                    How does this filtering work?
                </span>
                <span v-if="showTableHint">
                  By default all issues will be printed according to the types selected above, you can further filter the selection by selecting individual issues below.
                </span>
              </p>

              <vs-table
                multiple
                v-model="selectedIssues"
                :data="issues"
                class="mt-4">
                <template slot="thead">
                  <vs-th style="width: 10%">
                    Key
                  </vs-th>
                  <vs-th style="width: 10%">
                    Type
                  </vs-th>
                  <vs-th style="width: 60%">
                    Title
                  </vs-th>
                  <vs-th style="width: 10%">
                    Epic
                  </vs-th>
                  <vs-th style="width: 10%">
                    Story Points
                  </vs-th>
                </template>

                <template slot-scope="{data}">
                  <vs-tr :data="issue" :key="index" v-for="(issue, index) in data" class="text-left" >
                    <vs-td :data="data[index].key">
                      {{data[index].key}}
                    </vs-td>

                    <vs-td :class="cardColour(issue.type.id)" :data="data[index].type.name">
                      {{data[index].type.name}}
                    </vs-td>

                    <vs-td :data="data[index].title">
                      {{data[index].title}}
                    </vs-td>

                    <vs-td :data="data[index].epic">
                      {{data[index].epic}}
                    </vs-td>

                    <vs-td :data="data[index].storyPoints">
                      {{data[index].storyPoints}}
                    </vs-td>
                  </vs-tr>
                </template>
              </vs-table>
            </div>

        
        </div>

        <!-- Popups -->
        <div>
          <vs-popup title="Customise Card Template" :active.sync="template.popupActive" class="templateEditorPopup">
            <vs-progress indeterminate color="success" v-if="isTyping"></vs-progress>
            <div class="row">

              <!-- Editor -->
              <div class="col-md-6 border-right">

                  <!-- Toggle Type -->
                  <div class="row mb-3">

                    <div class="col-md-12">
                      <span>HTML Template Overide</span>
                      <vs-switch class="mt-2" v-model="settings.jiraCardExport.useHtml" @input="isTyping = true">
                      </vs-switch>
                    </div>

                  </div>
                  <!-- Toggle Type -->

                  <!-- Vue Editor -->
                  <div v-if="!settings.jiraCardExport.useHtml">
                    <div class="row mb-3">

                      <div class="col-md-4">
                        <vs-select
                          label="Wildcards"
                          v-model="template.editor.selectedWildcard"
                          class="w-100">
                          <vs-select-item :key="index" :value="item" :text="index" v-for="(item, index) in template.editor.wildcards" />
                        </vs-select>
                      </div>

                      <div class="col-md-4">
                        <vs-button color="primary" type="filled" class="w-100 mt-4" @click="insertWildcard()">Insert Wildcard</vs-button>  
                      </div>

                    </div>                  
                    <vue-editor
                    :class="settings.jiraCardExport.useHtml ? 'disable-section' : ''"
                      v-model="settings.jiraCardExport.template"
                      :editorToolbar="template.editor.toolbar"
                      :editorOptions="template.editor.options"
                      ref="editor"
                      @input="isTyping = true">
                    </vue-editor>
                  </div>
                  <!-- Vue Editor -->

                  <!-- HTML Editor -->
                  <div v-if="settings.jiraCardExport.useHtml">

                    <p class="mb-0 pb-0">You can enter custom HTML here to render your own card.</p>
                    <p>This uses Bootstrap 4 for styling, you can find out more <span class="text-info" @click="$electron.shell.openExternal('https://getbootstrap.com/docs/4.3/components/card/')">here</span></p>

                    <div class="row">

                      <!-- Toolbar -->
                      <div class="col-md-6 mb-2">

                        <div class="btn-toolbar" role="toolbar" ref="toolbar">

                          <!-- Group 1 -->
                          <div class="btn-group btn-group-sm mr-2" role="group" aria-label="First group">
                            <!-- Headings -->
                            <vs-dropdown vs-trigger-click>
                              <button type="button" class="btn btn-info border-right-flat">Style <font-awesome-icon icon="angle-down" size="sm" class="ml-1"/></button>
                              <vs-dropdown-menu>
                                  <vs-dropdown-item v-for="(style, key) in template.htmlEditor.styles" v-bind:key="key" @click="insertTagAroundSelection(style)">
                                  {{key}}
                                  </vs-dropdown-item>
                              </vs-dropdown-menu>
                            </vs-dropdown>
                            <!-- Headings -->

                            <button type="button" class="btn btn-info" @click="insertTagAroundSelection('b')"><strong>B</strong></button>
                            <button type="button" class="btn btn-info" @click="insertTagAroundSelection('i')"><i>I</i></button>
                            <button type="button" class="btn btn-info" @click="insertAtCaret(`<ul>\n\t<li>List item</li>\n</ul>`)"><font-awesome-icon icon="list-ul" size="lg"/></button>
                            <button type="button" class="btn btn-info" @click="insertAtCaret('<ol>\n\t<li>List item</li>\n</ol>')"><font-awesome-icon icon="list-ol" size="lg"/></button>

                            <!-- More Text Effects -->
                            <vs-dropdown vs-trigger-click>
                              <button type="button" class="btn btn-info border-left-flat" title="Wildcards"><font-awesome-icon icon="ellipsis-h" size="lg"/></button>
                              <vs-dropdown-menu class="border-black">
                                  <vs-dropdown-item v-for="(effect, key) in template.editor.wildcards" v-bind:key="key" @click="insertAtCaret(effect)">
                                    {{ key }}
                                  </vs-dropdown-item>
                              </vs-dropdown-menu>
                            </vs-dropdown>

                            <!-- More Text Effects -->
                          </div>
                          <!-- Group 1 -->

                        </div>

                      </div>

                      <div class="col-md-6 text-right mb-2">
                        <vs-button color="primary" type="flat" class="py-0 my-0" @click="restoreHtmlTemplate()">Restore Standard Template</vs-button>  
                      </div>
                      <!-- Toolbar -->

                    </div>

                    <textarea class="w-100 form-control border-dark" rows="9" ref="htmlTextbox" v-model="settings.jiraCardExport.htmlTemplate" @input="isTyping = true" ></textarea>

                  </div>
                  <!-- HTML Editor -->
         
              </div>

              <div class="col-md-6">
                <h2>Preview</h2>
                <p class="text-danger">This is the card size. Anything outside the border will not be included in the preview</p>
                <div class="card w-100 border-dark" style="max-height: 350px; min-height: 350px;">
                    <div class="card-body py-0 my-0" v-html="templateToDisplay">
                    </div>
                </div>
              </div>

            </div>
          </vs-popup>
        </div>

    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import templateComp from './cardTemplate'
import Vue from 'vue'
import _ from 'lodash'
import VueQrcode from '@chenfengyuan/vue-qrcode'

export default {
  name: 'jira-card-export',

  data: function () {
    return {
      issues: [],
      log: '',
      queryString: '',
      projectKey: '',
      jsqlInfoPopup: false,
      showTableHint: false,
      selectedIssues: [],
      template: {
        popupActive: false,
        editor: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'color': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean']
          ],
          selectedWildcard: '',
          wildcards: {
            Key: '{{ issue.key }}',
            Title: '{{ issue.title }}',
            Epic: '{{ issue.epic }}',
            'Story Points': '{{ issue.storyPoints }}',
            'Issue Type': '{{ issue.type.name }}',
            'Color Code': '<span :class="cardColour(issue.type.id)">Enter Text Here</span>',
            'Jira URL': '{{ issue.url }}',
            'QR Code': '<qrcode class="float-right" :value="issue.url" :options="{ width: 100 }" tag="img"></qrcode>'
          },
          options: {
            modules: {
              'history': {
                'delay': 2500,
                'userOnly': true
              }
            }
          },
          activeTab: 0
        },
        htmlEditor: {
          styles: {
            'Heading 1': 'h1',
            'Heading 2': 'h2',
            'Heading 3': 'h3',
            'Heading 4': 'h4',
            'Heading 5': 'h5',
            'Heading 6': 'h6',
            'Paragraph': 'p',
            'Preformatted': 'pre'
          },
          effects: {
            '<small>Small</small>': 'small'
          }
        }
      },
      export: {
        issuesLoaded: false,
        epicNamesLoaded: false
      },
      project: {
        id: 0,
        types: {
          subTaskId: 0,
          useSubTask: true,
          taskId: 0,
          useTask: true,
          storyId: 0,
          useStory: true,
          bugId: 0,
          useBug: true,
          improvementId: 0,
          useImprovement: true,
          newFeatureId: 0,
          useFeature: true
        },
        priorities: [
          { id: 2, name: 'Critical' },
          { id: 3, name: 'Major' },
          { id: 4, name: 'Minor' },
          { id: 5, name: 'Trivial' }
        ]
      }
    }
  },

  computed: {
    settings: {
      get () {
        return this.$store.state.settings
      },
      set (value) {
        this.$store.commit('setSettings', value)
      }
    },
    isTyping: {
      get () {
        return this.$store.state.changingConfig
      },
      set (value) {
        this.$store.commit('setChangeConfig', value)
      }
    },
    password () {
      return (this.settings.api.jiraToken === undefined || this.settings.api.jiraToken === '') ? '' : this.settings.api.jiraToken
    },
    username () {
      return (this.settings.api.jiraUsername === undefined || this.settings.api.jiraUsername === '') ? '' : this.settings.api.jiraUsername
    },
    auth () {
      return btoa(`${this.username}:${this.password}`)
    },
    jsql () {
      if (this.queryString.includes('jqlQuery=')) {
        return this.queryString.substring(this.queryString.indexOf('jqlQuery=') + 9)
      } else {
        return this.queryString
      }
    },
    canExport () {
      return this.export.issuesLoaded === true && this.export.epicNamesLoaded === true
    },
    status () {
      let status = ''

      if (this.export.issuesLoaded === true && this.export.epicNamesLoaded === false) {
        status = 'Issues Loaded, waiting for Epic\'s'
      } else if (this.export.issuesLoaded === false && this.export.epicNamesLoaded === true) {
        status = 'Epic\'s Loaded, waiting for issues'
      } else {
        status = ''
      }

      return status
    },
    templateToDisplay () {
      let html = ''
      if (this.settings.jiraCardExport.useHtml) {
        html = this.settings.jiraCardExport.htmlTemplate
      } else {
        html = this.settings.jiraCardExport.template
      }

      html = html.replace('{{ issue.key }}', 'Jira-0001')
      html = html.replace('{{ issue.type.name }}', 'Improvement')
      html = html.replace('{{ issue.title }}', 'Example Ticket Title - A very intresting story. Tickets longer than 100 characters will be truncated')
      html = html.replace('{{ issue.storyPoints }}', '5')
      html = html.replace('{{ issue.epic }}', 'An Epic Quest')
      html = html.replace('{{ issue.url }}', 'https://rimilia.atlassian.net/browse/XXX-1234')

      // QR code
      // let width = html.match(/:options=" width: (.*) "/)
      html = html.replace(/<qrcode(.*)<\/qrcode>/, '<div class="float-right" style=" width: 100px; height: 100px; outline: 1px solid black;"></div>')

      return html
    },
    issuesToPrintSelection () {
      if (this.selectedIssues.length !== 0) {
        return this.selectedIssues
      } else {
        return this.issues
      }
    },
    exportText () {
      if (this.issuesToPrintSelection.length === 0) {
        return 'Export'
      } else {
        return `Export ${this.issuesToPrintSelection.length} ticket${this.issuesToPrintSelection.length > 1 ? 's' : ''}`
      }
    }
  },

  mounted () {
    if (this.projectKey === '' && this.settings.jiraCardExport.projectKey !== '') {
      this.projectKey = this.settings.jiraCardExport.projectKey
    }
  },

  watch: {
    settings: {
      handler: _.debounce(function () {
        this.isTyping = false
      }, 2000),
      deep: true
    },
    isTyping (val) {
      if (!val) {
        this.$vs.notify({
          title: 'Changes Saved',
          color: 'success',
          position: this.settings.notifPos,
          time: 3000
        })
      }
    }
  },

  methods: {

    saveProjectKey () {
      this.settings.jiraCardExport.projectKey = this.projectKey
      this.$vs.notify({
        title: 'Project Key Saved',
        color: 'success',
        position: this.settings.notifPos,
        time: 3000
      })
    },

    cardColour (id) {
      if (parseInt(id) === this.project.types.subTaskId || parseInt(id) === this.project.types.taskId) {
        return 'text-primary'
      } else if (parseInt(id) === this.project.types.storyId || parseInt(id) === this.project.types.improvementId || parseInt(id) === this.project.types.newFeatureId) {
        return 'text-success'
      } else if (parseInt(id) === this.project.types.bugId) {
        return 'text-danger'
      } else {
        return 'text-info'
      }
    },

    insertWildcard () {
      let instance = this.$refs.editor.quill
      let selection = instance.getSelection()

      instance.deleteText(selection.index, selection.length)
      instance.insertText(selection.index, this.template.editor.selectedWildcard, 'user')
    },

    openEditor () {
      this.template.popupActive = true
      this.isTyping = false
    },

    validate () {
      if (this.projectKey === '' || this.queryString === '') {
        this.$vs.notify({
          title: 'Validation Error',
          text: 'Please check you entered the required information',
          color: 'danger',
          position: this.settings.notifPos,
          time: 8000
        })
        return false
      } else {
        return true
      }
    },

    restoreHtmlTemplate () {
      let defualtTemplate = `<div class="h-100 pl-2 border-left" style="border-width: 5px !important;" :class="borderColour(issue.type.id)">
  <h2 class="mt-2 float-right">{{ issue.storyPoints }}</h2>
  <h4 class="mt-2 float-left" :class="cardColour(issue.type.id)">{{ issue.type.name }}</h4>
  <h1 style="font-size: 3.5em" class="card-title pt-5" :class="cardColour(issue.type.id)">{{ issue.key }}</h1>
  <h3 class="card-subtitle mb-2 text-muted">{{ issue.title }}</h3>
  <h3 style="position: absolute; bottom: 0px;"><span class="badge badge-secondary">{{ issue.epic }}</span></h3>
</div>`

      if (this.settings.jiraCardExport.htmlTemplate !== defualtTemplate) {
        this.isTyping = true
        this.settings.jiraCardExport.htmlTemplate = defualtTemplate
      }
    },

    // Get AZCI project metadata
    apiGetJiraProjectData (auth, project) {
      return axios.get(`https://${this.settings.api.jiraDomain}/rest/api/3/issue/createmeta?projectKeys=${project}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'json'
        })
        .then(response => {
          // Check issue retrived is a task
          if (response.data.projects.length === 0) {
            this.$vs.notify({
              title: 'No project found',
              text: `Please check the project <strong>${this.projectKey}</strong> is visible, the key provided was correct and that you have permission to view it.`,
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
            return
          }
          this.project.id = parseInt(response.data.projects[0].id)
          this.project.types.subTaskId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Sub-task' && x.subtask === true).id)
          this.project.types.taskId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Task' && x.subtask === false).id)
          this.project.types.storyId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Story' && x.subtask === false).id)
          this.project.types.bugId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Bug' && x.subtask === false).id)
          this.project.types.improvementId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'Improvement' && x.subtask === false).id)
          this.project.types.newFeatureId = parseInt(response.data.projects[0].issuetypes.find(x => x.name === 'New Feature' && x.subtask === false).id)
        })
        .catch(error => {
          this.processAxiosError(error)
        })
    },

    // Get Jira Priorities
    apiGetJiraPriorities (auth) {
      return axios.get(`https://${this.settings.api.jiraDomain}/rest/api/3/priority`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'json'
        })
        .then(response => {
          let data = response.data
          data.forEach(element => {
            let index = data.findIndex((e) => e.id === element.id)
            if (index === -1) {
              this.project.priorities.push({ id: element.id, name: element.name })
            } else {
              this.project.priorities[index] = { id: element.id, name: element.name }
            }
          })
        })
        .catch(error => {
          this.processAxiosError(error)
        })
    },

    previewIssues () {
      // Fetch meta information
      axios.all([this.apiGetJiraProjectData(this.auth, this.projectKey), this.apiGetJiraPriorities(this.auth)])
        .then(axios.spread(function (acct, perms) {
        }))

      if (!this.validate()) {
        return
      }

      this.issues = []
      this.export.issuesLoaded = false
      this.export.epicNamesLoaded = false
      this.export.status = ''
      this.$vs.loading({
        container: this.$refs.resultsTable
      })
      // Fetch all Issues for the given query
      axios.get(`https://${this.settings.api.jiraDomain}/rest/api/latest/search?maxResults=100&jql=${this.jsql}`,
        {
          headers: {
            Authorization: `Basic ${this.auth}`,
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'json'
        })
        .then(response => {
          // customfield_10400 epic link
          // customfield_10004 story points

          for (let index = 0; index < response.data.issues.length; index++) {
            let issue = response.data.issues[index]
            this.issues.push(
              {
                key: issue.key,
                type: {
                  id: issue.fields.issuetype.id,
                  name: issue.fields.issuetype.name
                },
                title: issue.fields.summary,
                storyPoints: (issue.fields.customfield_10004 === undefined || issue.fields.customfield_10004 === null) ? 0 : issue.fields.customfield_10004,
                epic: (issue.fields.customfield_10400 === undefined || issue.fields.customfield_10400 === null) ? 'No Epic Link' : issue.fields.customfield_10400,
                url: `https://rimilia.atlassian.net/browse/${issue.key}`
              }
            )

            if (index === response.data.issues.length - 1) {
              this.export.issuesLoaded = true
            }
          }

          // get Epic Name
          for (let index = 0; index < this.issues.length; index++) {
            let issue = this.issues[index]

            if (issue.epic === 'No Epic Link') {
              if (index === this.issues.length - 1) {
                this.export.epicNamesLoaded = true
              }
              continue
            }
            axios.get(`https://${this.settings.api.jiraDomain}/rest/api/2/issue/${issue.epic}`,
              {
                headers: {
                  Authorization: `Basic ${this.auth}`,
                  Accept: 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                responseType: 'json'
              })
              .then(response => {
                issue.epic = response.data.fields.customfield_10401
              })
              .catch(error => {
                this.processAxiosError(error)
              })
              .then(() => {
                if (index === this.issues.length - 1) {
                  this.export.epicNamesLoaded = true
                }
              })
          }
        })
        .catch(error => {
          this.processAxiosError(error)
        })
        .then(() => {
          this.$vs.loading.close(this.$refs.resultsTable)
          if (this.issues.length === 0) {
            this.$vs.notify({
              title: 'No Issues found',
              text: 'No Issues were found from the given query. Please check the query syntax is correct',
              color: 'danger',
              position: this.settings.notifPos,
              time: 8000
            })
          }
        })
    },

    exportIssuesToPdf (issuesToPrint) {
      let html = ''
      if (this.settings.jiraCardExport.useHtml) {
        html = `
        <div>
          ${this.settings.jiraCardExport.htmlTemplate}
        </div>`
      } else {
        html = `
        <div>
          ${this.settings.jiraCardExport.template}
        </div>`
      }

      Vue.component('user-template', {
        props: ['projectData', 'issue'],
        template: html,
        methods: {
          cardColour (id) {
            if (parseInt(id) === this.projectData.types.subTaskId || parseInt(id) === this.projectData.types.taskId) {
              return 'text-primary'
            } else if (parseInt(id) === this.projectData.types.storyId || parseInt(id) === this.projectData.types.improvementId || parseInt(id) === this.projectData.types.newFeatureId) {
              return 'text-success'
            } else if (parseInt(id) === this.projectData.types.bugId) {
              return 'text-danger'
            } else {
              return 'text-info'
            }
          },
          borderColour (id) {
            if (parseInt(id) === this.projectData.types.subTaskId || parseInt(id) === this.projectData.types.taskId) {
              return 'border-primary'
            } else if (parseInt(id) === this.projectData.types.storyId || parseInt(id) === this.projectData.types.improvementId || parseInt(id) === this.projectData.types.newFeatureId) {
              return 'border-success'
            } else if (parseInt(id) === this.projectData.types.bugId) {
              return 'border-danger'
            } else {
              return 'border-info'
            }
          }
        }
      })

      // Truncate Titles
      issuesToPrint.forEach(issue => {
        if (issue.title.length > 100) {
          issue.title = `${issue.title.substring(0, 99)}...`
        }
      })

      let filteredIssues = []

      // FIlter issues to not include in print
      issuesToPrint.forEach(issue => {
        switch (parseInt(issue.type.id)) {
          case this.project.types.subTaskId:
            if (this.project.types.useSubTask) {
              filteredIssues.push(issue)
            }
            break
          case this.project.types.taskId:
            if (this.project.types.useTask) {
              filteredIssues.push(issue)
            }
            break
          case this.project.types.storyId:
            if (this.project.types.useStory) {
              filteredIssues.push(issue)
            }
            break
          case this.project.types.bugId:
            if (this.project.types.useBug) {
              filteredIssues.push(issue)
            }
            break
          case this.project.types.improvementId:
            if (this.project.types.useImprovement) {
              filteredIssues.push(issue)
            }
            break
          case this.project.types.newFeatureId:
            if (this.project.types.useFeature) {
              filteredIssues.push(issue)
            }
            break
          default:
            break
        }
      })

      Vue.component(VueQrcode.name, VueQrcode)

      var templateTing = new Vue({
        ...templateComp,
        parent: this,
        propsData: { issues: filteredIssues, projectData: this.project }
      }).$mount()

      this.$root.exportToPdf(templateTing.$el.innerHTML)
    },

    processAxiosError (error) {
      console.error(error)
      if (error.response === undefined) { return }
      // If Unauthorised
      if (error.response.status === 401) {
        this.$vs.notify({
          title: 'Unauthorised',
          text: 'Please check you entered the password correctly and that you have permission to view the Project.',
          color: 'danger',
          position: this.settings.notifPos,
          time: 8000
        })
      // if project not found
      } else if (error.response.status === 404) {
        this.$vs.notify({
          title: 'No response was found',
          text: 'Please check the project is visible, the key provided was correct and that you have permission to view it.',
          color: 'danger',
          position: this.settings.notifPos,
          time: 8000
        })
      }
    },

    // Editor HTML
    insertTagAroundSelection (formatting, name = 'tag') {
      // Get textbox element
      var element = this.$refs.htmlTextbox
      // Get selection start index
      var caretPos = element.selectionStart
      // Get Selection end index
      var caretEnd = element.selectionEnd
      // Get Current text value
      var textAreaTxt = this.$refs.htmlTextbox.value

      // Set the value
      let selectedText = textAreaTxt.substring(caretPos, caretEnd)

      if (selectedText === '') {
        this.$refs.htmlTextbox.value = `${textAreaTxt.substring(0, caretPos)}<${formatting}>${name}</${formatting}>${textAreaTxt.substring(caretEnd)}`
      } else {
        this.$refs.htmlTextbox.value = `${textAreaTxt.substring(0, caretPos)}<${formatting}>${selectedText}</${formatting}>${textAreaTxt.substring(caretEnd)}`
      }

      element.selectionStart = caretPos + formatting.length
      element.selectionEnd = caretPos + formatting.length

      let evt = document.createEvent('HTMLEvents')
      evt.initEvent('input', false, true)
      element.dispatchEvent(evt)
    },

    insertAtCaret (formatting) {
      if (this.settings.editor.autoLine) {
        formatting = '\n' + formatting
      }
      var element = this.$refs.htmlTextbox
      var caretPos = element.selectionStart
      var caretEnd = element.selectionEnd
      var textAreaTxt = this.$refs.htmlTextbox.value
      this.$refs.htmlTextbox.value = textAreaTxt.substring(0, caretPos) + formatting + textAreaTxt.substring(caretEnd)

      element.selectionStart = caretPos + formatting.length
      element.selectionEnd = caretPos + formatting.length

      let evt = document.createEvent('HTMLEvents')
      evt.initEvent('input', false, true)
      element.dispatchEvent(evt)
    }
  }
}
</script>

<style>
.vs-popup {
  width: 85% !important;
}

.info-popup .vs-popup {
  width: 60% !important;
}

@media screen and (max-width: 1500px) {

  .info-popup .vs-popup {
    width: 70% !important;
  }

}

.vs-popup--content {
  padding: 15px !important;
}

.disable-section {
  pointer-events: none;
  opacity: 0.4;
}

.disable {
  opacity: 0.4;
}
    /* box-shadow: 0 5px 25px 0 rgba(0,0,0,.4) */
</style>
