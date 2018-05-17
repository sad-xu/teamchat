import Vue from 'vue'
import App from './App'
import router from './router'

import axios from 'axios'

import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'

Vue.config.productionTip = false

Vue.use(MuseUI)

// 设置头信息
let localToken = localStorage.getItem('token');
if (localToken) {
	axios.defaults.headers.common['Authorization'] = 'bearer ' + localToken;
} else {
	window.location.href = 'login.html';
}

Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
