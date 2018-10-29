<template>
<div class="container-fluid">
  <vs-progress indeterminate color="success" v-if="isTyping"></vs-progress>
  <div class="row" :class="!isTyping ? 'mt-4' : ''">
    <div class="col-sm-12">

      <vs-tabs vs-position="top" vs-alignment="fixed">
      <vs-tab vs-label="General">
        <!-- General Settings -->
        <div class="row justify-content-center">
          <div class="col-sm-6">

            <!-- Default Assignee -->
            <div class="row justify-content-center">
              <div class="col-sm-12">
                <vs-input id="autoNewLine" v-model="settings.planCreator.defaultAssignee" vs-label="Default Assignee" @input="isTyping = true" class="w-100"/>
              </div>
            </div>
            <!-- Default Assignee -->

            <!-- Notification Position -->
            <div class="row justify-content-center mt-2">
              <div class="col-sm-12">
                <vs-select label="Notification Location" vs-label="Notification Position" class="w-100" v-model="settings.notifPos" @input="checkNotifPosChanged()">
                  <vs-select-item :key="index" :vs-value="item" :vs-text="index" v-for="(item,index) in notifPosOptions" />
                </vs-select>
              </div>
            </div>
            <!-- Notification Position -->

          </div>
          <div class="col-sm-6">
            
            <!-- defaultPlanExportDir -->
            <div class="row justify-content-center">
              <div class="col-sm-12">
                <vs-input id="autoNewLine" v-model="settings.planCreator.defaultPlanExportDir" vs-label="Default Export Location"
                @input="isTyping = true" class="w-100" vs-description-text="Set a defualt location for your test plan exports"/>
              </div>
            </div>
            <!-- defaultPlanExportDir -->

          </div>
        </div>

        <h3 class="mt-4">Test Plan Creator</h3>        
        <div class="row">
          <div class="col-sm-12">

            <!-- Jira Table Auto New Line -->
            <label for="autoNewLine">Add a new line in the test purpose every 50 Characters when generating a Jira Table</label>
            <vs-switch id="autoJiraNewLine" v-model="settings.planCreator.jiraNewLine" @input="isTyping = true">
                <span slot="on">On</span>
                <span slot="off">Off</span>
            </vs-switch>
            <!-- Jira Table Auto New Line -->

          </div>
        </div>
        <!-- General Settings -->
      </vs-tab>
      <vs-tab vs-label="Editor">
        <!-- Editor Settings -->
        <div class="row">
          <div class="col-sm-6">

            <!-- Toggles -->
            <div class="row justify-content-center">
              <div class="col-sm-12">
                <label for="showEditor">Show editor when selecting text box</label>
                <vs-switch id="showEditor" v-model="settings.editor.showEditor" @input="isTyping = true">
                    <span slot="on">Yes</span>
                    <span slot="off">No</span>
                </vs-switch>

                <label for="autoNewLine">Auto new line when inserting formatting</label>
                <vs-switch id="autoNewLine" v-model="settings.editor.autoLine" @input="isTyping = true">
                    <span slot="on">On</span>
                    <span slot="off">Off</span>
                </vs-switch>

              </div>
            </div>
            <!-- Toggles -->

          </div>
          <div class="col-sm-6">
          </div>
        </div>
        <!-- Editor Settings -->
      </vs-tab>
      <vs-tab vs-label="Info">
        <!-- Info -->
        <div class="row justify-content-center">
          <div class="col-sm-12">
            <h1 class="mt-3">Info</h1>
            <p>Installed Version: {{ appVersion }}</p>
            <p>Latest Version: <span id="span-with-loading" class="vs-con-loading__container">{{ latestRelease }}</span></p>
            <vs-button ref="getLatestButton" @click="getLatestRelease" vs-type="line" vs-color="primary">Check for Update</vs-button>
            <vs-button v-if="releaseFound" @click="openUrl(releaseUrl)" vs-type="line" >Release Page</vs-button>
          </div>
        </div>
        <!-- Info -->
      </vs-tab>
      </vs-tabs>

    </div>
  </div>
</div>
</template>

<script>
  import _ from 'lodash'
  import axios from 'axios'
  var log = require('electron-log')
  export default {
    name: 'settings',

    data: function () {
      return {
        latestRelease: '',
        releaseFound: false,
        releaseUrl: '',
        notifPosOptions: {
          'Top left': 'top-left',
          'Top middle': 'top-center',
          'Top right': 'top-right',
          'Bottom Left': 'bottom-left',
          'Bottom middle': 'bottom-center',
          'Bottom right': 'bottom-right'
        },
        oldNotifPos: ''
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
      }
    },

    methods: {
      openUrl (link) {
        this.$electron.shell.openExternal(link)
      },
      getLatestRelease () {
        this.$vs.loading({
          background: 'primary',
          color: '#000',
          container: '#span-with-loading',
          scale: 0.45
        })
        axios({
          method: 'get',
          url: 'https://api.github.com/repos/HarmanU/test-utility-app/releases/latest'
        })
          .then(Response => {
            this.latestRelease = Response.data.tag_name
            this.releaseUrl = Response.data.html_url
            this.releaseFound = true
            this.$vs.loading.close('#span-with-loading > .con-vs-loading')
          })
          .catch(Response => {
            log.info(Response.data)
          })
      },
      checkNotifPosChanged () {
        if (this.settings.notifPos !== this.oldNotifPos) {
          this.isTyping = true
          this.oldNotifPos = this.settings.notifPos
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
      isTyping (val) {
        if (!val) {
          this.$vs.notify({
            title: 'Settings Saved',
            color: 'success',
            icon: 'save',
            position: this.$store.state.settings.notifPos,
            time: 3000
          })
        }
      }
    }
  }
</script>

<style>

</style>
