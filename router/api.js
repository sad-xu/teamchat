const express = require('express')
const User = require('../models/user')
const Room = require('../models/room')
const Msg = require('../models/msg')
// const Admin = require('../models/admin')

const config = require('../backconfig')  // 全局配置
const jwt = require('jsonwebtoken')  // 生成token
const passport = require('passport') // 权限认证
const Strategy = require('passport-http-bearer').Strategy;

const bcrypt = require('bcrypt')  // 加密

/******* 极光推送 **********/
const JPush = require('jpush-sdk')
const client = JPush.buildClient('a0ed14bc3dfe7ca7f8c32cfa', '9d5259966dca6a73e418d4c7')

function joinObj(arr, attr) {
	var out = []; 
	for (var i=0; i<arr.length; i++) {  
	  out.push(arr[i][attr]); 
	} 
   return out.join();
 }

function pushMsg(idStr, roomid, fromid, isNotify) {
	client.push()
		.setPlatform(JPush.ALL)
		.setAudience(JPush.alias(idStr))  // tag
		.setMessage('new msg', null, null, { roomid: roomid, fromid: fromid })
		.setOptions(null, null, null, true, null, null)  // 生产环境
		.send((err, res) => {
			if (err) {
				console.log('pushMsg: ' + err.message)
			}
		})
}
function pushNotification(idStr) {
	console.log('pushNotification')
	client.push()
		.setPlatform('ios')
		.setAudience(JPush.alias(idStr))  // tag
		.setNotification(JPush.ios('收到一条新消息', 'default', '+1', false))
		.setOptions(null, null, null, true, null, null)  // 生产环境
		.send((err, res) => {
			if (err) {
				console.log('pushNotification: ' + err.message)
			}
		})
}

/****************************/

const router = express.Router();

router.get('/hello', (req, res) => {
	res.json({'err':0,'msg':'hello'});
})

router.post('/hello', (req, res) => {
	res.json({'err':0,'msg':'xxx'});
})


/******************* passport配置 ***********************/
passport.use(new Strategy(function(token, done) {
	User.findOne({token:token}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false);
		}
		return done(null, user)
	})
}));


// 获取系统时间
router.get('/systime', (req, res) => {
	res.json({err:0, data:{time: new Date()}})
})

router.put('/usersettings', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (req.user.level !== 1) {
		res.json({err:4,msg:'you are not user'})
		return
	}

	if (body.notification == undefined && body.platform == undefined) {
		res.json({err:2,msg:'err body'})
		return
	}

	if (body.notification !== undefined) {
		User.findOneAndUpdate(
			{ _id: req.user.id },
			{
				notification: body.notification
			})
			.then(() => res.json({ err: 0 }))
			.catch(err => res.json({ err: 1, msg: err }))
	}
	if (body.platform !== undefined) {
		User.findOneAndUpdate(
			{ _id: req.user.id },
			{
				platform: body.platform
			})
			.then(() => res.json({ err: 0 }))
			.catch(err => res.json({ err: 1, msg: err }))
	}
});

/****************** 登陆 **********************/
// 用户登陆
router.post('/login', (req, res) => {
	let body = req.body;
	if (body.account !== undefined && body.password !== undefined) {
		User.findOne({
				account: body.account,
				level: 1
		})
		.then(function(user) {
			if (user.canuse) {
				user.comparePassword(body.password, (err, isMatch) => {
					if (isMatch && !err) {
						let token = jwt.sign({id:user._id,level:1}, config.secret, {
							expiresIn: 60 * 60
						});
						user.token = token;
						if (body.platform !== undefined) {
							user.platform = body.platform
						}
						user.save((err) => {
							if (err) return res.json({err:5,msg:'save failed'});
							res.json({err:0,data:{
								_id: user._id,
								account: user.account,
								name: user.name,
								token: user.token
							}});
						})
					} else {
						return res.json({err:4,msg:'err psw'});
					}
				})
			} else {
				return res.json({err:3,msg:'can not use'})
			}
		})
		.catch(err => res.json({err:1,msg:err}))
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 管理员登陆
router.post('/adminlogin', (req, res) => {
	let body = req.body;
	if (body.account !== undefined && body.password !== undefined) {
		User.findOne({account:body.account,level:9})
				.then(admin => {
					if (admin.canuse) {
						admin.comparePassword(body.password, (err, isMatch) => {
							if (isMatch && !err) {
								let token = jwt.sign({id:admin._id,level:9}, config.secret, {
									expiresIn: 60 * 60
								});
								admin.token = token;
								admin.save((err) => {
									if (err) return res.json({err:5,msg:'save failed'});
									res.json({err:0,data:{
										_id: admin._id,
										token: admin.token
									}});
								})
							} else {
								return res.json({err:4,msg:'err psw'})
							}
						})
					} else {
						return res.json({err:3,msg:'can not use'})
					}
					
				})
				.catch(err => res.json({err:1,msg:err}))
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 管理员创建
router.post('/admincreate', (req, res) => {
	let body = req.body;
	if (body.account !== undefined && body.password !== undefined) {
		let newAdmin = new User({
			account: body.account,
			password: body.password,
			name: 'admin',
			canuse: true,
			level: 9
		});
		newAdmin.save((err) => {
			if (err) return res.json({err:1,msg:err});
			res.json({err:0,msg:'创建成功'});
		})
	} else {
		res.json({err:2,msg:'err body'})
	}
});


/**************** USER ********************/
// 创建用户
router.post('/user',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.account !== undefined && body.name !== undefined 
			&& body.password !== undefined && body.canuse !== undefined) {
			if (req.user.level === 9) {  // 管理员权限
				let newUser = new User({
			  	account: body.account,
			  	name: body.name,
			  	password: body.password,
			  	canuse: body.canuse,
			  	level: 1
			  });

				User.count({account: body.account}, function(err, count) {
					if (err) return res.json({err:4,msg:err});
					if (count === 0) {
						User.count({name: body.name}, function(err2, count2) {
							if (err2) return res.json({err:6,msg:err2});
							if (count2 === 0) {
								newUser.save((err, user) => {  // 创建
							  	if (err) return res.json({err:1,msg:err});
							  	res.json({err:0,data:user});
							  })
							} else {  // 昵称重复
								return res.json({err:7,msg:'same name'})
							}
						})
					} else { // 账号重复
						return res.json({err:5,msg:'same account'})
					}
				})	  
			} else {
				res.json({err:3,msg:'you are not admin'})
			}
	} else {
		res.json({err:2,msg:'error body'})
	}
});


// 删除用户
router.delete('/user',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.id !== undefined) {
		if (req.user.level === 9) {
			Room.update({},{$pull: {group: body.id}}, {multi:true})  // 从房间剔除
					.then(() => {
						Msg.find({  // 从msg的to中剔除
							to: body.id
						})
						.updateMany({}, {$pull: {to: body.id}})
						.exec((err,raw) => {
							if (err) return res.json({err:5,msg:err});
							User.findByIdAndRemove(body.id)
								.then(() => res.send({err:0}))
								.catch(err => res.json({err:1,msg:err}))
						})	
					})
					.catch(err => res.json({err:3,msg:err}))
		} else {
			res.json({err:4,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'error id'})
	}
});

// 获取所有用户
router.get('/user', passport.authenticate('bearer',{session: false}),(req, res) => {
	if (req.user.level === 9) {
		User.find({level: 1}, '_id account name canuse')
				.then((users) => res.json({err:0,data:users}))
				.catch(err => res.json({err:2,msg:err}))
	} else {
		res.json({err:1,msg:'you are mot admin'})
	}
})


// 编辑用户信息
router.put('/username', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (body.name !== undefined) {
		if (req.user.level === 1) {
			User.count({name: body.name}, (err, count) => {
				if (err) return res.json({err:3,msg:err});
				if (count === 0) {  
					User.findOneAndUpdate(
							{ _id: req.user.id },
							{ 
								name: body.name
							})
						.then(() => res.json({err:0}))
						.catch(err => res.json({err:1,msg:err}))
				} else {  // 姓名重复
					res.json({err:5,msg:'same name'})
				}
			});
		} else {
			res.json({err:4,msg:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 后台编辑用户 （可能会加备注）
router.put('/userinfo', passport.authenticate('bearer',{session:false}), (req, res) => {
	let body = req.body;
	if (req.user.level === 9) {
		User.count({name: body.name}, (err, count) => {
			if (err) return res.json({err:3,msg:err});
			if (count === 0) {
				User.findOneAndUpdate({_id: body.id},{
					name: body.name
				})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:1,msg:err}))
			} else {
				res.json({err:5,msg:'same name'})
			}
		})
	} else {
		res.json({err:1,msg:'you are not admin'})
	}
})


// 启用用户
router.put('/enableuser', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (body.id !== undefined) {
		if (req.user.level === 9) {
			User.findOneAndUpdate(
					{ _id: body.id },
					{
						canuse: true
					})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
		
	} else {
		res.json({err:2,msg:'err id'})
	}
});

// 停用用户
router.put('/disableuser',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.id !== undefined) {
		if (req.user.level === 9) {
			User.findOneAndUpdate(
					{ _id: body.id },
					{
						canuse: false
					})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'err id'})
	}
});

// 修改管理员密码
router.post('/adminpsd', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (req.user.level === 9) {
		User.findOne({_id: req.user.id})
				.then(user => {
					user.comparePassword(body.oldpsd, (err, isMatch) => {
						if (isMatch && !err) {
							user.password = body.newpsd;
							user.save(function(err) {
								if (err) {
									res.json({err:1,msg:err})
								} else {
									res.json({err:0})
								}
							})
						} else {
							res.json({err:3,msg:'err oldpsd'})
						}
					})
				})
				.catch(err => res.json({err:4,msg:err}))
	} else {
		res.json({err:5,msg:'you are not admin'})
	}
});

// 修改用户密码
router.post('/userpsd', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (body.oldpsd !== undefined && body.newpsd !==undefined) {
		if (req.user.level === 1) {
			User.findOne({_id: req.user.id})
				.then(user => {
					user.comparePassword(body.oldpsd, (err, isMatch) => {
						if (isMatch && !err) {
							user.password = body.newpsd;
							user.save(function(err) {
								if (err) {
									res.json({err:1,msg:err})
								} else {
									res.json({err:0})
								}
							})
						} else {
							res.json({err:3,msg:'err oldpsd'})
						}
					})
				})
				.catch(err => res.json({err:4,msg:err}))
		} else {
			res.json({err:5,msg:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 重置用户密码
router.put('/userpsd', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (body.id !== undefined && body.newpsd !== undefined) {
		if (req.user.level === 9) {
			User.findOne({_id:body.id})
				.then(user => {
						user.password = body.newpsd;
						user.save(function(err) {
							if (err) {
								res.json({err:1,msg:err})
							} else {
								res.json({err:0})
							}
						})
				})
				.catch(err => res.json({err:4,msg:err}))
		} else {
			res.json({err:2,msg:'you are not admin'})
		}	
	}
});


// 用户加入房间
router.post('/addtoroom', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (body.userid !== undefined && body.roomid !== undefined) {
		if (req.user.level === 9) {
			Room.update(
							{ _id: body.roomid },
							{ $addToSet: {group: {$each: body.userid.split(',')}} }
						)
					.then(() => res.json({err:0}))
					.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}	
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 用户移出房间
router.post('/removefromroom', passport.authenticate('bearer',{session: false}), (req, res) => {
	let body = req.body;
	if (body.userid !== undefined && body.roomid !== undefined) {
		if (req.user.level === 9) {
			Room.update(
						{ _id: body.roomid },
						{ $pull: {group: { $in: body.userid.split(',')}} }
					)
					.then(() => res.json({err:0}))
					.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});


// 获取用户所在房间列表   成员id + 昵称
router.get('/userroom', passport.authenticate('bearer',{session: false}), (req, res) => {
	let userid = req.user.id;
	if (userid !== undefined) {
		if (req.user.level === 1) {
			Room.find({group: userid}, '_id name canuse group')
					.populate('group', 'account name')	// 多表查询
					.then(room => {
						res.json({err:0,data:{roomlist:room}})
					})
					.catch(err => res.json({err:1,msg:err}))	
		} else {
			res.json({err:3,mag:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err userid'})
	}
});


// 获取用户信息 _id
router.get('/userinfo/:id',(req, res) => {
	let userid = req.params.id;
	if (userid !== undefined) {	
		User.findOne({_id: userid, level: 1}, 'account name canuse notification')
				.then(user => res.json({err:0,data:{userinfo:user}}))
				.catch(err => res.json({err:1,msg:err}))
	} else {
		res.json({err:2,msg:'err userid'})
	}
});

/***************** ROOM ***********************/
//  创建房间
router.post('/room',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.name !== undefined && body.canuse !== undefined) {
		if (req.user.level === 9) {
			Room.create(
					{
						name: body.name,
						canuse: body.canuse
					}
				)
				.then(room => res.json({err:0,data:room}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:2,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'error body'})
	}
});

// 删除房间
router.delete('/room',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.id !== undefined) {
		if (req.user.level === 9) {
			Room.findByIdAndRemove(body.id)
				.then(() => res.send({err:0}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'error id'})
	}
});


// 获取房间信息(所有|指定)  (后台) (具体用户信息)
router.get('/room',passport.authenticate('bearer',{session: false}), (req, res) => {
	let roomid = req.query.roomid;
	if (req.user.level === 9) {
	  if (roomid !== undefined) {  // 获取指定房间						
			Room.findOne({_id: roomid})
				.then(room => res.json({err:0,data:room}))
				.catch(err => res.json({err:1,msg:err}))
		} else {		// 获取所有房间	
			Room.find({}, ['_id', 'name', 'canuse', 'group'])
				.populate('group', 'name account canuse')
				.then(rooms => res.json({err:0,data:rooms}))
				.catch(err => res.json({err:1,msg:err}))
		}
	} else {
		res.json({err:2,msg:'you are not admin'})
	}
});


// 编辑房间名称
router.put('/roomname',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.id !== undefined && body.name !== undefined) {
		if (req.user.level === 9) {
			Room.findOneAndUpdate(
					{ _id: body.id },
					{ 
						name: body.name
					})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});


// 启用房间
router.put('/enableroom',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.id !== undefined) {
		if (req.user.level === 9) {
			Room.findOneAndUpdate(
					{ _id: body.id },
					{
						canuse: true
					})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'err id'})
	}
});

// 停用房间
router.put('/disableroom',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.id !== undefined) {
		if (req.user.level === 9) {
			Room.findOneAndUpdate(
					{ _id: body.id },
					{
						canuse: false
					})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not admin'})
		}
	} else {
		res.json({err:2,msg:'err id'})
	}
});


/******************** MSG ************************/
// 用户向房间发送信息
// group去掉自己的id
router.post('/msgtoroom',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.content !== undefined && body.roomid !== undefined) {
		if (req.user.level === 1) {
			Room.findOne({_id: body.roomid, canuse: true},'group')
					.populate('group', 'notification platform')
					.then(groupObj => {
						// 去除group里自己的id
						let from = req.user.id,
								group = groupObj.group;
						for (let i = 0; i < group.length; i++) {
							if (group[i].id.toString() === from) {
								group.splice(i,1);
								break;
							}
						}

						Msg.create(
							{
								from: from,
								to: group,
								content: body.content,
								roomid: body.roomid
							}
						)
						.then((msg) => {
							res.json({err:0, data:{_id: msg._id, time: msg.time}})
							pushMsg(joinObj(group, 'id'), body.roomid, req.user.id)  // 推送
							for (let i = 0; i < group.length; i++) {
								if (!group[i].notification || group[i].platform != 'ios') {
									group.splice(i, 1);
								}
							}
							if (group.length > 0) {
								pushNotification(joinObj(group, 'id'))
							}
						})
						.catch(err => console.log(err) /*res.json({err:3,msg:err}*/)
					})
					.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:4,msg:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});


// 用户向用户发送信息
router.post('/msgtouser',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.to !== undefined && body.content !== undefined) {
		if (req.user.level === 1) {
			Msg.create(
				{
					from: req.user.id,
					to: body.to,
					content: body.content
				}
			) 
			.then(() => {
				pushMsg(body.to, null, req.user.id); // 推送
				User.findOne({_id: body.to})
				.then(user => {
					if (user.notification) {
						pushNotification(body.to)
					}
				})
				res.json({err:0})
			})
			.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 读取消息
router.get('/msg',passport.authenticate('bearer',{session: false}),(req, res) => {
	let userid = req.user.id;
	if (userid !== undefined) {
		if (req.user.level === 1) {
			Msg.find( {to: userid}, '_id content roomid from time')
					.then(msg => res.json({err:0,data:{msglist:msg}}))
					.catch(err => res.json({err:1,msg:err}))
		} else {
			res.json({err:3,msg:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err userid'})
	}
});

// 消息已读
router.delete('/readmsg',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (body.time !== undefined) {
		if (req.user.level === 1) {
			Msg.find({
				time: {$lte: body.time},
				to: req.user.id
			})
			.updateMany({}, {$pull: {to: req.user.id}})
			.exec((err,raw) => {
				if (err) return res.json({err:1,msg:err});
				Msg.remove({to: {$size: 0}})
					.then(() => res.json({err:0}))
					.catch(err => res.json({err:2,msg:err}))
			})
		} else {
			res.json({err:3,msg:'you are not user'})
		}
	} else {
		res.json({err:2,msg:'err body'})
	}
});

// 编辑房间里的用户
router.put('/userinroom',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (req.user.level === 9) {
		let users = body.users,
				userArr = [];
		if (users.length > 0) {
			userArr = users.split(',');
		}
		Room.update({_id: body.id}, {group: userArr})
				.then(() => res.json({err:0}))
				.catch(err => res.json({err:2,msg:err}))
	} else {
		res.json({err:1,msg:'you are not admin'})
	}
});	

// 删除指定房间的所有信息
router.delete('/roommsg',passport.authenticate('bearer',{session: false}),(req, res) => {
	let body = req.body;
	if (req.user.level === 9) {
		Msg.remove({roomid: body.id})
			.then(() => res.json({err:0}))
			.catch(err => res.json({err:2,msg:err}))
	} else {
		res.json({err:1,msg:'you are not admin'})
	}
});

module.exports = router;