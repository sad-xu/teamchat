import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '../components/HelloWorld'
// import Houtai from '../components/Houtai'
import User from '../components/User'
import Room from '../components/Room'

Vue.use(Router)

export default new Router({
  routes: [
    { // 首页
      path: '/',
      name: 'user',
      component: User
    }, {  // 用户列表
    	path: '/user',
    	name: 'User',
    	component: User
    }, { // 房间列表
      path: '/room',
      name: 'Room',
      component: Room
    }
  ]
})
