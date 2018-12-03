<template>
    <div>
      <vs-progress indeterminate color="success" v-if="isTyping" class="mb-2"></vs-progress>
      <hr v-if="!isTyping">
      <vs-switch ref="quickLinksEditSwitch" class="mb-2" color="dark" vs-icon-on="border_color" vs-icon-off="remove_red_eye" v-model="editQuickLinks" @input="$emit('change-state', editQuickLinks)">
        <span slot="on">Edit </span>
        <span slot="off">View </span>
      </vs-switch>

      <!-- View -->
      <paginate-links v-if="quickLinks.length > 8 && editQuickLinks == false" for="quickLinks" :show-step-links="true" :simple="{prev: '<< Back', next: 'Next >>'}" class="mt-2"></paginate-links>
      
      <paginate refs="quickLinks" name="quickLinks" :list="quickLinks" tag="div" :per="8">

        <vs-button :color="link.colour" type="filled" class="w-100 mt-2" :class="textColour(link.colour)" v-if="editQuickLinks == false" v-for="(link, index) in paginated('quickLinks')"
        v-bind:key="index" @click="runLinks(link.url)">{{link.text}}</vs-button>
        
      </paginate>
      <!-- View -->

      <!-- Edit -->
      <div v-if="editQuickLinks == true" v-for="(link, index) in quickLinks" v-bind:key="link.id">

        <vs-row>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <button @click="moveLink(index, index - 1); isTyping = true" :disabled="index == 0" class="mt-3"><font-awesome-icon icon="arrow-up" size="sm"/></button>
            <button @click="moveLink(index, index + 1); isTyping = true" :disabled="index == (quickLinks.length - 1)" class="mt-3"><font-awesome-icon icon="arrow-down" size="sm" /></button>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input style="width: 90%;" label-placeholder="Text" @input="isTyping = true" v-model="link.text"/>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input style="width: 90%;" label-placeholder="Url" @input="isTyping = true" v-model="link.url"/>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <input type="color" v-model="link.colour" @input="isTyping = true" class="mt-3"/>
            <vs-tooltip text="Copy Colour Code">
              <a @click="copyColour(link.colour)"><font-awesome-icon icon="copy" size="lg" class="mt-3 ml-2"/></a>
            </vs-tooltip>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <vs-tooltip text="Export Link">
              <vs-button color="primary" type="filled" @click="exportLink(index);" class="mt-3"><font-awesome-icon icon="file-export" size="lg" /></vs-button>
            </vs-tooltip>
          </vs-col>

          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
            <vs-button color="danger" type="filled" @click="removeLink(index); isTyping = true" class="mt-3"><font-awesome-icon icon="trash" size="lg" /></vs-button>
          </vs-col>

        </vs-row>
      </div>



      <!-- Add new -->
      <vs-row v-if="editQuickLinks == true">

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <p class="mt-3">{{ quickLinks.length }}/32</p>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
          <vs-input style="width: 90%;" label-placeholder="Text" :vs-danger="newLink.textInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.text"/>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
          <vs-input style="width: 90%;" label-placeholder="Url" :vs-danger="newLink.urlInvalid" vs-danger-text="Cannot be Empty" v-model="newLink.url"/>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <input type="color" v-model="newLink.colour" @input="isTyping = true" class="mt-3"/>
          <vs-tooltip text="Paste Colour Code">
            <a @click="pasteColour()"><font-awesome-icon icon="paste" size="lg" class="mt-3 ml-2"/></a>
          </vs-tooltip>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <vs-tooltip text="Import Link">
            <vs-button color="primary" type="filled" @click="importLink(); isTyping = true" class="mt-3"><font-awesome-icon icon="file-import" size="lg" /></vs-button>
          </vs-tooltip>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="1" >
          <vs-tooltip text="Add Link">
            <vs-button color="success" type="filled" @click="addLink();" class="mt-3"><font-awesome-icon icon="plus" size="lg" /></vs-button>
          </vs-tooltip>
        </vs-col>

      </vs-row>
      <!-- Add new -->

      <!-- Edit -->
    </div>
</template>

<script>
  import _ from 'lodash'
  const {dialog, shell} = require('electron').remote
  const { clipboard } = require('electron')
  var fs = require('fs')

  export default {
    name: 'quick-links',

    data: function () {
      return {
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
        paginate: ['quickLinks']
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
      copyColour (colour) {
        clipboard.writeText(colour)
        this.$vs.notify({
          title: 'Colour Copied',
          text: `Colour code ${colour} has been copied to your clipboard`,
          color: 'success',
          position: this.$store.state.settings.notifPos,
          time: 5000
        })
      },
      pasteColour () {
        this.newLink.colour = clipboard.readText()
      },
      moveLink (from, to) {
        this.quickLinks.splice(to, 0, this.quickLinks.splice(from, 1)[0])
        for (let i = 0; i < this.quickLinks.length; i++) {
          this.quickLinks[i].id = i + 1
        }
      },
      addLink () {
        let valid = true

        if (this.quickLinks.length >= 32) {
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

        return brightness > 123 ? 'text-dark border' : 'text-white'
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
                url: item.url,
                colour: item.colour
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
      }
    },

    mounted () {
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
    // background-color: #008ff9;
    padding: 4px;
    padding-bottom: 6px;
    border-radius: 4px;
  }
  li {
    display:inline;
    color: black;
  }
  li.active a {
    font-weight: bold;
    color: black;
  }
  li.next:before {
    content: ' | ';
    font-size: 25px;
    color: #303030;
  }
  li.disabled a {
    color: rgb(238, 238, 238);
    // background-color: #41adff;
    cursor: no-drop;
  }
}
</style>
