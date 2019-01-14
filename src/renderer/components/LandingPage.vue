<template>
<div class="container-fluid mx-2">
  <!-- Container -->

  <!-- Header Row -->
  <div class="row justify-content-center">
    <div class="col-sm-6">
      <vs-alert title="New Release Available" :active="outdated" color="success">
        A newer version is available. <a @click="$electron.shell.openExternal('https://github.com/Shockwave-Interactive/test-utility-app-info/releases')" class="text-info ml-2">See Releases</a>
      </vs-alert>
    </div>
  </div>
  <!-- Header Row -->

  <!-- Content -->
  <div class="row text-dark">

    <!-- Newsfeed -->
    <div :class="editQuickLinks ? 'col-sm-6' : 'col-sm-9'">
      <h1 class="mt-3 title">Latest Releases</h1>
      <hr>
      <div id="div-with-loading" class="vs-con-loading__container text-left">
        <div v-for="(release, index) in releases" v-bind:key="index">
          <h3>Version: {{ release.version }}</h3>
          <p v-html="release.body"></p>
          <hr>
        </div>
        <div class="text-center">
          <h3><a @click="$electron.shell.openExternal('https://github.com/Shockwave-Interactive/test-utility-app-info/releases')" class="text-info">More releases...</a></h3>
        </div>
      </div>
    </div>
    <!-- Newsfeed -->

    <!-- Quick Links -->
    <div :class="editQuickLinks ? 'col-sm-6' : 'col-sm-3'" class="text-center">
      <h1 class="mt-3">Quick Links</h1>
      <quick-links v-on:change-state="editQuickLinks = $event"></quick-links>
    </div>
    <!-- Quick Links -->

  </div>
  <!-- Content -->

  <!-- Container -->
</div>
</template>

<script>
  import axios from 'axios'
  import QuickLinks from './LandingPage/QuickLinks.vue'
  var log = require('electron-log')
  var showdown = require('showdown')
  var converter = new showdown.Converter()

  export default {
    name: 'landing-page',
    components: { QuickLinks },

    data: function () {
      return {
        editQuickLinks: false,
        releases: [],
        outdated: false
      }
    },

    methods: {
      getLatestReleaseBody () {
        this.$vs.loading({
          color: '#000',
          container: '#div-with-loading',
          scale: 0.45
        })
        axios({
          method: 'get',
          url: 'https://api.github.com/repos/Shockwave-Interactive/test-utility-app-info/releases'
        })
          .then(Response => {
            let releasesRaw = Response.data

            for (let index = 0; index < (releasesRaw.length < 3 ? releasesRaw.length : 3); index++) {
              const element = releasesRaw[index]
              let release = {}
              release.body = converter.makeHtml(element.body)
              release.version = element.tag_name
              release.url = element.html_url
              this.releases.push(release)
            }
            this.$vs.loading.close('#div-with-loading > .con-vs-loading')
            this.checkOutdated()
          })
          .catch(Response => {
            log.info(Response.data)
          })
      },
      checkOutdated () {
        // let appVersion = window.require('electron').remote.app.getVersion().replace(/\./g, '')
        let appVersion = 100
        let releaseVersion = this.releases[0].version.substring(1).replace(/\./g, '')
        this.outdated = releaseVersion > appVersion
      }
    },

    mounted () {
      this.getLatestReleaseBody()
      this.localQuickLinks = this.quickLinks
    }
  }
</script>

<style>
</style>

