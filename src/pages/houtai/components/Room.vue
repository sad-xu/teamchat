<template lang="html">
	<div class="room">
		<mu-raised-button label="新建房间" @click="newRoom.createFlag = true;"/>
		<!-- 房间列表 -->
		<mu-table :showCheckbox="false">
			<mu-thead>
				<mu-tr>
					<mu-th>名称</mu-th>
					<mu-th>状态</mu-th>
					<mu-th>备注</mu-th>
					<mu-th>成员</mu-th>
					<mu-th>操作</mu-th>
				</mu-tr>
			</mu-thead>
			<mu-tbody>
				<mu-tr v-for="(room,index) of rooms" :key="room._id">
					<mu-td >{{room.name}}</mu-td>
					<mu-td class="canuse-icon">
						<mu-icon-button icon="lens" :style="room.canuse === true ? 'color:#69f0ae':'color:#f44336'" @click="enableDisable(index)"/>
					</mu-td>
					<mu-td>备注</mu-td>
					<mu-td>
						<div class="user-list">
							<mu-badge v-for="(item,index) in room.group" :key="	item._id" :content="item.name" :title="item.account" :color="item.canuse ? 'green':''"></mu-badge>
						</div>
					</mu-td>
					<mu-td>
						<div>
						<!-- 编辑信息 -->
						<mu-icon-button icon="edit" @click="roomInfo.index = index;roomInfo.flag = true;" />
						<!-- 成员设置 -->
						<mu-icon-button icon="compare_arrows" style="color:grey;" @click="editUserStart(index)"/>
						<!-- 清空信息 -->
						<mu-icon-button icon="delete" style="color:#ce2121;" @click="clean.name = room.name;clean.id = room._id;clean.flag = true;"/>
						<!-- 删除房间 -->
						<mu-icon-button icon="cancel" style="color:red;" @click="delRoom.name = room.name;delRoom.index = index;delRoom.deleteFlag = true;"/>
						</div>
					</mu-td>
				</mu-tr>
			</mu-tbody>
		</mu-table>

		<!-- 新建房间 -->
		<mu-dialog :open="newRoom.createFlag" title="新建房间">
			<div class="create-wrapper">
				<p>
					<span>名称：</span>
					<mu-text-field hintText="请输入房间名称" v-model="newRoom.name" />
				</p>
				<p>
					<span>是否启用：</span>
					<mu-switch v-model="newRoom.canuse" />
				</p>
			</div>
			<mu-flat-button slot="actions" @click="newRoom.createFlag = false;" primary label="取消"/>
			<mu-flat-button slot="actions" @click="createRoom()" primary label="确定"/>	
		</mu-dialog>
		<!-- 编辑房间信息 -->
		<mu-dialog :open="roomInfo.flag" title="修改房间信息" @close="roomInfo.flag = false;">
			<p>
				<span>房间名称：</span>
				<mu-text-field hintText="请输入房间新名称" v-model="roomInfo.name" />
			</p>
			<mu-flat-button slot="actions" @click="roomInfo.flag = false;" primary label="取消" />
			<mu-flat-button slot="actions" @click="editRoomInfo()" primary label="确认" />
		</mu-dialog>
		<!-- 删除确认 -->
		<mu-dialog :open="delRoom.deleteFlag" title="确认删除" @close="delRoom.deleteFlag = false;">
			<p>确认删除房间"{{delRoom.name}}"吗？</p>
			<mu-flat-button slot="actions" @click="delRoom.deleteFlag = false;" primary label="取消" />
			<mu-flat-button slot="actions" @click="deleteRoom(delRoom.index)" primary label="确认" />
		</mu-dialog>
		<!-- 清空确认 -->
		<mu-dialog :open="clean.flag" title="确认清空" @close="clean.flag = false;">
			<p>确认清空房间"{{clean.name}}"里的信息吗？</p>
			<mu-flat-button slot="actions" @click="clean.flag = false;" primary label="取消" />
			<mu-flat-button slot="actions" @click="cleanRoomMsg();" primary label="确认" />
		</mu-dialog>
		<!-- 成员设置 -->
		<mu-dialog :open="users.editUserFlag" title="成员设置" @close="users.editUserFlag = false;">
			<div class="edituser-wrapper">
				<!-- 左侧:未在房间的用户列表 -->
				<div class="edituser-left">
					<mu-list>
						<mu-list-item v-for="(item, index) in users.userOutside" :key="item._id" :title="item.account" :describeText="item.name" @click="userInRoom(index)">
							<mu-icon value="lens" :color="item.canuse === true ? '#69f0ae':'#f44336'" slot="right" />
						</mu-list-item>
					</mu-list>
				</div>
				<!-- 右侧:在房间里的用户列表 -->
				<div class="edituser-right">
					<mu-list>
						<mu-list-item v-for="(item, index) in users.userInside" :key="item._id" :title="item.account" :describeText="item.name" @click="userOutRoom(index)">
							<mu-icon value="lens" :color="item.canuse === true ? '#69f0ae':'#f44336'" slot="right" />
						</mu-list-item>
					</mu-list>
				</div>
			</div>
			<mu-flat-button slot="actions" @click="users.editUserFlag = false;" primary label="取消" />
			<mu-flat-button slot="actions" @click="editUserEnd()" primary label="确认" />
		</mu-dialog>
	</div>
</template>

<script>
export default {
	name: 'Room',
	data() {
		return {
			rooms: [],
			newRoom: {  // 新建房间
				createFlag: false,
				name: '',
				canuse: true
			},
			delRoom: {  // 删除房间
				deleteFlag: false,
				index: -1,
				name: ''
			},
			roomInfo: { // 编辑房间信息
				index: -1,
				name: '',
				flag: false
			},
			users: {  // 设置用户
				editUserFlag: false,
				roomid: '',
				userInside: [],  // 房间外的用户
				userOutside: [],  // 房间内的用户
				roomindex: -1
			},
			clean: {  // 清空消息
				id: '',
				name: '',
				flag: false
			}
		}
	},
	mounted() {
		// 获取房间列表	
		this.$http.get('/api/room')
				.then(res => {
					if (res.data.err === 0) {
						this.rooms = res.data.data
					} else {
						console.log('get room failed')
					}
				})
				.catch(err => {
					console.log(err)
				})
	},
	methods: {
		console(e) {
			console.log(e)
		},
		// 新建房间
		createRoom() {
			let room = this.newRoom;
			if (room.name.length) {
				this.$http.post('/api/room', {
					name: room.name,
					canuse: room.canuse
				})
				.then(res => {
					if (res.data.err === 0) {
						let data = res.data.data;
						this.newRoom.createFlag = false;
						this.rooms.push({_id:data._id,name:data.name,group:data.group,canuse:data.canuse});
					} else {
						alert('errcode:' + res.data.err)
					}
				})
				.catch(err => {
					console.log(err)
				})
			} else {
				alert('房间名称不能为空!')
			}
		},
		// 启用停用房间
		enableDisable(index) {
			let room = this.rooms[index];
			if (room.canuse) {  // 停用
				this.$http.put('/api/disableroom',{id: room._id})
						.then(res => {
							if (res.data.err === 0) {
								room.canuse = false;
							} else {
								alert('change to disable failed')
							}
						})
						.catch(err => {
							console.log(err)
						})
			} else {   // 启用
				this.$http.put('/api/enableroom',{id: room._id})
						.then(res => {
							if (res.data.err === 0) {
								room.canuse = true;
							} else {
								alert('change to enable failed')
							}
						})
						.catch(err => {
							console.log(err)
						})
			}
		},
		// 删除房间
		deleteRoom(index) {
			let id = this.rooms[index]._id;
			this.$http.delete('/api/room', {
				data: {id:id}
			})
			.then(res => {
				if (res.data.err === 0) {
					this.rooms.splice(index, 1);
					this.delRoom.deleteFlag = false;
				} else {
					alert('delete failed');
				}	
			})
			.catch(err => console.log(err))
		},
		// 编辑房间信息
		editRoomInfo() {
			let index = this.roomInfo.index,
				  roomid = this.rooms[index]._id,
					roomname = this.roomInfo.name;
			if (roomname.length > 0) {
				this.$http.put('/api/roomname', {id:roomid,name:roomname})
					.then(res => {
						if (res.data.err === 0) {
							this.rooms[index].name = roomname;
							this.roomInfo.flag = false;
						} else {
							alert('errcode:' + res.data.err)
						}
					})
					.catch(err => {
						console.log(err)
					})
			} else {
				alert('房间名称不能为空')
			}
		},
		// 清空房间下的所有信息
		cleanRoomMsg() {
			let id = this.clean.id;
			this.$http.delete('/api/roommsg', {data: {id: id}})
					.then(res => {
						if (res.data.err === 0) {
							alert('已清空!');
							this.clean.flag = false;
						} else {
							alert('清空失败！errcode:' + res.data.err)
						}
					})
					.catch(err => {
						console.log(err)
					})
		},
		// 1.获取所有用户，初始化编辑
		editUserStart (index) {
			let allUser = [],
					group = this.rooms[index].group;

			this.users.userInside = group;
			this.users.userOutside = [];
			this.users.roomid = this.rooms[index]._id;
			this.users.roomindex = index;
			this.$http.get('/api/user')
					.then(res => {
						if (res.data.err === 0) {
							allUser = res.data.data;

							allUser.forEach((item, index) => {
								var id = item._id,
										flag = false;
								for (let i = 0; i < group.length; i++) {
									if (id === group[i]._id) {
										flag = true;
										break;
									}
								}
								if (!flag) {
									this.users.userOutside.push(item);
								}
							});
							this.users.editUserFlag = true;						
						} else {
							alert('get users failed')
						}
					})
					.catch(err => {
						console.log(err)
					});
		},
		// 3.保存房间用户设置
		editUserEnd() {
			let roomid = this.users.roomid,
					users = [];
			this.users.userInside.forEach((item,index) => {
				users.push(item._id);
			})

			this.$http.put('/api/userinroom', {id:roomid,users:users.join(',')})
					.then(res => {
						if (res.data.err === 0) {
							this.rooms[this.users.roomindex].group = this.users.userInside;
							this.users.editUserFlag = false;
						} else {
							alert('edit failed')
						}
					})
					.catch(err => {
						console.log(err)
					})
		},
		// 2.左右 移入移出房间
		userInRoom(index) {
			let users = this.users;
			users.userInside.push(users.userOutside[index]);
			users.userOutside.splice(index, 1);
		},
		userOutRoom(index) {
			let users = this.users;
			users.userOutside.push(users.userInside[index]);
			users.userInside.splice(index, 1);
		}
	}
}
</script> 

<style lang="css" scope>
.mu-table {
	table-layout: auto;
}
.mu-td, .mu-th {
	text-align: center;
}

.mu-badge-container {
	cursor: default;
}



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
	margin-left: 12px;
}

/* 设置用户 */
.edituser-wrapper {
	display: flex;
}

.edituser-left, .edituser-right {
	width: 100%;
	max-height: 300px;
	overflow: auto;
}

/* 房间里的用户列表 */
.user-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
}
.user-list div {
	margin-bottom: 3px;
}

</style>