<template>
  <div id="app">
    <!-- Side Menu -->
    <div id="parentx">
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
          Formatter
        </vs-sidebar-item>

        <vs-sidebar-item index="4" icon="settings" @click="navigate('/settings')">
          Settings
        </vs-sidebar-item>

        <div class="footer-sidebar ml-1" slot="footer">
          <div>v{{ version }}</div>
        </div>
      </vs-sidebar>
    </div>
    <!-- Side Menu -->

    <vs-navbar type="gradient" v-model="activeItem" class="nabarx">
      <vs-button @click="onOpenMenu" type="flat" vs-radius="50%"  icon="menu">Menu</vs-button>

      <vs-spacer></vs-spacer>

      <vs-navbar-item index="1">
        <a @click="onOpenUrl('https://rimilia.atlassian.net/projects/AZCI/issues?filter=myopenissues')" class="nav-bar-link"><font-awesome-icon icon="bug" size="lg"/> Jira</a>
      </vs-navbar-item>

      <vs-navbar-item index="2">
        <a @click="onOpenUrl('https://rimilia.atlassian.net/wiki/spaces/AZURE/pages/454426652')" class="nav-bar-link"><font-awesome-icon icon="book" size="lg"/> CI Subspace</a>
      </vs-navbar-item>
    </vs-navbar>

    <!-- Content -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <router-view v-on:open-menu="onOpenMenu" v-on:open-url="onOpenUrl"></router-view>
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
  export default {
    name: 'test-plan-utility',
    data: () => ({
      activeItem: 3,
      name: 'Test Plan Utility',
      active: false
    }),

    computed: {
      version () {
        return window.require('electron').remote.app.getVersion()
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
        if (this.$route.path === '/testplancreator') {
          if (confirm('Any unsaved changes will be lost. Please export your test plan if you wish to save it.')) {
            this.$router.push({ path: path })
          } else {
            this.$refs.sidemenu.currentIndex = 2
          }
        } else {
          this.$router.push({ path: path })
        }
      }
    },
    watch: {
      activeItem () {
        this.activeItem = 3
      }
    }
  }
</script>

<style>
.text-dark {
  color: #212529 !important;
}

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

.nabarx {
  /* position: fixed !important; */
  /* background-color: white !important; */
  /* z-index: -1; */
}
</style>
