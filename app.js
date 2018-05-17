const http = require('http')
const https = require('https')
const fs = require("fs");
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const api = require('./router/api.js')

const config = require('./backconfig.js') // 全局配置


mongoose.connect(config.database);
mongoose.Promise = global.Promise;


const app = express();

// 解析post请求
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('dist'));  // 静态路径

app.use('/api', api);  // 接口路由


var options = {
    key: fs.readFileSync('./static/privatekey.pem'),
    cert: fs.readFileSync('./static/certificate.pem')
};
https.createServer(options, app).listen(8443, function () {
    console.log('Https server listening on port ' + 8443);
});

http.createServer(app).listen(8081, function () {
    console.log('Http server listening on port ' + 8081);
});
