import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/testplancreator',
      name: 'test-plan-creator',
      component: require('@/components/TestPlanCreator').default
    },
    {
      path: '/formatter',
      name: 'formatter',
      component: require('@/components/Formatter').default
    },
    {
      path: '/filecreator',
      name: 'file-creator-main',
      component: require('@/components/FileCreator/FileCreatorMain').default
    },
    {
      path: '/citests',
      name: 'ci-tests',
      component: require('@/components/ci/CITests').default
    },
    {
      path: '/jira',
      name: 'jira',
      component: require('@/components/jira/Jira').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/Settings').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
