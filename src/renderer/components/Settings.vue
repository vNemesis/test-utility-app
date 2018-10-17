<template>
<div class="container-fluid">
  <vs-progress indeterminate color="success" v-if="isTyping"></vs-progress>
  <div class="row" :class="!isTyping ? 'mt-4' : ''">
    <div class="col-sm-12">

      <vs-tabs vs-position="top" vs-alignment="fixed">
      <vs-tab vs-label="General">
        <!-- General Settings -->
        <div class="row justify-content-center">
          <div class="col-sm-12">

            <!-- App Directory -->
            <div class="row justify-content-center">
              <div class="col-sm-12">
                <vs-input id="autoNewLine" v-model="defaultAssignee" vs-label="Default Assignee" @input="isTyping = true" class="w-100"/>
              </div>
            </div>
            <!-- App Directory -->

          </div>
        </div>
        <!-- General Settings -->
      </vs-tab>
      <vs-tab vs-label="Editor">
        <!-- Editor Settings -->
        <div class="row">
          <div class="col-sm-6">

            <!-- Auto Line -->
            <div class="row justify-content-center">
              <div class="col-sm-12">
                <label for="autoNewLine">Auto new line</label>
                <vs-switch id="autoNewLine" v-model="autoLine" @input="isTyping = true">
                    <span slot="on">On</span>
                    <span slot="off">Off</span>
                </vs-switch>
              </div>
            </div>
            <!-- Auto Line -->

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
  // import axios from 'axios'
  const appVersion = window.require('electron').remote.app.getVersion()
  export default {
    name: 'landing-page',

    data: function () {
      return {
        latestRelease: '',
        appVersion: appVersion
      }
    },

    computed: {
      autoLine: {
        get () {
          return this.$store.state.settings.autoLine
        },
        set (value) {
          this.$store.commit('setSettingAutoLine', value)
        }
      },
      defaultAssignee: {
        get () {
          return this.$store.state.settings.defaultAssignee
        },
        set (value) {
          this.$store.commit('setSettingDefaultAssignee', value)
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
      latestReleaseNotif () {
        // axios({
        //   method: 'get',
        //   url: '',
        // })
        //   .then(Response => {
        //     this.latestRelease = Response.data.name
        //   })
      }
    },

    watch: {
      autoLine: _.debounce(function () {
        this.isTyping = false
      }, 2000),
      defaultAssignee: _.debounce(function () {
        this.isTyping = false
      }, 2000),
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
