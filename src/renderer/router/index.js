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
      path: '*',
      redirect: '/'
    }
  ]
})
