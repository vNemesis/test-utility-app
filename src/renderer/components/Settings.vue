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
                <vs-input id="autoNewLine" v-model="settings.defaultAssignee" vs-label="Default Assignee" @input="isTyping = true" class="w-100"/>
              </div>
            </div>
            <!-- Default Assignee -->

          </div>
          <div class="col-sm-6">
            
            <!-- Atlassian Key -->
            <div class="row justify-content-center">
              <div class="col-sm-12">
                <vs-input id="autoNewLine" v-model="settings.atlassianKey" vs-label="Atlassian Personal Access Token"
                @input="isTyping = true" class="w-100" vs-description-text="This is stored in plain text, use at own risk. Make sure to only give Read Permission"/>
              </div>
            </div>
            <!-- Atlassian Key -->

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
                <label for="autoNewLine">Show editor when selecting text box</label>
                <vs-switch id="showEditor" v-model="settings.showEditor" @input="isTyping = true">
                    <span slot="on">Yes</span>
                    <span slot="off">No</span>
                </vs-switch>

                <label for="autoNewLine">Auto new line</label>
                <vs-switch id="autoNewLine" v-model="settings.autoLine" @input="isTyping = true">
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
            <p>Version: {{ appVersion }}</p>
            <button @click="getLatestRelease">test</button>
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
  export default {
    name: 'landing-page',

    data: function () {
      return {
        latestRelease: ''
      }
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
      getLatestRelease () {
        axios({
          method: 'get',
          url: 'http://localhost:5555'
        })
          .then(Response => {
            this.latestRelease = Response.data.name
          })
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
            position: 'top-center',
            time: 3000
          })
        }
      }
    }
  }
</script>

<style>

</style>
