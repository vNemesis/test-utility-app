import Vue from 'vue'
import Vuesax from 'vuesax'
import Vuex from 'vuex'
import VueHighlightJS from 'vue-highlight.js'
import 'es6-promise/auto'
import VuePaginate from 'vue-paginate'
import VueShortKey from 'vue-shortkey'
import VueEditor from 'vue2-editor'

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
import {
  faBook,
  faBug,
  faPlus,
  faTrash,
  faHome,
  faEllipsisH,
  faListUl,
  faListOl,
  faArrowDown,
  faArrowUp,
  faEdit,
  faClone,
  faAlignLeft,
  faFileExport,
  faFileImport,
  faCopy,
  faPaste
} from '@fortawesome/free-solid-svg-icons'

import {
  faJira,
  faConfluence
} from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faBook, faBug, faPlus, faTrash, faHome, faEllipsisH, faListUl, faListOl, faArrowDown, faArrowUp, faEdit,
  faClone, faAlignLeft, faFileExport, faFileImport, faCopy, faPaste, faJira, faConfluence)

// Load Plugins
const remote = require('electron').remote
const { clipboard } = require('electron')
var log = require('electron-log/main')
var fs = require('fs')
var _ = require('lodash')
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
fs.writeFile(`${remote.app.getPath('userData')}/log.log`, '', { flag: 'wx' }, function (err) {
  if (err) {
  }
}
)

// Config Storage
const EStore = require('electron-store')

const defaultSettings = {
  settings: {
    editor: {
      autoLine: false,
      showEditor: false,
      showGherkinPreview: false
    },
    planCreator: {
      defaultAssignee: '',
      defaultPlanExportDir: '',
      jiraNewLine: false,
      jiraNewLineAmount: 50
    },
    jiraCardExport: {
      template: '',
      htmlTemplate: `
      <h2 class="card-title" :class="cardColour(issue.type.id)">{{ issue.key }}</h2>
      <h3 class="card-subtitle mb-2 text-muted">{{ issue.title }}</h3>
      <h5 class="mt-2">Story Points: {{ issue.storyPoints }}</h5>
      <h3><span class="badge badge-secondary">{{ issue.epic }}</span></h3>`,
      useHtml: true
    },
    api: {
      vstsPAT: '',
      jiraUsername: '',
      jiraToken: ''
    },
    notifPos: 'bottom-right',
    theme: {
      primary: '#1f74ff',
      darkMode: false
    },
    allowDevTools: false,
    autoOpenOnExport: true
  },
  quickLinks: [
    {
      id: 1,
      text: 'Example Website Bookmark',
      url: 'www.google.co.uk',
      colour: '#51d5ef'
    },
    { id: 2, text: 'Example Local Bookmark', url: 'c://', colour: '#51d5ef' }
  ]
}

const appStore = new EStore({
  defaults: defaultSettings
})

// config checks, will create config settings if they are missing
const keyify = (obj, prefix = '') =>
  Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...keyify(obj[el], prefix + el + '.')]
    } else {
      return [...res, prefix + el]
    }
  }, [])

keyify(defaultSettings).forEach(element => {
  if (appStore.has(element) === false) {
    appStore.set(element, _.get(defaultSettings, element))
  }
})

const testPlanStore = new EStore({
  name: 'testPlans'
})

// Open dev tools if the option is enabled
if (appStore.get('settings.allowDevTools') === true) {
  remote.getCurrentWindow().toggleDevTools()
}

// Vue Plugins
Vue.use(Vuesax, {
  theme: {
    colors: {
      primary: appStore.get('settings.theme.primary')
    }
  }
})

Vue.use(VueEditor)
Vue.use(Vuex)
Vue.use(VueHighlightJS)
Vue.use(VuePaginate)
Vue.use(VueShortKey)

// Vue Components
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('test-item', './components/TestItem.vue')
Vue.component('payment-item', './components/FileCreator/PaymentItem.vue')
Vue.component('quick-links', './components/LandingPage/QuickLinks.vue')

const store = new Vuex.Store({
  state: {
    settings: {
      editor: {
        autoLine: false,
        showEditor: false,
        showGherkinPreview: false
      },
      planCreator: {
        defaultAssignee: '',
        defaultPlanExportDir: '',
        jiraNewLine: false,
        jiraNewLineAmount: 50
      },
      jiraCardExport: {
        template: '',
        htmlTemplate: `
        <h2 class="card-title" :class="cardColour(issue.type.id)">{{ issue.key }}</h2>
        <h3 class="card-subtitle mb-2 text-muted">{{ issue.title }}</h3>
        <h5 class="mt-2">Story Points: {{ issue.storyPoints }}</h5>
        <h3><span class="badge badge-secondary">{{ issue.epic }}</span></h3>`,
        useHtml: true
      },
      api: {
        vstsPAT: '',
        jiraUsername: '',
        jiraToken: ''
      },
      notifPos: 'bottom-right',
      theme: {
        primary: '#1f74ff',
        darkMode: false
      },
      autoOpenOnExport: true
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
store.state.settings = appStore.get('settings')
store.state.quickLinks = appStore.get('quickLinks')

if ((fs.statSync(`${remote.app.getPath('userData')}/log.log`).size / 1000000.0) > 4) {
  fs.truncate(`${remote.app.getPath('userData')}/log.log`, 0)
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
    openConfig () {
      appStore.openInEditor()
    },
    resetSettings () {
      appStore.store = _.cloneDeep(defaultSettings)
      remote.app.relaunch()
      remote.app.exit(0)
    },
    refreshTheme () {
      this.$vs.theme({
        primary: appStore.store.settings.theme.primary
      })
    },
    copyToClipboard (content, message) {
      clipboard.writeText(content)
      this.$vs.notify({
        title: 'Copied to clipboard',
        text: message,
        color: 'success',
        position: this.$store.state.settings.notifPos,
        time: 4000
      })
    },
    pasteFromClipboard () {
      this.$vs.notify({
        title: 'Pasted text from clipboard',
        color: 'success',
        position: this.$store.state.settings.notifPos,
        time: 4000
      })
      return clipboard.readText()
    },
    exportToPdf (html) {
      let win = new remote.BrowserWindow({
        width: 1280,
        height: 720
      })
      win.loadURL(`data:text/html;charset=UTF-8,${html}`)

      win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS('div { page-break-before: avoid; }')
        win.webContents.printToPDF({
          marginsType: 1
        }, (err, data) => {
          if (err) {
            this.$vs.notify({
              title: 'An unknown error occured',
              color: 'danger',
              position: this.$store.state.settings.notifPos,
              time: 4000
            })
            return
          }

          this.exportFile(`Jira Tickets - ${new Date(Date.now()).toISOString().substring(0, 10)}.pdf`, data, 'PDF File', 'pdf')
        })
      })
    },
    /**
     * Will begin the download of a file
     * @param {string} filename name of file
     * @param {string} content content of file
     */
    exportFile (filename, content, extensionName, extension) {
      let path = remote.dialog.showSaveDialog({
        title: `Export ${extension} file`,
        filters: [{
          name: extensionName,
          extensions: [extension]
        }],
        defaultPath: filename,
        buttonLabel: 'Export'
      })

      if (!path) {
        return
      }

      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(path, content, (err) => {
        if (err && err.code === 'EBUSY') {
          this.$vs.notify({
            title: 'Error!',
            text: 'File is locaked or in use. please ensure the file is not open in another program and try again.',
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 4000,
            click: () => { remote.shell.showItemInFolder(err.path) }
          })
        } else if (err) {
          this.$vs.notify({
            title: 'Error!',
            text: `An error ocurred creating the file: ${err.message}`,
            color: 'danger',
            position: this.$store.state.settings.notifPos,
            time: 4000
          })
        } else {
          this.$vs.notify({
            title: 'File Exported!',
            text: `File was exported successfully`,
            color: 'success',
            position: this.$store.state.settings.notifPos,
            time: 10000,
            click: () => { remote.shell.showItemInFolder(path) }
          })
          if (this.$store.state.settings.autoOpenOnExport) {
            setTimeout(remote.shell.showItemInFolder(path), 3000)
          }
        }
      })
    }
  }
}).$mount('#app')
