import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import router from './router'
import store from './store/store'
Vue.config.productionTip = false
Vue.use(ElementUI);

axios.defaults.withCredentials=true;


new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
