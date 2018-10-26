<template>
<div class="container-fluid mx-2">
  <!-- Container -->

  <!-- Header Row -->
  <div class="row justify-content-center">
    <div class="col-sm-6">
      <vs-alert title="New Release Available" :active="outdated" color="success">
        A newer version is available to download. <a @click="$electron.shell.openExternal(releaseUrl)" class="text-primary pl-2"> Click here to view</a>
      </vs-alert>
    </div>
  </div>
  <!-- Header Row -->

  <!-- Content -->
  <div class="row">

    <!-- Newsfeed -->
    <div class="col-sm-8">
      <h1 class="mt-3">Newsfeed</h1>
      <hr>
      <div id="div-with-loading" class="vs-con-loading__container text-left">
        <h4>Build Status: <img src="https://ci.appveyor.com/api/projects/status/da9tomaqs4tf119f?svg=true"/></h4>
        <h3>Latest Release: {{ latestRelease }}</h3>
        <p v-html="latestReleaseBody"></p>
      </div>
    </div>
    <!-- Newsfeed -->


    <!-- Quick Links -->
    <div class="col-sm-4 text-center">
      <h1 class="mt-3">Quick Links</h1>
      <hr>
      <vs-switch class="mb-2" color="dark" vs-icon-on="border_color" vs-icon-off="remove_red_eye" v-model="editQuickLinks">
        <span slot="on">Edit </span>
        <span slot="off">View </span>
      </vs-switch>

      <!-- View -->
      <div class="btn-group-vertical w-100">
        <a class="text-white btn btn-block btn-primary" @click="this.$electron.shell.openExternal('https://rimilia.atlassian.net/projects/AZCI/issues?filter=myopenissues')"><font-awesome-icon icon="bug" size="lg"/> Jira</a>
        <a class="text-white btn btn-block btn-primary mt-2" @click="this.$electron.shell.openExternal('https://rimilia.atlassian.net/wiki/spaces/AZURE/pages/454426652')"><font-awesome-icon icon="book" size="lg"/> CI Subspace</a>
        <a class="text-white btn btn-block btn-info mt-2" v-if="editQuickLinks == false" v-for="(link, index) in quickLinks" v-bind:key="index" @click="$electron.shell.openExternal(link.url)">{{link.text}}</a>
      </div>
      <!-- View -->

      <!-- Edit -->
      <div v-if="editQuickLinks == true" v-for="(link, index) in quickLinks" v-bind:key="index">
        <div class="row">
          <div class="col-sm-5">
            <vs-input class="w-100" vs-label-placeholder="Text" v-model="link.text"/>
          </div>
          <div class="col-sm-5">
            <vs-input class="w-100" vs-label-placeholder="Url" v-model="link.url"/>
          </div>
          <div class="col-sm-2 mt-3">
            <!-- <vs-button color="success" vs-type="filled" vs-icon="add" @click="addLink()"></vs-button> -->
            <a @click="removeLink(index)" class="text-white btn btn-block btn-danger"><font-awesome-icon icon="trash" size="lg" /></a>
          </div>
        </div>
      </div>

      <!-- Add new -->
      <div v-if="editQuickLinks == true" class="row">
          <div class="col-sm-5">
            <vs-input class="w-100" vs-label-placeholder="Text" :vs-danger="newLink.textInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.text"/>
          </div>
          <div class="col-sm-5">
            <vs-input class="w-100" vs-label-placeholder="Url" :vs-danger="newLink.urlInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.url"/>
          </div>
          <div class="col-sm-2 mt-3">
            <!-- <vs-button color="success" vs-type="filled" vs-icon="add" @click="addLink()"></vs-button> -->
            <a @click="addLink()" class="text-white btn btn-block btn-success"><font-awesome-icon icon="plus" size="lg" /></a>
          </div>
      </div>
      <!-- Add new -->

      <!-- Edit -->
    </div>
    <!-- Quick Links -->

  </div>
  <!-- Content -->

  <!-- Container -->
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
        latestRelease: '',
        releaseUrl: '',
        editQuickLinks: false,
        newLink: {
          text: '',
          url: '',
          textInvalid: false,
          urlInvalid: false
        },
        quickLinks: [
        ]
      }
    },

    computed: {
      outdated () {
        let appVersion = window.require('electron').remote.app.getVersion().replace(/\./g, '')
        let releaseVersion = this.latestRelease.substring(1).replace(/\./g, '')

        return releaseVersion > appVersion
      }
    },

    methods: {
      addLink () {
        let valid = true

        if (this.newLink.text === '') {
          this.newLink.textInvalid = true
          valid = false
        } else {
          this.newLink.textInvalid = false
        }

        if (this.newLink.url === '') {
          this.newLink.urlInvalid = true
          valid = false
        } else {
          this.newLink.urlInvalid = false
        }

        if (valid) {
          this.quickLinks.push({
            text: this.newLink.text,
            url: this.newLink.url
          })
          this.newLink.text = ''
          this.newLink.url = ''
        }
      },

      removeLink (index) {
        this.quickLinks.splice(index, 1)
        for (let i = 0; i < this.quickLinks.length; i++) {
          this.quickLinks[i].id = i + 1
        }
      },
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
            this.releaseUrl = Response.data.html_url
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
