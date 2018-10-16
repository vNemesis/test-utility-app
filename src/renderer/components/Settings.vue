<template>
<div class="container-fluid mx-2">
  <div class="row">
    <div class="col-sm-8 text-center">
      <h1 class="mt-3">Info</h1>
      <p>Version: {{ appVersion }}</p>
    </div>
  </div>
</div>
</template>

<script>
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

    mounted () {
      // this.latestReleaseNotif()
    }
  }
</script>

<style>

</style>
