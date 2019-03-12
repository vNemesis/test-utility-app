<template>
  <div id="app" :class="this.$store.state.settings.theme.darkMode === true ? 'dark-mode' : ''">
    <span v-shortkey="['ctrl', 'meta']" @shortkey="active = !active"></span>
    <vs-alert title="Development Build" :active="isDevelopmentBuild" color="danger">
      Development build, somethings may be broken or not finished!
    </vs-alert>
    <!-- Side Menu -->
    <div id="parentx" :class="this.$store.state.settings.theme.darkMode === true ? 'dark-mode-side-menu' : ''">
      <vs-sidebar ref="sidemenu" parent="#parentx" default-index="1"  color="primary" class="sidebarx" spacer v-model="active">

        <div class="header-sidebar" slot="header">
          <h4>{{name}}</h4>

          <div class="mt-2">
            Welcome, {{ this.$store.state.username.replace('.', ' ') }}
          </div>
        </div>
        
        <vs-sidebar-item index="1" icon="home" @click="navigate('/')">
          Home
        </vs-sidebar-item>

        <vs-sidebar-item index="2" icon="view_list" @click="navigate('/testplancreator')">
          Test Plan Creator
        </vs-sidebar-item>

        <vs-sidebar-item index="3" icon="text_format" @click="navigate('/formatter')">
          Text Formatter
        </vs-sidebar-item>

        <vs-sidebar-item index="4" icon="create" @click="navigate('/filecreator')">
          File Creator <small class="ml-1 mb-2 text-primary">Beta</small>
        </vs-sidebar-item>

        <vs-sidebar-item index="5" icon="donut_large" @click="navigate('/citests')">
          CI Test Analyser <small class="ml-1 mb-2 text-primary">Beta</small>
        </vs-sidebar-item>

        <vs-sidebar-item index="6" icon="settings" @click="navigate('/settings')">
          Settings
        </vs-sidebar-item>

        <div class="footer-sidebar ml-1" slot="footer">
          <div>v{{ version }}</div>
        </div>
      </vs-sidebar>
    </div>
    <!-- Side Menu -->

    <vs-navbar type="gradient" v-model="activeItem" class="nabarx">

      <div slot="title">
        <vs-button @click="onOpenMenu" type="flat" vs-radius="50%"  icon="menu">Menu</vs-button>
        <h5 class="mt-2 ml-3 float-left">| {{ pageLoadedName }}</h5>
      </div>

      <vs-navbar-item index="1">
        <a @click="onOpenUrl('https://rimilia.atlassian.net/projects/AZCI/issues?filter=myopenissues')" class="nav-bar-link"><font-awesome-icon icon="book" size="lg"/> Jira</a>
      </vs-navbar-item>

      <vs-navbar-item index="2">
        <a @click="onOpenUrl('https://rimilia.atlassian.net/wiki/spaces/AZURE/pages/454426652')" class="nav-bar-link"><font-awesome-icon icon="book" size="lg"/> CI Subspace</a>
      </vs-navbar-item>

      |

      <vs-navbar-item index="3">
        <a @click="onOpenUrl('https://github.com/HarmanU/test-utility-app/issues')" class="nav-bar-link text-danger"><font-awesome-icon icon="bug" size="lg"/> Report Issue</a>
      </vs-navbar-item>
    </vs-navbar>

    <!-- Content -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <router-view v-on:open-menu="onOpenMenu" v-on:open-url="onOpenUrl" :class="this.$store.state.settings.theme.darkMode === true ? 'dark-mode' : ''"></router-view>
        </div>
      </div>
    </div>
    <!-- Content -->

    <!-- Globals -->
    <div>

    </div>
    <!-- Globals -->
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'test-plan-utility',
    data: () => ({
      activeItem: 4,
      name: 'Test Plan Utility',
      active: false,
      pageLoadedName: 'Home',
      isDevelopmentBuild: false
    }),

    computed: {
      version () {
        return window.require('electron').remote.app.getVersion()
      },
      darkModeWatcher: {
        get () {
          return this.settings.theme.darkMode
        }
      },
      settings () {
        return this.$store.state.settings
      },
      changingConfig () {
        return this.$store.state.changingConfig
      },
      changingQuickLinks () {
        return this.$store.state.changingQuickLinks
      }
    },

    methods: {
      onOpenMenu () {
        this.active = true
      },
      onOpenUrl (link) {
        this.$electron.shell.openExternal(link)
      },
      navigate (path) {
        let cancelled = false

        if (this.changingConfig || this.changingQuickLinks) {
          alert('Please wait until any unsaved changes are complete before navigating to a different page')
          switch (this.$route.path) {
            case '/':
              this.$refs.sidemenu.currentIndex = 1
              this.pageLoadedName = 'Home'
              break
            case '/testplancreator':
              this.$refs.sidemenu.currentIndex = 2
              this.pageLoadedName = 'Test Plan Creator'
              break
            case '/formatter':
              this.$refs.sidemenu.currentIndex = 3
              this.pageLoadedName = 'Text Formatter'
              break
            case '/filecreator':
              this.$refs.sidemenu.currentIndex = 4
              this.pageLoadedName = 'File Creator'
              break
            case '/citests':
              this.$refs.sidemenu.currentIndex = 5
              this.pageLoadedName = 'CI Test Analyser'
              break
            case '/settings':
              this.$refs.sidemenu.currentIndex = 6
              this.pageLoadedName = 'Settings'
              break
            default:
              break
          }
          return
        }

        if (this.$route.path === '/testplancreator') {
          if (confirm('Any unsaved changes will be lost. Please export your test plan if you wish to save it.')) {
            this.$router.push({ path: path })
          } else {
            cancelled = true
            this.$refs.sidemenu.currentIndex = 2
          }
        } else if (this.$route.path === '/filecreator') {
          if (confirm('Any unsaved changes will be lost. Please export your file config and data if you wish to save it.')) {
            this.$router.push({ path: path })
          } else {
            cancelled = true
            this.$refs.sidemenu.currentIndex = 4
          }
        } else {
          if (path === '/citests') {
            if (this.settings.api.vstsPAT !== '') {
              this.$router.push({ path: path })
            } else {
              this.$vs.notify({
                title: 'Error!',
                text: `Please enter your VSTS Personal Access Token with READ Permissions in the Settings Screen`,
                color: 'danger',
                icon: 'error_outline',
                position: this.settings.notifPos,
                time: 15000
              })
              cancelled = true
            }
          } else {
            this.$router.push({ path: path })
          }
        }

        if (!cancelled) {
          switch (path) {
            case '/':
              this.pageLoadedName = 'Home'
              break
            case '/testplancreator':
              this.pageLoadedName = 'Test Plan Creator'
              break
            case '/formatter':
              this.pageLoadedName = 'Text Formatter'
              break
            case '/filecreator':
              this.pageLoadedName = 'File Creator'
              break
            case '/citests':
              this.pageLoadedName = 'CI Test Analyser'
              break
            case '/settings':
              this.pageLoadedName = 'Settings'
              break
            default:
              break
          }
        }

        document.getElementsByClassName('vs-sidebar--background').item(0).click()
      },
      getLatestRelease () {
        axios({
          method: 'get',
          url: 'https://api.github.com/repos/HarmanU/test-utility-app/releases/latest'
        })
          .then(Response => {
            this.checkDevBuild(Response.data.tag_name)
          })
          .catch(Response => {
            this.checkDevBuild('v.0.0.1')
          })
      },
      checkDevBuild (releaseTag) {
        let appVersion = window.require('electron').remote.app.getVersion().replace(/\./g, '')
        let releaseVersion = releaseTag.substring(1).replace(/\./g, '')
        this.isDevelopmentBuild = releaseVersion < appVersion
      },
      checkLicense () {
        axios({
          method: 'get',
          // url: 'https://portal.shockwaveinteractive.co.uk/api/license/check'
          url: 'http://portal.localhost/api/license/check',
          auth: {
            username: '',
            password: ''
          }
        })
          .then(Response => {
            if (Response.data.type === 'success') {
              alert('successfully authenticated license')
            } else {
              // alert('unsuccessfully authenticated license')
            }
          })
          .catch(Response => {
            // alert(Response)
          })
      }
    },

    watch: {
      activeItem () {
        this.activeItem = 4
      },
      darkModeWatcher () {
        if (this.darkModeWatcher) {
          document.getElementsByTagName('html').item(0).className += ' dark-mode'
        } else {
          document.getElementsByTagName('html').item(0).className -= ' dark-mode'
        }
      }
    },

    mounted () {
      if (this.darkModeWatcher) {
        document.getElementsByTagName('html').item(0).className += ' dark-mode'
      } else {
        document.getElementsByTagName('html').item(0).className -= ' dark-mode'
      }
      this.getLatestRelease()
      this.checkLicense()
    }
  }
</script>

<style>
.text-dark {
  color: #212529 !important;
}

/* Dark Mode */
.dark-mode {
  color: rgb(245, 245, 245) !important;
  background-color: #212529 !important;
}

.dark-mode .vs-list--header {
  box-shadow: 0 7px 7px -5px rgba(255, 255, 255, 0.15);
}

.dark-mode .vs-navbar {
  box-shadow: 0 4px 20px 0 rgba(255, 255, 255, 0.15);
}

.dark-mode a:not(.text-danger).nav-bar-link {
  color: white !important;
}

a:not(.text-danger):hover.nav-bar-link {
  color: #007bff !important;
}

/** Most of the app */
.dark-mode h1,
.dark-mode h4,
.dark-mode h3,
.dark-mode p,
.dark-mode hr,
.dark-mode .vs-list--item,
.dark-mode .vs-input--label,
.dark-mode .vs-select--label,
.dark-mode .vs-popup,
.dark-mode .vs-con-textarea,
.dark-mode .vs-textarea,
.dark-mode .svg-inline--fa,
.dark-mode .vs-dropdown--custom,
.dark-mode li:not(.activeChild).vs-tabs--li > button {
  color: rgb(245, 245, 245) !important;
  border-color: rgba(255,255,255,0.3) !important;
}

/* Background for dividers */
.dark-mode .vs-divider--text,
.dark-mode .vs-divider-border {
  color: rgb(245, 245, 245) !important;
  background-color: #212529 !important;
  border-color: rgba(245, 245, 245, 0.3) !important;
}

/** Popups */
.dark-mode .vs-popup--close {
  color: #212529;
}

.dark-mode .vs-popup,
.dark-mode .vs-dropdown--custom {
  background: rgb(68, 68, 68) !important;
}

/** Inputs */
.dark-mode .vs-input-number,
.dark-mode button:not(.vs-switch-active).vs-switch,
.dark-mode .vs-select--input,
.dark-mode .form-control,
.dark-mode .vs-con-input > input {
  background-color: rgb(68, 68, 68) !important;
  border-color: rgba(177, 177, 177, 0.5) !important;
  color: rgb(245, 245, 245) !important;
}

.dark-mode .vs-input--placeholder,
.dark-mode .vs-select--input::placeholder {
  color: rgb(224, 224, 224);
}

.dark-mode .vs-input-number input {
  color: rgb(245, 245, 245);
}

.container-fluid.dark-mode .vs-input--placeholder,
.container-fluid.dark-mode .svg-inline--fa {
  color: rgb(245, 245, 245);
}

.dark-mode-side-menu > div > div.vs-sidebar  {
  background-color: #212529 !important;
}

.dark-mode-side-menu > div > div > footer, .dark-mode-side-menu > div > div > header {
  border-top-color: rgba(255,255,255,0.3) !important;
  border-bottom-color: rgba(255,255,255,0.3) !important;
}

/* Dark Mode */
.footer-sidebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.footer-sidebar > button {
      border: 0px solid rgba(0,0,0,0) !important;
      border-left: 1px solid rgba(0,0,0,.07) !important;
      border-radius: 0px !important;
}

.nav-bar-link {
  font-size: 16px !important;
}
</style>
