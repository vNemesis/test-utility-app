import Vue from 'vue'
import LandingPage from '@/components/LandingPage'

describe('LandingPage.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount()

    // let editSwitch = vm.$refs.quickLinksEditSwitch.$el

    // editSwitch.click()

    console.log(vm.$data)

    // expect(vm.$el.querySelector('.title').textContent).to.contain('Newsfeed')

    // expect(vm.$data.editQuickLinks).to.equal(false)
  })
})
