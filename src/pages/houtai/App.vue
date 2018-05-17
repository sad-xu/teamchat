<template>
  <div id="app">
  	<div class="nav">
      <!-- 左侧：用户，房间 -->
      <div class="left">
        <mu-raised-button label="用户列表" secondary @click="jumpTo('user')"/>
        <mu-raised-button label="房间列表" secondary @click="jumpTo('room')"/>
      </div>
      <!-- 中间：TeamChat -->
      <div class="middle">
        <span>TeamChat</span>
      </div>
      <!-- 右侧：管理员 -->
		  <div class="right">
        <mu-icon-menu class="admin-icon"  icon="account_circle"  :desktop="true" :open="adminIcon.flag">
          <mu-menu-item title="修改密码" @click="adminPsd.flag = true;"/>
          <mu-menu-item title="退出登录" @click="logout.flag = true;"/>
        </mu-icon-menu>
      </div> 
		</div>

    <mu-toast v-if="adminPsd.toast" message="修改密码成功!"/>

    <!-- 修改密码 -->
    <mu-dialog :open="adminPsd.flag" title="修改密码" @close="adminPsd.flag = false;">
      <p>
        <span>请输入原密码：</span>
        <mu-text-field hintText="原密码" type="password" v-model="adminPsd.oldPsd" />
      </p>
      <p>
        <span>请输入新密码：</span>
        <mu-text-field hintText="新密码" type="password" v-model="adminPsd.newPsd"/>
      </p>
      <p>
        <span>再次输入新密码：</span>
        <mu-text-field hintText="密码确认" type="password" v-model="adminPsd.newPsd2" />
      </p>
      <mu-flat-button slot="actions" @click="adminPsd.flag = false;" primary label="取消" />
      <mu-flat-button slot="actions" @click="changeAdminPsd()" primary label="确认" />
    </mu-dialog>

    <!-- 退出确认 -->
    <mu-dialog :open="logout.flag" title="退出确认">
      <p>确认退出登录吗？</p>
      <mu-flat-button slot="actions" @click="logout.flag = false;" primary label="取消"/>
      <mu-flat-button slot="actions" @click="adminLogout()" primary label="确认" />
    </mu-dialog>

    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      adminIcon: {
        flag: false
      },
      adminPsd: {
        flag: false,
        oldPsd: '',
        newPsd: '',
        newPsd2: '',
        toast: false
      },
      logout: {
        flag: false
      }
    }  
  },
  methods: {
		// 跳转
		jumpTo(where) {
			this.$router.push({path: `/${where}`})
		},
    showPsdToast () {
      this.adminPsd.toast = true
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.adminPsd.toast = false }, 2000)
    },
    // 管理员修改密码
    changeAdminPsd() {
      let oldPsd = this.adminPsd.oldPsd,
          newPsd = this.adminPsd.newPsd,
          newPsd2 = this.adminPsd.newPsd2;
      this.adminPsd.oldPsd = '';
      this.adminPsd.newPsd = '';
      this.adminPsd.newPsd2 = '';

      if (newPsd !== newPsd2) {
        this.adminPsd.flag = false;
        alert('新密码和确认密码不一致！')
      } else if (newPsd.length < 4) {
        this.adminPsd.flag = false;
        alert('密码过短！')
      } else {
        this.$http.post('/api/adminpsd', {oldpsd:oldPsd,newpsd:newPsd})
            .then(res => {
              if (res.data.err === 0) {
                this.adminPsd.flag = false;
                this.showPsdToast();
              } else {
                alert('errcode:' + res.data.err)
              }
            })
            .catch(err => {
              console.log(err)
            })
      }
    },
    // 管理员退出登录
    adminLogout() {
      localStorage.removeItem('token');
      this.$http.defaults.headers.common['Authorization'] = '';
      window.location.href = 'login.html';
    }
  }
}
</script>

<style lang="css" scope>
html,body,#app {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.nav {
	width: 100%;
	height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e2dcdc;
}

.left {
  width: 100%;
}
.middle {
  width: 100%;
  text-align: center;
  font-size: 25px;
}
.right {
  width:100%;
}

.admin-icon {
  float: right;
  margin-right: 25px;
}
.admin-icon i {
  font-size: 35px;
}


.mu-dialog-body {
  padding-left: 70px;
}
</style>
