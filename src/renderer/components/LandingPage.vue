<template>
<div class="container-fluid mx-2">
  <!-- Container -->

  <!-- Header Row -->
  <div class="row justify-content-center">
    <div class="col-sm-6">
      <vs-alert title="New Release Available" :active="outdated" color="success">
        A newer version is available to download. <a @click="$electron.shell.openExternal(releases[0].url)" class="text-primary pl-2"> Click here to view</a>
      </vs-alert>
    </div>
  </div>
  <!-- Header Row -->

  <!-- Content -->
  <div class="row text-dark">

    <!-- Newsfeed -->
    <div class="col-sm-7">
      <h1 class="mt-3 title">Latest Releases</h1>
      <hr>
      <div id="div-with-loading" class="vs-con-loading__container text-left">
        <h4>Latest Build Status: <img src="https://ci.appveyor.com/api/projects/status/da9tomaqs4tf119f?svg=true"/></h4>
        <br>
        <div v-for="(release, index) in releases" v-bind:key="index">
          <h3>Version: {{ release.version }}</h3>
          <p v-html="release.body"></p>
          <hr>
        </div>
        <div class="text-center">
          <h3><a @click="$electron.shell.openExternal('https://github.com/HarmanU/test-utility-app/releases')" class="text-info">More releases...</a></h3>
        </div>
      </div>
    </div>
    <!-- Newsfeed -->


    <!-- Quick Links -->
    <div class="col-sm-5 text-center">
      <h1 class="mt-3">Quick Links</h1>
      <vs-progress indeterminate color="success" v-if="isTyping" class="mb-2"></vs-progress>
      <hr v-if="!isTyping">
      <vs-switch ref="quickLinksEditSwitch" class="mb-2" color="dark" vs-icon-on="border_color" vs-icon-off="remove_red_eye" v-model="editQuickLinks">
        <span slot="on">Edit </span>
        <span slot="off">View </span>
      </vs-switch>

      <!-- View -->
      <vs-button color="primary" type="filled" class="w-100" @click="this.$electron.shell.openExternal('https://rimilia.atlassian.net/projects/AZCI/issues?filter=myopenissues')">
        <font-awesome-icon icon="book" size="lg"/>
        CI Subspace
       </vs-button>

      <vs-button color="primary" type="filled" class="w-100 mt-2" @click="this.$electron.shell.openExternal('https://rimilia.atlassian.net/wiki/spaces/AZURE/pages/454426652')">
        <font-awesome-icon icon="bug" size="lg"/>
        Jira
       </vs-button>

      <paginate name="quickLinks" :list="quickLinks" tag="div" :per="6">

        <vs-button color="#17a2b8" type="filled" class="w-100 mt-2" v-if="editQuickLinks == false" v-for="(link, index) in paginated('quickLinks')"
        v-bind:key="index" @click="$electron.shell.openExternal(link.url)">{{link.text}}</vs-button>
        
      </paginate>
      <paginate-links v-if="quickLinks.length > 6 && editQuickLinks == false" for="quickLinks" :show-step-links="true" :simple="{prev: '<< Back', next: 'Next >>'}" class="mt-2"></paginate-links>
      <!-- View -->

      <!-- Edit -->
      <div v-if="editQuickLinks == true" v-for="(link, index) in quickLinks" v-bind:key="link.id">
        <div class="row">
          <div class="col-sm-2 mt-3">
            <button @click="moveLink(index, index - 1); isTyping = true" :disabled="index == 0"><font-awesome-icon icon="arrow-up" size="sm"/></button>
            <button @click="moveLink(index, index + 1); isTyping = true" :disabled="index == (quickLinks.length - 1)"><font-awesome-icon icon="arrow-down" size="sm" /></button>
          </div>
          <div class="col-sm-4">
            <vs-input class="w-100" label-placeholder="Text" @input="isTyping = true" v-model="link.text"/>
          </div>
          <div class="col-sm-4">
            <vs-input class="w-100" label-placeholder="Url" @input="isTyping = true" v-model="link.url"/>
          </div>
          <div class="col-sm-2 mt-3">
            <a @click="removeLink(index); isTyping = true" class="text-white btn btn-block btn-danger"><font-awesome-icon icon="trash" size="lg" /></a>
          </div>
        </div>
      </div>



      <!-- Add new -->
      <div v-if="editQuickLinks == true" class="row">
          <div class="col-sm-5">
            <vs-input class="w-100" label-placeholder="Text" :vs-danger="newLink.textInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.text"/>
          </div>
          <div class="col-sm-5">
            <vs-input class="w-100" label-placeholder="Url" :vs-danger="newLink.urlInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.url"/>
          </div>
          <div class="col-sm-2 mt-3">
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
  import _ from 'lodash'
  var log = require('electron-log')
  var showdown = require('showdown')
  var converter = new showdown.Converter()
  converter.getOptions().headerLevelStart = 4
  export default {
    name: 'landing-page',

    data: function () {
      return {
        releases: [],
        editQuickLinks: false,
        newLink: {
          id: 0,
          text: '',
          url: '',
          textInvalid: false,
          urlInvalid: false
        },
        localQuickLinks: [],
        paginate: ['quickLinks'],
        outdated: false
      }
    },

    computed: {
      quickLinks: {
        get () {
          return this.$store.state.quickLinks
        },
        set (value) {
          this.$store.commit('setQuickLinks', value)
        }
      },
      isTyping: {
        get () {
          return this.$store.state.changingQuickLinks
        },
        set (value) {
          this.$store.commit('setChangeQuickLinks', value)
        }
      }
    },

    watch: {
      quickLinks: {
        handler: _.debounce(function () {
          this.isTyping = false
        }, 2000),
        deep: true
      },
      isTyping (val) {
        if (!val) {
          this.$vs.notify({
            title: 'Changes Saved',
            color: 'success',
            icon: 'save',
            position: this.$store.state.settings.notifPos,
            time: 3000
          })
        }
      }
    },

    methods: {
      moveLink (from, to) {
        this.quickLinks.splice(to, 0, this.quickLinks.splice(from, 1)[0])
        for (let i = 0; i < this.quickLinks.length; i++) {
          this.quickLinks[i].id = i + 1
        }
      },
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
          this.localQuickLinks.push({
            id: this.localQuickLinks.length + 1,
            text: this.newLink.text,
            url: this.newLink.url
          })

          this.quickLinks = this.localQuickLinks
          this.newLink.text = ''
          this.newLink.url = ''
        }
      },

      removeLink (index) {
        this.localQuickLinks.splice(index, 1)
        this.quickLinks = this.localQuickLinks
      },
      getLatestReleaseBody () {
        this.$vs.loading({
          color: '#000',
          container: '#div-with-loading',
          scale: 0.45
        })
        axios({
          method: 'get',
          url: 'https://api.github.com/repos/HarmanU/test-utility-app/releases'
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
        let appVersion = window.require('electron').remote.app.getVersion().replace(/\./g, '')
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
.sorting-buttons {
  background-color: rgb(31,116,255);
  color: white !important;
  border-radius: 5px;
  padding: 4px;
}
</style>

<style lang="scss">
ul.paginate-links {
  user-select: none;
  a {
    cursor: pointer;
    background-color: #008ff9;
    padding: 4px;
    padding-bottom: 6px;
    border-radius: 4px;
  }
  li {
    display:inline;
    color: white;
  }
  li.active a {
    font-weight: bold;
    color: white;
  }
  li.next:before {
    content: ' | ';
    font-size: 25px;
    color: #303030;
  }
  li.disabled a {
    color: rgb(238, 238, 238);
    background-color: #41adff;
    cursor: no-drop;
  }
}
</style>

