<template>
<div class="container-fluid mx-2">
  <div class="row">
    <div class="col-sm-8 text-center">
      <h1 class="mt-3">Overview</h1>
    </div>
    <div class="col-sm-4 text-center">
      <h1 class="mt-3">Quick Links</h1>
      <a @click="onOpenUrl('https://rimilia.atlassian.net/projects/AZCI/issues?filter=myopenissues')" class="text-white btn btn-block btn-primary"><font-awesome-icon icon="bug" size="lg"/> Jira</a>
      <a @click="onOpenUrl('https://rimilia.atlassian.net/wiki/spaces/AZURE/pages/454426652')" class="text-white btn btn-block btn-primary"><font-awesome-icon icon="book" size="lg"/> CI Subspace</a>
    </div>
  </div>
</div>
</template>

<script>
  // import axios from 'axios'
  export default {
    name: 'landing-page',

    data: function () {
      return {
        latestRelease: ''
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
