import Vue from 'vue'
import Vuesax from 'vuesax'
import axios from 'axios'

import App from './App'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'material-icons/iconfont/material-icons.css'
import 'vuesax/dist/vuesax.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBook, faBug, faPlus, faTrash, faClipboardList, faHome, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faBook, faBug, faPlus, faTrash, faClipboardList, faHome, faEllipsisH)

const {dialog, shell} = require('electron').remote
var fs = require('fs')

window.$ = require('jquery')
window.popper = require('popper.js')
window.Bootstrap = require('bootstrap')

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// Plugins
Vue.use(Vuesax)

// Components
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('test-item', './components/TestItem.vue')
Vue.component('jira-wiki-editor', './components/JiraWikiEditor.vue')

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>',

  methods: {
    /**
     * Will begin the download of a file
     * @param {string} filename name of file
     * @param {string} content content of file
     */
    exportFile (filename, content) {
      dialog.showSaveDialog({
        defaultPath: filename
      }, (fileName) => {
        if (fileName === undefined) {
          console.log("You didn't save the file")
          return
        }

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, content, (err) => {
          if (err) {
            this.$vs.notify({
              title: 'Error!',
              text: `An error ocurred creating the file: ${err.message}`,
              color: 'danger',
              icon: 'error_outline',
              position: 'top-center',
              time: 4000
            })
          } else {
            this.$vs.notify({
              title: 'File Exported!',
              text: `File "${filename}" was exported successfully`,
              color: 'success',
              icon: 'save',
              position: 'top-center',
              time: 10000
            })
            setTimeout(shell.showItemInFolder(fileName), 3000)
          }
        })
      })
    }
  }
}).$mount('#app')
