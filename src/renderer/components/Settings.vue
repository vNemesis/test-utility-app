<template>
<div class="container-fluid"> <!-- Master Container -->
  <vs-progress indeterminate color="success" v-if="isTyping"></vs-progress>
  <div class="row" :class="!isTyping ? 'mt-4' : ''"> <!-- Master Row -->
    <div class="col-sm-12"> <!-- Master Col -->

      <vs-tabs vs-position="top" vs-alignment="fixed">
      <!-- General Tab -->
      <vs-tab vs-label="General">

        <div class="row">
          <div class="col-sm-12">

            <!-- General Settings -->
            <h3 class="mt-3">General</h3>
            <div class="row">
              <div class="col-sm-6">

                <!-- Notification Position -->
                <div class="row justify-content-center mt-2">
                  <div class="col-sm-12">
                    <vs-select label="Notification Position" class="w-100" v-model="settings.notifPos" @input="checkNotifPosChanged()">
                      <vs-select-item :key="index" :value="item" :text="index" v-for="(item,index) in notifPosOptions" />
                    </vs-select>
                  </div>
                </div>
                <!-- Notification Position -->

                <div class="col-sm-6">

                </div>

              </div>
            </div>
            <!-- General Settings -->

            <!-- Theme Settings -->
            <h3 class="mt-4">Theme</h3>      
            <div class="row">
              <div class="col-sm-12">

                <p>Application Main Theme</p>
                <vs-row>
                  <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
                    <input id="primaryThemeColourPicker" class="h-50" style="margin-top: 30px;" type="color" v-model="settings.theme.primary" @input="isTyping = true"/>
                  </vs-col>

                  <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="3">
                    <vs-input label="HEX" placeholder="#1f74ff" v-model="settings.theme.primary" @input="isTyping = true"
                    :danger="this.validationErrors.themePrimary" danger-text="Incorrect Format"/>
                  </vs-col>
                </vs-row>

                <p class="mt-3">Dark Mode</p>
                <vs-switch id="autoJiraNewLine" v-model="settings.theme.darkMode" @input="isTyping = true">
                    <span slot="on">On</span>
                    <span slot="off">Off</span>
                </vs-switch>
                
              </div>
            </div>
            <!-- Theme Settings -->

          </div>
        </div>

      </vs-tab>
      <!-- General Tab -->

      <!-- Test Plan Creator Tab -->
      <vs-tab vs-label="Test Plan Creator">
        <!-- Test Plan Creator Settings -->
        <div class="row mt-5">
          <div class="col-sm-12">

            <!-- Other Settings -->
            <div class="row justify-content-center">
              <div class="col-sm-8">

                  <!-- Default Assignee -->
                  <div class="row">
                    <div class="col-sm-12">
                      <vs-input id="autoNewLine" v-model="settings.planCreator.defaultAssignee" label="Default Assignee" @input="isTyping = true" class="w-100"/>
                    </div>
                  </div>
                  <!-- Default Assignee -->

                  <!-- defaultPlanExportDir -->
                  <div class="row mt-4">
                    <div class="col-sm-12">
                      <vs-input id="autoNewLine" v-model="settings.planCreator.defaultPlanExportDir" label="Default Export Location"
                      @input="isTyping = true" class="w-100" description-text="Set a defualt location for your test plan exports"/>
                    </div>
                  </div>
                  <!-- defaultPlanExportDir -->

                </div>
            </div>
            <!-- Other Settings -->

            <!-- Toggles -->
            <div class="row justify-content-center mt-3">
              <div class="col-sm-8">
                <vs-list>

                  <vs-list-header title="Editor"></vs-list-header>

                  <span :class="!settings.editor.showEditor ? 'disabled':''">
                    <vs-list-item title="Show Editor" subtitle="Show editor when editing test purpose">
                      <vs-switch id="showEditor" v-model="settings.editor.showEditor" @input="isTyping = true">
                        <span slot="on">Yes</span>
                        <span slot="off">No</span>
                      </vs-switch>
                    </vs-list-item>

                    <vs-list-item title="Auto New Line" subtitle="Automatically add a new line when adding formatting from the editor toolbar">
                      <vs-switch id="autoNewLine" :disabled="!settings.editor.showEditor" v-model="settings.editor.autoLine" @input="isTyping = true">
                        <span slot="on">On</span>
                        <span slot="off">Off</span>
                      </vs-switch>
                    </vs-list-item>
                  </span>

                  <vs-list-header title="Generators"></vs-list-header>

                  <!-- Jira Table Auto New Line -->
                  <vs-list-item title="Jira Table New Line" subtitle="Add a new line in the test purpose every X Characters when generating a Jira Table"
                  :class="!settings.planCreator.jiraNewLine ? 'disabled':''">
                    <vs-row>
                      <vs-col vs-type="flex" vs-justify="flex-start" vs-align="center" vs-w="6" >
                        <vs-input-number v-model="settings.planCreator.jiraNewLineAmount" :disabled="!settings.planCreator.jiraNewLine" @input="isTyping = true" class="mr-4"/>
                      </vs-col>

                      <vs-col vs-type="flex" vs-justify="flex-end" vs-align="center" vs-w="6">
                        <vs-switch id="autoJiraNewLine" v-model="settings.planCreator.jiraNewLine" @input="isTyping = true">
                            <span slot="on">On</span>
                            <span slot="off">Off</span>
                        </vs-switch>
                      </vs-col>
                    </vs-row>
                  </vs-list-item>
                  <!-- Jira Table Auto New Line -->

                </vs-list>
              </div>
            </div>
            <!-- Toggles -->

          </div>
        </div>
        <!-- Test Plan Creator Settings -->

      </vs-tab>
      <!-- Test Plan Creator Tab -->

      <!-- Misc Tab -->
      <vs-tab vs-label="Misc">
        <!-- Info -->
        <div class="row justify-content-center">
          <div class="col-sm-12">
            <h1 class="mt-3">Info</h1>
            <p>Installed Version: {{ appVersion }}</p>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-12">
            <h1 class="mt-3">Log</h1>
            <vs-button type="line" @click="openLog()">Open Log File</vs-button>
            <!-- <vs-button type="line" color="danger" @click="resetSettings()">Reset Settings</vs-button> -->
          </div>
        </div>

        <div class="row">
          <div class="col-sm-12">
            <h1 class="mt-3">Advanced</h1>
            <vs-button type="line" @click="openConfig()">Open Config File</vs-button>
            <vs-button type="line" color="danger" @click="resetSettings()">Reset Settings</vs-button>
          </div>
        </div>
        <!-- Info -->
      </vs-tab>
      <!-- Misc Tab -->

      </vs-tabs>

      <!-- Popups -->
      <vs-popup fullscreen title="fullscreen" :active.sync="logPopup.active">
        <div class="row">
          <div class="col-sm-12">
            <vs-button type="filled" color="danger" @click="clearLog()">Clear Log</vs-button>
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-sm-12">

            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr class="text-center">
                    <th width="20%">Date Time</th>
                    <th width="5%">Type</th>
                    <th width="75%">Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="message in logPopup.logContents" v-bind:key="message.id">
                    <td class="text-center" v-html="message.datetime"></td>
                    <td class="text-center" v-html="message.type"></td>
                    <td v-html="message.desc"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

      </vs-popup>
      <!-- Popups -->

    </div> <!-- Master Col -->
  </div> <!-- Master Row -->
</div> <!-- Master Container -->
</template>

<script>
  import _ from 'lodash'
  const { app } = require('electron').remote
  var fs = require('fs')
  export default {
    name: 'settings',

    data: function () {
      return {
        notifPosOptions: {
          'Top left': 'top-left',
          'Top middle': 'top-center',
          'Top right': 'top-right',
          'Bottom Left': 'bottom-left',
          'Bottom middle': 'bottom-center',
          'Bottom right': 'bottom-right'
        },
        oldNotifPos: '',
        validationErrors: {
          themePrimary: false
        },
        logPopup: {
          active: false,
          logContents: '',
          loading: false
        }
      }
    },

    mounted () {
      this.oldNotifPos = this.settings.notifPos
    },

    computed: {
      appVersion () {
        return window.require('electron').remote.app.getVersion()
      },
      settings: {
        get () {
          return this.$store.state.settings
        },
        set (value) {
          if (this.validationErrorsCount === 0) {
            this.$store.commit('setSettings', value)
            this.$root.refreshTheme()
          }
        }
      },
      isTyping: {
        get () {
          return this.$store.state.changingConfig
        },
        set (value) {
          this.$store.commit('setChangeConfig', value)
          if (this.validationErrorsCount === 0) {
            this.$root.refreshTheme()
          }
        }
      },
      validationErrorsCount () {
        let count = 0
        Object.values(this.validationErrors).forEach(value => {
          if (value) {
            count++
          }
        })
        return count
      }
    },

    methods: {
      openLog () {
        this.logPopup.loading = true

        let logLines = fs.readFileSync(`${app.getPath('userData')}/log.log`, 'utf8').split('}')

        if (logLines.length === 0 || logLines[0] === '') {
          this.$vs.notify({
            title: 'Log empty',
            text: 'Log file contains no errors :D',
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 5000
          })
          return
        }

        let testobj = []

        logLines.forEach(element => {
          element = `${element}}<br /><br />`

          let datetime = element.match(/(\[[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]+\])/g)
          let type = element.match(/(\[error\])|(\[warn\])/g)
          let desc = element.match(/\{((.|\n)*?)\}/)

          if (datetime === null || type === null || desc === null) {
            return
          }

          testobj.push({
            id: testobj.length + 1,
            datetime: datetime[0].replace(/^\[(.+)\]$/, '$1').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]+)/g, '<span style="color: #ce024d;">$1</span>'),
            type: type[0].replace(/^\[(.+)\]$/, '$1').replace(/(error)/g, '<span style="color: red;">$1</span>').replace(/(warn)/g, '<span style="color: #ffc535;">$1</span>'),
            desc: desc[0].replace(/(\\n)+/g, '<br/>')
          })
        })

        this.logPopup.logContents = testobj
        this.logPopup.loading = false
        this.logPopup.active = true
      },
      clearLog () {
        fs.truncate(`${app.getPath('userData')}/log.log`, 0, function () {
          this.$vs.notify({
            title: 'Success',
            text: 'Log cleared',
            color: 'success',
            position: this.$store.state.settings.notifPos,
            time: 5000
          })
        })
        this.logPopup.active = false
      },
      checkNotifPosChanged () {
        if (this.settings.notifPos !== this.oldNotifPos) {
          this.isTyping = true
          this.oldNotifPos = this.settings.notifPos
        }
      },
      openConfig () {
        this.$root.openConfig()
      },
      resetSettings () {
        if (confirm('Are you sure you wish to reset your settings? The application will restart to apply the changes.')) {
          this.$root.resetSettings()
        }
      }
    },

    watch: {
      settings: {
        handler: _.debounce(function () {
          this.isTyping = false
        }, 2000),
        deep: true
      },
      'settings.theme.primary' (val) {
        if (/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/.test(val)) {
          this.validationErrors.themePrimary = false
        } else {
          this.validationErrors.themePrimary = true
        }
      },
      isTyping (val) {
        if (!val) {
          if (this.validationErrorsCount === 0) {
            this.$vs.notify({
              title: 'Settings Saved',
              color: 'success',
              position: this.$store.state.settings.notifPos,
              time: 3000
            })
          } else {
            this.$vs.notify({
              title: 'Error',
              text: 'There are still validation errors, please resolves these to allow settings to save',
              color: 'danger',
              position: this.$store.state.settings.notifPos,
              time: 5000
            })
          }
        }
      }
    }
  }
</script>

<style>
.disabled {
  color: #d8d8d8;
}
</style>
