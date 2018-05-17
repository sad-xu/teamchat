<template lang="html">
	<div class="user">
		<mu-raised-button label="新建用户" @click="flags.createFlag = true;"/>
		<!-- 用户列表 -->
		<mu-table :showCheckbox="false">
			<mu-thead>
				<mu-tr>
					<mu-th>账号</mu-th>
					<mu-th>昵称</mu-th>
					<mu-th>备注</mu-th>
					<mu-th>状态</mu-th>
					<mu-th>操作</mu-th>
				</mu-tr>
			</mu-thead>
			<mu-tbody>
				<mu-tr v-for="(user, index) in users" :key="user._id">
					<mu-td>{{user.account}}</mu-td>
					<mu-td>{{user.name}}</mu-td>
					<mu-td>备注</mu-td>
					<mu-td class="canuse-icon">
						<mu-icon-button icon="lens" :style="user.canuse === true ? 'color:#69f0ae;':'color:#f44336'" @click="enableDisable(index)"/>
					</mu-td>
					<mu-td >
						<!-- 编辑信息 -->
						<mu-icon-button icon="edit"  @click="info.id = user._id;info.index = index;flags.infoFlag = true;"/>
						<!-- 重置密码 -->
						<mu-icon-button icon="vpn_key" style="color:grey;" @click="newPsd.id = user._id;flags.changepsdFlag = true;" />
						<!-- 删除 -->
						<mu-icon-button icon="cancel" style="color:red;" @click="deleteIndex = index;flags.deleteFlag = true;"/>	
					</mu-td>
				</mu-tr>
			</mu-tbody>
		</mu-table>

		<!-- 编辑用户信息 -->
		<mu-dialog :open="flags.infoFlag" title="修改账号信息" @close="flags.infoFlag = false;">
			<p>
				<span>昵称：</span>
				<mu-text-field hintText="请输入新昵称" v-model="info.name" />
			</p>
			<mu-flat-button slot="actions" @click="flags.infoFlag = false;" primary label="取消"/>
			<mu-flat-button slot="actions" @click="changeInfo()" primary label="确认"/>
		</mu-dialog>
		<!-- 重置密码 -->
		<mu-dialog :open="flags.changepsdFlag" title="重置密码" @close="flags.changepsdFlag = false;">
			<p>
				<span>重置密码：</span>
				<mu-text-field hintText="请输入重置密码" v-model="newPsd.newpsd"/>
			</p>
			<mu-flat-button slot="actions" @click="flags.changepsdFlag = false;" primary label="取消"/>
			<mu-flat-button slot="actions" @click="changePsd()" primary label="确认"/>	
		</mu-dialog>
		<!-- 删除确认 -->
		<mu-dialog :open="flags.deleteFlag" title="确认删除" @close="flags.deleteFlag = false;">
			<p>确认删除该用户吗？{{deleteIndex}}</p>
			<mu-flat-button slot="actions" @click="flags.deleteFlag = false;" primary label="取消"/>
			<mu-flat-button slot="actions" @click="deleteUser(deleteIndex)" primary label="确认"/>
		</mu-dialog>
		<!-- 新建用户 -->
		<mu-dialog :open="flags.createFlag" title="新建用户" @close="flags.createFlag=false;">
			<div class="create-wrapper">
				<p>
					<span>账号：</span>
					<mu-text-field hintText="请输入账号" @input="checkAccount" :errorText="newUser.accountErr" v-model="newUser.account" />
				</p>
				<p>
					<span>昵称：</span>
					<mu-text-field hintText="请输入昵称" :errText="newUser.nameErr" v-model="newUser.name"/>
				</p>
				<p>
					<span>密码：</span>
					<mu-text-field hintText="请输入密码" @input="checkPsd" :errorText="newUser.psdErr" type="password" v-model="newUser.psd"/>
				</p>
				<p>
					<span>密码确认：</span>
					<mu-text-field hintText="请输入密码" @input="checkPsd2" :errorText="newUser.psd2Err" type="password" v-model="newUser.psd2"/>
				</p>
				<p>
					<span>是否启用：</span>
					<mu-switch v-model="newUser.canuse"/>
				</p>
			</div>
			<mu-flat-button slot="actions" @click="flags.createFlag = false;" primary label="取消"/>
			<mu-flat-button slot="actions" @click="createUser()" primary label="确定" />
		</mu-dialog>
	</div>
</template>

<script>

export default {
	name: 'User',
	data() {
		return {
			users: [],
			flags: {
				createFlag: false,
				deleteFlag: false,
				changepsdFlag: false,
				infoFlag: false
			},
			info: {  // 编辑用户信息
				id: '',
				index: -1,
				name: ''
			},
			deleteIndex: -1,  // 删除用户
			newPsd: {   // 修改密码
				id: '',
				newpsd: ''
			},
			newUser: {  // 创建新账号
				account: '',
				name: '',
				psd: '',
				psd2: '',
				canuse: true,
				accountErr: '',
				nameErr: '',
				psdErr: '',
				psd2Err: ''
			}
		}
	},
	mounted() {
		// 获取用户列表
		this.$http.get('/api/user')
				.then(res => {
					if (res.data.err === 0) {
						this.users = res.data.data;
					} else {
						console.log('get user failed')
					}
				})
				.catch(err => {
					console.log(err)
				})
	},
	methods: {
		// 启用 停用账号
		enableDisable(index) {
			let user = this.users[index];
			if (user.canuse) {  // 停用
				this.$http.put('/api/disableuser',{id: user._id})
						.then(res => {
							if (res.data.err === 0) {
								user.canuse = false;
							} else {
								console.log('change to disable failed')
							}
						})
						.catch(err => {
							console.log(err)
						})
			} else {  // 启用
				this.$http.put('/api/enableuser',{id: user._id})
						.then(res => {
							if (res.data.err === 0) {
								user.canuse = true;
							} else {
								console.log('change to enable failed')
							}
						})
						.catch(err => {
							console.log(err)
						})
			}
		},
		// 删除账号
		deleteUser(index) {
			let id = this.users[index]._id;
			this.$http.delete('/api/user', {
						data: {id:id}
					})
					.then(res => {
						if (res.data.err === 0) {
							this.users.splice(index, 1);
							this.flags.deleteFlag = false;
						} else {
							console.log('delete failed')
						}
					})
					.catch(err => console.log(err))
		},
		// 重置密码
		changePsd() {
			let id = this.newPsd.id,
					newpsd = this.newPsd.newpsd;
			if (newpsd.length > 4) {
				this.$http.put('/api/userpsd', {id:id,newpsd:newpsd})
						.then(res => {
							if (res.data.err === 0) {
								this.flags.changepsdFlag = false;
							} else {
								alert('errcode:' + res.data.err)
							}
						})
						.catch(err => {
							console.log(err)
						})
			} else {
				console.log('密码过短！')
			}
		},
		// 编辑用户信息
		changeInfo() {
			let info = this.info;
			if (info.name.length > 0) {
				this.$http.put('/api/userinfo', {id:info.id,name:info.name})
						.then(res => {
							if (res.data.err === 0) {
								this.users[info.index].name = info.name;
								this.flags.infoFlag = false;
							} else {
								alert('errcode:' + res.data.err)
							}
						})
						.catch(err => {
							console.log(err)
						})
			} else {
				alert('昵称过短！')
			}
		},
		// 新建账号
		createUser() {
			let user = this.newUser;
			if (user.account && user.name && user.psd && (user.psd === user.psd2)) {
				this.$http.post('/api/user', {
										account: user.account,
										name: user.name,
										password: user.psd,
										canuse: user.canuse
									})
									.then(res => {
										if (res.data.err === 0) {
											let data = res.data.data;
											this.flags.createFlag = false;
											this.users.push({_id:data._id,account:data.account,name:data.name,canuse:data.canuse});
										} else{
											alert('errcode:' + res.data.err)
										}
									})
									.catch(err => {
										console.log(err)
									})
			} else {
				console.log('验证不通过')
			}
		},
		checkAccount(val) { // 验证账号格式
			if (val.length === 0) {
				this.newUser.accountErr = '账号不能为空！';
				return;
			}
			this.newUser.accountErr = '';
		},
		checkPsd(val) {  // 验证密码格式
			if(val.length === 0) {
				this.newUser.psdErr = '密码不能为空！';
				return;
			}
			this.newUser.psdErr = '';
		},
		checkPsd2(val) {  // 密码确认
			if (val !== this.newUser.psd) {
				this.newUser.psd2Err = '密码不正确！';
				return;
			}
			this.newUser.psd2Err = '';
		}
	}
}
</script>

<style lang="css" scope>
.create-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.create-wrapper p {
	width: 60%;
}

.mu-icon-button {
	padding: 0;
	width: 24px;
	height: 24px;
	margin-right: 12px;
}
</style>