<template>
<div>
  <div id="results-div" class="row mt-3 mx-3">
    <div class="col-md-12 text-center">


        <div class="row">
        
            <div class="col-md-9">
              <vs-input label-placeholder="Jira Query" class="w-100" v-model="queryString" :danger="queryString === ''" danger-text="Please provide the Jira Query in URL form" />
              <small @click="jsqlInfoPopup = true" class="text-info float-right">Not sure where to find it? click here</small>
                <vs-popup title="Find Jira Query URL" :active.sync="jsqlInfoPopup" class="info-popup">
                  <div class="row">
                    
                    <div class="col-md-6 col-sm-3">
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

            <div class="col-md-2">
              <vs-input label-placeholder="Project" class="w-100" v-model="projectKey" :danger="projectKey === ''"
              danger-text="Please enter the Key for the project this will be used for. This will be used to fetch the ID for issue types etc. If you have multiple projects pick the most used one"/>
            </div>

            <div class="col-md-1 mt-3"> 
              <button type="button" class="btn btn-primary w-100" @click="saveProjectKey" :disabled="projectKey == settings.jiraCardExport.projectKey">Save</button>
            </div>
        
        </div>

        <div class="row">

              <div class="col-md-2 mt-3">
                <button type="button" class="btn btn-info w-100" @click="previewIssues()">Fetch Tickets</button>
                <small>{{ status }}</small>
              </div>

              <div class="col-md-2 mt-3">
                <button type="button" class="btn btn-primary w-100" @click="exportIssuesToPdf(issues)" :disabled="!canExport">Export</button>
                <small class="text-danger" v-if="!canExport">Please previw the results before exporting</small>
              </div>

              <div class="col-md-2 offset-md-6 mt-3">
                <button type="button" class="btn btn-dark w-100" @click="openEditor">Edit template</button>
              </div>
    
        </div>

        <div class="row mt-3 text-center">
          <div class="col-md-2">
            <h6 class="text-success">Stories: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.storyId).length }}</h6>
          </div>
          <div class="col-md-2">
            <h6 class="text-success">Improvements: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.improvementId).length }}</h6>
          </div>
          <div class="col-md-2">
            <h6 class="text-success">New Features: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.newFeatureId).length }}</h6>
          </div>
          <div class="col-md-2">
            <h6 class="text-danger">Bugs: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.bugId).length }}</h6>
          </div>
          <div class="col-md-2">
            <h6 class="text-info">Tasks: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.taskId).length }}</h6>
          </div>
          <div class="col-md-2">
            <h6 >Total: {{ issues.length }}</h6>
          </div>
        </div>

        <div class="row mt-3">
        
            <div class="col-md-12">
              <!-- <textarea class="form-control" cols="30" rows="10" readonly v-model="log"></textarea> -->

              <div class="table-responsive">
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
              </div>
            </div>

        
        </div>

        <!-- Popups -->
        <div>
          <vs-popup title="Customise Card Template" :active.sync="template.popupActive" class="templateEditorPopup">
            <vs-progress indeterminate color="success" v-if="isTyping"></vs-progress>
            <div class="row">

              <!-- Editor -->
              <div class="col-md-6 border-right">

                  <!-- Toolbar -->
                  <div class="row mb-3">

                    <div class="col-md-12">
                      <span>HTML Template Overide</span>
                      <vs-switch class="mt-2" v-model="settings.jiraCardExport.useHtml" @input="isTyping = true">
                      </vs-switch>
                    </div>

                  </div>
                    <!-- Toolbar -->

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
                      <div class="col-md-6 offset-md-6 text-right mb-2">
                        <vs-button color="primary" type="flat" class="py-0 my-0" @click="restoreHtmlTemplate()">Restore Standard Template</vs-button>  
                      </div>
                      <!-- Toolbar -->

                    </div>

                    <vs-textarea class="w-100" rows="9" v-model="settings.jiraCardExport.htmlTemplate" @input="isTyping = true" />

                  </div>
                  <!-- HTML Editor -->
         
              </div>

              <div class="col-md-6">
                <h2>Preview</h2>
                <div class="card w-100" style="max-height: 300px; min-height: 300px border-color: black;">
                  <div class="card-body" v-html="templateToDisplay">
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

export default {
  name: 'jira-card-export',

  data: function () {
    return {
      issues: [],
      log: '',
      queryString: '',
      projectKey: '',
      jsqlInfoPopup: false,
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
            'Color Code': '<span :class="cardColour(issue.type.id)">Enter Text Here</span>'
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
          taskId: 0,
          storyId: 0,
          bugId: 0,
          improvementId: 0,
          newFeatureId: 0
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
      return this.queryString.substring(this.queryString.indexOf('jqlQuery=') + 9)
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

      return html
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
      let defualtTemplate = `<h5 class="mt-2">Story Points: {{ issue.storyPoints }}</h5>
<h5 class="mt-2" :class="cardColour(issue.type.id)">{{ issue.type.name }}</h5>
<h2 class="card-title" :class="cardColour(issue.type.id)">{{ issue.key }}</h2>
<h3 class="card-subtitle mb-2 text-muted">{{ issue.title }}</h3>
<h3><span class="badge badge-secondary">{{ issue.epic }}</span></h3>`

      if (this.settings.jiraCardExport.htmlTemplate !== defualtTemplate) {
        this.isTyping = true
        this.settings.jiraCardExport.htmlTemplate = defualtTemplate
      }
    },

    // Get AZCI project metadata
    apiGetJiraProjectData (auth, project) {
      return axios.get(`https://rimilia.atlassian.net/rest/api/3/issue/createmeta?projectKeys=${project}`,
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
      return axios.get('https://rimilia.atlassian.net/rest/api/3/priority',
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
      axios.get(`https://rimilia.atlassian.net/rest/api/latest/search?maxResults=100&jql=${this.jsql}`,
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
                epic: (issue.fields.customfield_10400 === undefined || issue.fields.customfield_10400 === null) ? 'No Epic Link' : issue.fields.customfield_10400
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
            axios.get(`https://rimilia.atlassian.net/rest/api/2/issue/${issue.epic}`,
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
              text: 'No Issues were found from the given query',
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
          }
        }
      })

      // Truncate Titles
      issuesToPrint.forEach(issue => {
        if (issue.title.length > 100) {
          issue.title = `${issue.title.substring(0, 99)}...`
        }
      })

      var templateTing = new Vue({
        ...templateComp,
        parent: this,
        propsData: { issues: issuesToPrint, projectData: this.project }
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
</style>
