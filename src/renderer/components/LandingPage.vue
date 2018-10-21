<template>
<div class="container-fluid mx-2">
  <div class="row">
    <div class="col-sm-8 text-center">
      <h1 class="mt-3">Newsfeed</h1>
      <hr>
      <div id="div-with-loading" class="vs-con-loading__container text-left">
        <h3>Latest Release: {{ latestRelease }}</h3>
        <p v-html="latestReleaseBody"></p>
      </div>
    </div>
    <div class="col-sm-4 text-center">
      <h1 class="mt-3">Quick Links</h1>
      <a @click="this.$electron.shell.openExternal('https://rimilia.atlassian.net/projects/AZCI/issues?filter=myopenissues')" class="text-white btn btn-block btn-primary"><font-awesome-icon icon="bug" size="lg"/> Jira</a>
      <a @click="this.$electron.shell.openExternal('https://rimilia.atlassian.net/wiki/spaces/AZURE/pages/454426652')" class="text-white btn btn-block btn-primary"><font-awesome-icon icon="book" size="lg"/> CI Subspace</a>
    </div>
  </div>
</div>
</template>

<script>
  import axios from 'axios'
  var log = require('electron-log')
  var showdown = require('showdown')
  var converter = new showdown.Converter()
  converter.getOptions().headerLevelStart = 4
  export default {
    name: 'landing-page',

    data: function () {
      return {
        latestReleaseBody: '',
        latestRelease: ''
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
          url: 'https://api.github.com/repos/HarmanU/test-utility-app/releases/latest'
        })
          .then(Response => {
            this.latestReleaseBody = converter.makeHtml(Response.data.body)
            this.latestRelease = Response.data.tag_name
            this.$vs.loading.close('#div-with-loading > .con-vs-loading')
          })
          .catch(Response => {
            log.info(Response.data)
          })
      }
    },

    mounted () {
      this.getLatestReleaseBody()
    }
  }
</script>

<style>

</style>
