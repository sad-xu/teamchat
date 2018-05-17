<template lang="html">
	<div class="wrapper">
		<!-- 背景 -->
		<div id="bg"></div>
		<!-- 登陆框 -->
		<mu-paper class="login-box" :zDepth="2">
			<mu-text-field hintText="请输入账号" icon="face" v-model="user.account"/>
			<mu-text-field hintText="请输入密码" icon="fingerprint" type="password" v-model="user.password"/>
			<!-- 提示文字 -->
			<div class="tip" :style="{visibility:tip.show ? 'visible':'hidden',color:tip.color}">
				<mu-icon class="tip-icon" value="info" :size="20"/>
				<p>{{tip.text}}</p>
			</div>
			<!-- 登录按钮 -->
			<mu-flat-button label="登陆" icon="check" backgroundColor="green" primay @click="check"/>
		</mu-paper>
	</div>	
</template>

<script>
export default {
	name: 'Login',
	data() {
		return {
			user: {
				account: '',
				password: ''
			},
			tip: {
				text: '',
				show: false,
				color: '#ff5252'
			}
		}
	},
	mounted() {
		let that = this;
		document.addEventListener('keyup', function(e) {
			if (e.keyCode === 13) {  // 回车
				that.check();
			}
		}, false);
	},
	methods: {
		check: function() {
			if (this.user.account.length === 0) {
				this.tip = {
					text: '账号不能为空',
					show: true,
					color: '#ff5252'
				};
			} else if (this.user.password.length === 0) {
				this.tip = {
					text: '密码不能为空',
					show: true,
					color: '#ff5252'
				}
			} else {
				this.$http.post('/api/adminlogin', this.user)
						.then(res => {
							console.log(res.data)
							if (res.data.err === 0) {  // 登陆成功
								var token = res.data.data.token;
								localStorage.setItem('token',token);
								this.tip = {
									text: '登陆成功',
									show: true,
									color: 'green'
								};
								window.location.href = 'houtai.html';
							} else {
								this.tip = {
									text: '登录失败',
									show: true,
									color: '#ff5252'
								};
							}
						})
						.catch(err => {
							console.log(err)
						})
			}
		}
	}
}
</script>

<style scoped>
.wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	min-width: 800px;
	min-height: 600px;
	background-color: #bdbdbd;
}

.login-box {
	position: absolute;
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: center;
	width: 400px;
	height: 250px;
	left: calc(50% - 200px);
	top: calc(50% - 200px);
	border: 1px solid grey;
	background-color: #bbdefb;
}

.tip {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 10px;
}
.tip-icon {
	margin-right: 5px;
}
.tip p {
	font-size: 13px;
	line-height: 20px;
	margin: 0;
}

</style>
