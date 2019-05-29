<template>
<div>
  <div id="results-div" class="row mt-5">
    <div class="col-md-12 text-center">

        <div class="row">
    
              <div class="col-md-4">
                  <vs-input label-placeholder="Email" class="w-100" v-model="username"/>
              </div>
  
              <div class="col-md-4">
                  <vs-input label-placeholder="API Token" type="password" class="w-100" v-model="password"/>
                  <small class="text-info float-right" @click="$electron.shell.openExternal('https://id.atlassian.com/manage/api-tokens')">Don't have one? click here</small>
              </div>

                <div class="col-md-4">
                  <vs-input label-placeholder="Project" class="w-100" v-model="projectKey" :danger="projectKey === ''"
                  danger-text="Please enter the Key for the project this will be used for. This will be used to fetch the ID for issue types etc. If you have multiple projects pick the most used one"/>    
              </div>
    
        </div>

        <div class="row mt-2">
        
            <div class="col-md-12">
              <vs-input label-placeholder="Jira Query" class="w-100" v-model="queryString" :danger="queryString === ''" danger-text="Please provide the Jira Query in URL form" />
              <small @click="jsqlInfoPopup = true" class="text-info float-right">Not sure where to find it? click here</small>
                <vs-popup title="Find Jira Query URL" :active.sync="jsqlInfoPopup">
                  <p>
                    Using the advanced search in Jira, in the top-right hand side select the export button,
                    right-click on <strong>Export XML</strong> and select <strong>Copy link address</strong>
                  </p>
              </vs-popup>
            </div>
        
        </div>

        <div class="row mt-3">
            
            <div class="col-md-2">
              <button type="button" class="btn btn-info w-100" @click="previewIssues()">Preview</button>
            </div>

            <div class="col-md-2">
              <button type="button" class="btn btn-primary w-100" @click="exportIssuesToPdf(issues)" :disabled="issues.length === 0">Export</button>
              <small class="text-danger" v-if="issues.length === 0">Please previw the results before exporting</small>
            </div>

        
        </div>

        <div class="row mt-3 text-center">
          <div class="col-md-2">
            <h4 class="text-success">Stories: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.storyId).length }}</h4>
          </div>
          <div class="col-md-2">
            <h4 class="text-success">Improvements: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.improvementId).length }}</h4>
          </div>
          <div class="col-md-2">
            <h4 class="text-success">New Features: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.newFeatureId).length }}</h4>
          </div>
          <div class="col-md-2">
            <h4 class="text-danger">Bugs: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.bugId).length }}</h4>
          </div>
          <div class="col-md-2">
            <h4 class="text-info">Tasks: {{ issues.filter(issue => parseInt(issue.type.id) === project.types.taskId).length }}</h4>
          </div>
          <div class="col-md-2">
            <h4 >Total: {{ issues.length }}</h4>
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

    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import templateComp from './cardTemplate'
import Vue from 'vue'
// import Papa from 'papaparse'
// import _ from 'lodash'

// const remote = require('electron').remote
// var fs = require('fs')

// const {clipboard} = require('electron')
// TODO: Add customisable columns

export default {
  name: 'ci-tests',

  data: function () {
    return {
      issues: [],
      log: '',
      queryString: '',
      projectKey: '',
      jsqlInfoPopup: false,
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
    settings () {
      return this.$store.state.settings
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
    }
  },

  mounted () {
  },

  watch: {
  },

  methods: {

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

    validate () {
      if (this.projectKey === '' || this.project.id !== 0 || this.queryString === '') {
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

          response.data.issues.forEach(issue => {
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
          })
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

    // TODO: Needs to be revised at a later date
    exportIssuesToPdf (issuesToPrint) {
      // let Html = '<html><head><title>Jira Ticket Export</title></head><body></body></html>'

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
</style>
