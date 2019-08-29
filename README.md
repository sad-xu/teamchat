# Team Chat

> 后端： nodejs + mongodb

> 前端：登陆页 + 后台页


# 接口文档

[https://www.zybuluo.com/xhc/note/1021664](https://www.zybuluo.com/xhc/note/1021664)

---

### 0.0 token

```json
"Authorization": "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNjZiMWE2M2RiNDljMDk4NDViYzhkZiIsImlhdCI6MTUxNjY5MTU4OCwiZXhwIjoxNTE2Njk1MTg4fQ.nQ4pxkBswZpGWpLdnQmJyRT3SPLSyM5hN-YQHIV8LMM" 
```

### 0.1 接口地址

```
http://47.100.0.143:8081
或者
http://sadxu.top:8081
```

### 0.2 测试接口

> *get*
/api/hello

> *post*
/api/hello

### 0.3 后台地址 (暂时)

```json
"http://sadxu.top:8081/houtai.html"
若没有登录，则会跳转到登陆页：
"http://sadxu.top:8081/login.html"
```

### 0.4 待做

~~退出登录没做~~ 

~~修改管理员密码没做~~

备注没加

- 新需求

    1.10
    
    1.11

## 移动端接口

### 1.1 编辑用户信息 (user)

> *put*
/api/username

```json
{
  "name": ""
}
```

### 1.2 修改密码 (user)

> *post*
/api/userpsd

```json
{
  "oldpsd": "xxxxxx",
  "newpsd": "qqqqqq"
}
```

### 1.3 获取用户所在房间列表 (user)

> *get*
/api/userroom/

```json
例： "/api/userroom/"

成功：
{
  "err": 0,
  "data": {
    "roomlist": [
      {
        "group": [
          {
            "_id": "5a5dd61542d47c0528421ac0",
            "account": "1501140224",
            "name": "xhcxhc"
          },
          {
            "_id": "5a5dd67a42d47c0528421ac1",
            "account": "1031568754",
            "name": "user2"
          },
          {
            "_id": "5a618fdaf1ee3d37c8108c02",
            "account": "111222333",
            "name": "测试a"
          },
          {
            "_id": "5a66e2d08552523e703e6822",
            "account": "123456",
            "name": "ccccc"
          }
        ],
        "_id": "5a5de3689884c039403f9b90",
        "name": "xhcroom",
        "canuse": true
      },
      {
        "group": [
          {
            "_id": "5a5dd67a42d47c0528421ac1",
            "account": "1031568754",
            "name": "user2"
          }
        ],
        "_id": "5a5ed74ba099073b68b258b8",
        "name": "room4",
        "canuse": true
      }
    ]
  }
}
```

### 1.4 用户向房间发送消息 (user)

> *post*
/api/msgtoroom

```json
{
  "roomid": "5a5de3689884c039403f9b90",
  "content": "ddd"
}
```

### 1.5 向用户发送消息 (user)

> *post*
/api/msgtouser

```json
{
  "to": "5a618fdaf1ee3d37c8108c02",
  "content": "正文"
}
```

### 1.6 读取消息 (user)

> *get*
/api/msg

```json
例： "/api/msg"

[
  {
    "_id": "5a6186ade355f73854eac66d",
    "from": "5a5dd67a42d47c0528421ac1",
    "content": "不在",
    "time": "2018-01-19T05:48:29.657Z",
    "roomid": "5a5ed74ba099073b68b258b8"
  },
  {
    "_id": "5a6189a41f6687189c9f0a57",
    "from": "5a5dd67a42d47c0528421ac1",
    "content": "ddd",
    "time": "2018-01-19T06:01:08.893Z",
    "roomid": null
  }
]
```

### 1.7 消息已读 (user)

> *delete*
/api/readmsg

```json
{
  "time": "2018-01-19T08:29:44.092Z"
}

1. 查找所有小于等于time，且to中含有该userid的记录
2. 从to中移除userid
3. 若移除后to为空数组,则删除该记录
```

### 1.8 用户登陆 (user)

> *post*
/api/login

```json
{
  "account": "1031568754",
  "password": "151136",
  "platform": "ios" //"ios" or "android"
}

返回：
{
  "err": 0,
  "data": {
    "_id": "5a66b1a63db49c09845bc8df",
    "account": "20180123",
    "name": "bbb",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNjZiMWE2M2RiNDljMDk4NDViYzhkZiIsImlhdCI6MTUxNjY5MzM5OCwiZXhwIjoxNTE2Njk2OTk4fQ.HGMH1WiQHYw7XftAbBCpgjnlHzRwa4gM2VgbyVV2QOg"
  }
}
```

### 1.9 获取用户信息 (user)

> *get*
/api/userinfo/:id

```json
例： "/api/userinfo:****"
{
  "err": 0,
  "data": {
    "userinfo": {
      "_id": "5a618fdaf1ee3d37c8108c02",
      "account": "111222333",
      "name": "测试a",
      "canuse": true
    }
  }
}
```

### 1.10 用户设置 （加新字段）
> *put*
/api/usersettings

```js
{
  "notification": true,  //optional, true or false
  "platform": "ios" //optional, "ios" or "android"
}
```

### 1.11 获取服务器时间 (无需身份验证)
> *get*
/api/systime

```json
{
  "err": 0, 
  "data": {
    "time": "2018-01-19T08:29:44.092Z"
  }
}
```

## 后台接口

### 2.1 创建用户 (admin)

> *post* 
 /api/user

```json
{
  "account": "12223123",
  "name": "昵称",
  "password": "123456",
  "canuse": true
}
```

**成功**
```json
{
  "err": 0,
  "data": {
    "__v": 0,
    "account": "12223123",
    "name": "昵称",
    "password": "123456",
    "canuse": true,
    "_id": "5a5ec635836f001bd484b298"
  }
}
```

**失败**
```json
{
  "err": 1,
  "msg": "..."
}
```

### 2.2 删除用户 (admin)

> *delete*
/api/user 

```json
{
  "id": "5a5dd61542d47c0528421ac0"
}
```

**成功**
```json
{ "err": 0 }

1. 从所有房间中移除该用户
2. 从
同时删除该用户在所有房间中的数据
"聊天数据未删除!"
```

### 2.3 创建房间 (admin)
> *post*
/api/room

```json
{
  name: 'room4',
  canuse: false
}
```

**成功**

```json
{
  "err": 0,
  "data": {
    "__v": 0,
    "name": "room4",
    "canuse": false,
    "_id": "5a5ed74ba099073b68b258b8",
    "group": [
        null
    ]
  }
}
```

### 2.4 删除房间 (admin)

> *delete*
/api/room

```json
{
  id: "5a5de3689884c039403f9b90"
}
"删除聊天信息"
```

**成功**
```json
{ "err": 0 }
```

### 2.5 获取房间信息（所有|指定） (admin 需要成员的详细信息)

> *get*
**所有：** /api/room
**指定：** /api/room?roomid=5a5de3989884c039403f9b92

```json
所有：
{
  "err": 0,
  "data": [
      {
        "_id": "5a5de3689884c039403f9b90",
        "name": "room1",
        "canuse": true,
        "group": [
          { 
            "_id": "5a732aa437eef008f023de92",        "account": "test01",
            "name": "test01", 
            "canuse": true 
          },
          {...},
          {...}
        ]
      },
      {
        "_id": "5a5ed74ba099073b68b258b8",
        "name": "room4",
        "canuse": false,
        "group": []
      }
  ]
}

指定：
{
  "err": 0,
  "data": {
    "_id": "5a5de3989884c039403f9b92",
    "name": "room3",
    "canuse": true,
    "__v": 0,
    "group": []
  }
}
```

### 2.6 编辑房间名称 (admin)

> *put*
/api/roomname

```json
{
  "id": "5a5de3689884c039403f9b90",
  "name": "xhcroom"
}
```

### 2.7 启用、停用房间 (admin)

> *put*
启用： /api/enableroom
停用： /api/disableroom

```json
{
  "id": "5a5de3689884c039403f9b90"
}
```


### 2.8 启用、停用用户 (admin)

> *put*
启用： /api/enableuser
停用： /api/disableuser

```json
{
  "id": "5a5dd61542d47c0528421ac0"
}
```

### 2.9 重置密码 (admin)

> *put*
/api/userpsd

```json
{
  "id": "5a5dd61542d47c0528421ac0",
  "newpsd": "aaaaaa"
}
```

### 2.10 用户加入房间 (admin 不用)

> *post*
/api/addtoroom

```json
{
  "userid": "5a5dd67a42d47c0528421ac1,5a5ec635836f001bd484b298",
  "roomid": "5a5f28af2857371984ab6002"
}
userid可以有一个或多个，用','隔开
```

### 2.11 用户移出房间 (admin 不用)

> *post*
/api/removefromroom

```json
{
  "userid": "5a5dd67a42d47c0528421ac1,5a5ec635836f001bd484b298",
  "roomid": "5a5f28af2857371984ab6002"
}
userid可以有一个或多个，用','隔开
```

### 2.12 管理员登陆 (admin)

> *post*
/api/adminlogin

```json
{
  "account": "admin2",
  "password": "admin2"
}

返回：
{
  "err": 0,
  "data": {
    "_id": "5a6719e12ce2112504f7ac4e",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNjcxOWUxMmNlMjExMjUwNGY3YWM0ZSIsImlhdCI6MTUxNjcwNjM3MCwiZXhwIjoxNTE2NzA5OTcwfQ.CtOUHbMdqqgvTjndyPETEY_VKJGPTGf5lXmkgbSYw-8"
  }
}
```

### 2.13 获取所有用户信息 (admin)

> *get*
/api/user

```json
[
  {
    "_id": "5a66e2d08552523e703e6822",
    "account": "123456",
    "name": "ccccc",
    "canuse": true
  },
  {
    "_id": "5a67eafc70cd164094716e02",
    "account": "0001",
    "name": "01",
    "canuse": true
  }
]
```

### 2.14 编辑用户信息 (admin)

> *put*
/api/userinfo

```json
可能会加“备注”字段
{
  "id": "",
  "name": ""
}
```

### 2.15 设置房间成员 (admin 新增 有问题)

> *put*
/api/userinroom
先获取所有用户，再设置房间里的用户，最后调用该接口
旧信息是否删除？？？

```json
{
  "id": "",
  "users": "user1,user2,user3"
}
```

### 2.16 删除某一房间下的所有信息

> *delete*
/api/roommsg

```json
{
  "id": ""
}
```

### 2.17 创建管理员 (特殊)

> *post*
/api/admincreate

```json
{
  "account": "admin2",
  "password": "admin2"
}
```

### 2.18 修改管理员密码

> *post*
/api/adminpsd

```json
{
  "oldpsd": "",
  "newpsd": ""
}
```

