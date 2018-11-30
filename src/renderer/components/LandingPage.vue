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
    <div :class="editQuickLinks ? 'col-sm-6' : 'col-sm-9'">
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
    <div :class="editQuickLinks ? 'col-sm-6' : 'col-sm-3'" class="text-center">
      <h1 class="mt-3">Quick Links</h1>
      <vs-progress indeterminate color="success" v-if="isTyping" class="mb-2"></vs-progress>
      <hr v-if="!isTyping">
      <vs-switch ref="quickLinksEditSwitch" class="mb-2" color="dark" vs-icon-on="border_color" vs-icon-off="remove_red_eye" v-model="editQuickLinks">
        <span slot="on">Edit </span>
        <span slot="off">View </span>
      </vs-switch>

      <!-- View -->
      <paginate name="quickLinks" :list="quickLinks" tag="div" :per="6">

        <vs-button :color="link.colour" type="filled" class="w-100 mt-2" :class="textColour(link.colour)" v-if="editQuickLinks == false" v-for="(link, index) in paginated('quickLinks')"
        v-bind:key="index" @click="runLinks(link.url)">{{link.text}}</vs-button>
        
      </paginate>
      <paginate-links v-if="quickLinks.length > 6 && editQuickLinks == false" for="quickLinks" :show-step-links="true" :simple="{prev: '<< Back', next: 'Next >>'}" class="mt-2"></paginate-links>
      <!-- View -->

      <!-- Edit -->
      <div v-if="editQuickLinks == true" v-for="(link, index) in quickLinks" v-bind:key="link.id">

        <vs-row>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <button @click="moveLink(index, index - 1); isTyping = true" :disabled="index == 0"><font-awesome-icon icon="arrow-up" size="sm"/></button>
            <button @click="moveLink(index, index + 1); isTyping = true" :disabled="index == (quickLinks.length - 1)"><font-awesome-icon icon="arrow-down" size="sm" /></button>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input style="width: 90%;" label-placeholder="Text" @input="isTyping = true" v-model="link.text"/>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input style="width: 90%;" label-placeholder="Url" @input="isTyping = true" v-model="link.url"/>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <input type="color" v-model="link.colour" @input="isTyping = true" class="mt-2"/>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <vs-tooltip text="Export Link">
              <vs-button color="primary" type="filled" @click="exportLink(index);"><font-awesome-icon icon="file-export" size="lg" /></vs-button>
            </vs-tooltip>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <vs-button color="danger" type="filled" @click="removeLink(index); isTyping = true"><font-awesome-icon icon="trash" size="lg" /></vs-button>
          </vs-col>

        </vs-row>
      </div>



      <!-- Add new -->
      <vs-row v-if="editQuickLinks == true">

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <p>{{ quickLinks.length }}/24</p>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
          <vs-input style="width: 90%;" label-placeholder="Text" :vs-danger="newLink.textInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.text"/>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
          <vs-input style="width: 90%;" label-placeholder="Url" :vs-danger="newLink.urlInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.url"/>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <input type="color" v-model="newLink.colour" @input="isTyping = true" class="mt-2"/>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <vs-tooltip text="Import Link">
            <vs-button color="primary" type="filled" @click="importLink(); isTyping = true"><font-awesome-icon icon="file-import" size="lg" /></vs-button>
          </vs-tooltip>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <vs-tooltip text="Add Link">
            <vs-button color="success" type="filled" @click="addLink();"><font-awesome-icon icon="plus" size="lg" /></vs-button>
          </vs-tooltip>
        </vs-col>

      </vs-row>
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
  const {dialog, shell} = require('electron').remote
  var fs = require('fs')

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
          colour: '#51d5ef',
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
            // icon: 'save',
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

        if (this.quickLinks.length >= 24) {
          this.$vs.notify({
            title: 'Limit Reached',
            text: 'You cannot add anymore quick links, please change/remove some to add a new one',
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 5000
          })
          return
        }

        this.isTyping = true

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
            url: this.newLink.url,
            colour: this.newLink.colour
          })

          this.quickLinks = this.localQuickLinks
          this.newLink.text = ''
          this.newLink.url = ''
          this.newLink.colour = '#51d5ef'
        }
      },
      textColour (hex) {
        let rgb = this.hexToRgb(hex)

        let brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000

        return brightness > 123 ? 'text-dark' : 'text-white'
      },

      hexToRgb (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
          return r + r + g + g + b + b
        })

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      },

      removeLink (index) {
        this.localQuickLinks.splice(index, 1)
        this.quickLinks = this.localQuickLinks
      },
      exportLink (index) {
        let item = this.localQuickLinks[index]
        let jsonContent = JSON.stringify(item)
        this.$root.exportFile(`${item.text}.json`, jsonContent, 'JSON File', 'json')
      },
      importLink () {
        dialog.showOpenDialog({
          filters: [
            { name: 'JSON File', extensions: ['json'] }
          ]
        },
        (fileName) => {
          // fileNames is an array that contains all the selected
          if (fileName === undefined) {
            return
          }

          fs.readFile(fileName[0], 'utf-8', (err, data) => {
            if (err) {
              this.$vs.notify({
                title: 'Error!',
                text: `An error ocurred creating the file: ${err.message}`,
                color: 'danger',
                // icon: 'error_outline',
                position: this.$store.state.settings.notifPos,
                time: 4000
              })
            } else {
              this.$vs.notify({
                title: 'File Imported!',
                text: `File "${fileName[0]}" was imported successfully`,
                color: 'success',
                // icon: 'publish',
                position: this.$store.state.settings.notifPos,
                time: 4000
              })

              let item = JSON.parse(data)

              this.localQuickLinks.push({
                id: this.localQuickLinks.length + 1,
                text: item.text,
                url: item.url
              })

              this.quickLinks = this.localQuickLinks
            }
          })
        })
      },
      runLinks (link) {
        let links = link.split(';')
        links.forEach(element => {
          shell.openExternal(element.trim())
        })
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

