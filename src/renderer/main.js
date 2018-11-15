import Vue from 'vue'
import Vuesax from 'vuesax'
import Vuex from 'vuex'
import VueHighlightJS from 'vue-highlight.js'
import 'es6-promise/auto'
import VuePaginate from 'vue-paginate'

import axios from 'axios'

import App from './App'
import router from './router'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import 'material-icons/iconfont/material-icons.css'
import 'vuesax/dist/vuesax.css'
import 'highlight.js/styles/default.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBook, faBug, faPlus, faTrash, faHome, faEllipsisH, faListUl, faListOl, faArrowDown, faArrowUp, faEdit, faClone, faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faBook, faBug, faPlus, faTrash, faHome, faEllipsisH, faListUl, faListOl, faArrowDown, faArrowUp, faEdit, faClone, faAlignLeft)

// Load Plugins
const {dialog, shell, app} = require('electron').remote
var log = require('electron-log/main')
var fs = require('fs')
window.$ = require('jquery')
window.popper = require('popper.js')
window.Bootstrap = require('bootstrap')
const username = require('username')
// const path = require('path')

// shell.openItem(path.join(__dirname, 'test.docx'))

// Init
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// Will create log file if it doesn't exist
fs.writeFile(`${app.getPath('userData')}/log.log`, '', { flag: 'wx' }, function (err) {
  if (err) {
  }
}
)

// Config Storage
const EStore = require('electron-store')
const appStore = new EStore({
  defaults: {
    settings: {
      editor: {
        autoLine: false,
        showEditor: false
      },
      planCreator: {
        defaultAssignee: '',
        defaultPlanExportDir: '',
        jiraNewLine: false,
        jiraNewLineAmount: ''
      },
      notifPos: 'bottom-right',
      theme: {
        primary: '#1f74ff',
        darkMode: false
      }
    },
    quickLinks: [
      { text: 'Example Website Bookmark', url: 'www.google.co.uk' },
      { text: 'Example Local Bookmark', url: 'c://' }
    ]
  }
})

const testPlanStore = new EStore({
  name: 'testPlans'
})

// Vue Plugins
Vue.use(Vuesax, {
  theme: {
    colors: {
      primary: appStore.store.settings.theme.primary
    }
  }
})

Vue.use(Vuex)
Vue.use(VueHighlightJS)
Vue.use(VuePaginate)

// Vue Components
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('test-item', './components/TestItem.vue')
Vue.component('jira-wiki-editor', './components/JiraWikiEditor.vue')

const store = new Vuex.Store({
  state: {
    settings: {
      editor: {
        autoLine: false,
        showEditor: false
      },
      planCreator: {
        defaultAssignee: '',
        defaultPlanExportDir: '',
        jiraNewLine: false,
        jiraNewLineAmount: ''
      },
      notifPos: 'bottom-right',
      theme: {
        primary: '#1f74ff',
        darkMode: false
      }
    },
    changingConfig: false,
    changingQuickLinks: false,
    username: username.sync(),
    quickLinks: []
  },
  mutations: {
    setSettings (state, newSettings) {
      state.settings = newSettings
    },
    setQuickLinks (state, newQuickLinks) {
      state.quickLinks = newQuickLinks
    },
    setChangeConfig (state, bool) {
      state.changingConfig = bool
      if (!bool) {
        appStore.set('settings', state.settings)
      }
    },
    setChangeQuickLinks (state, bool) {
      state.changingQuickLinks = bool
      if (!bool) {
        appStore.set('quickLinks', state.quickLinks)
      }
    }
  }
})

console.log = function () {
  log.info(arguments)
}

console.error = function () {
  log.error(arguments)
}

console.warn = function () {
  log.warn(arguments)
}

// Load Settings
store.state.settings = appStore.store.settings
store.state.quickLinks = appStore.store.quickLinks

if ((fs.statSync(`${app.getPath('userData')}/log.log`).size / 1000000.0) > 4) {
  fs.truncate(`${app.getPath('userData')}/log.log`, 0)
}

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',

  methods: {
    saveTestPlan (id, content) {
      testPlanStore.set(id, content)
    },
    getTestPlans () {
      return testPlanStore.store
    },
    getTestPlan (key) {
      return testPlanStore.get(key, {})
    },
    deleteTestPlan (key) {
      return testPlanStore.delete(key)
    },
    /**
     * Will begin the download of a file
     * @param {string} filename name of file
     * @param {string} content content of file
     */
    exportFile (filename, content, extensionName, extension) {
      dialog.showSaveDialog({
        filters: [{
          name: extensionName,
          extensions: [extension]
        }],
        defaultPath: filename
      }, (fileName) => {
        if (fileName === undefined) {
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
              position: appStore.settings.notifPos,
              time: 4000
            })
          } else {
            this.$vs.notify({
              title: 'File Exported!',
              text: `File '${filename}' was exported successfully`,
              color: 'success',
              icon: 'save',
              position: appStore.settings.notifPos,
              time: 10000
            })
            setTimeout(shell.showItemInFolder(fileName), 3000)
          }
        })
      })
    },
    openConfig () {
      appStore.openInEditor()
    },
    resetSettings () {
      appStore.store = {
        settings: {
          editor: {
            autoLine: false,
            showEditor: false
          },
          planCreator: {
            defaultAssignee: '',
            defaultPlanExportDir: '',
            jiraNewLine: false,
            jiraNewLineAmount: ''
          },
          notifPos: 'bottom-right',
          theme: {
            primary: '#1f74ff',
            darkMode: false
          }
        },
        quickLinks: [
          { text: 'Example Website Bookmark', url: 'www.google.co.uk' },
          { text: 'Example Local Bookmark', url: 'c://' }
        ]
      }
      app.relaunch()
      app.exit(0)
    },
    refreshTheme () {
      this.$vs.theme({
        primary: appStore.store.settings.theme.primary
      })
    }
  }
}).$mount('#app')
