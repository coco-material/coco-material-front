import { createApp } from 'vue'

import mitt from 'mitt'

import VueMatomo from 'vue-matomo'
import VueScrollTo from 'vue-scrollto'
import ColorInput from 'vue-color-input'
import { FocusTrap } from 'focus-trap-vue'

import App from '@/App.vue'
import router from '@/router'
import store from '@/store'

const emitter = mitt()

const mainApp = createApp(App)
  .component('FocusTrap', FocusTrap)
  .use(store)
  .use(router)
  .use(VueMatomo, {
    host: import.meta.env.VUE_APP_MATOMO_HOST,
    siteId: import.meta.env.VUE_APP_MATOMO_SITE_ID,
    disableCookies: true,
    enableHeartBeatTimer: true,
    heartBeatTimerInterval: 10,
    router,
  })
  .use(VueScrollTo, {
    duration: 500,
    easing: 'ease',
  })
  .use(ColorInput)

mainApp.config.globalProperties.emitter = emitter
mainApp.mount('#app')
