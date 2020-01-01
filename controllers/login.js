const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/mogodbTest';
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { verifyToken } = require('../utils');

var login = async (ctx, next) => {
    const {phone, password} = ctx.request.body;
    var result = await find_have_phone(phone);
    if(result && result.length > 0) {
        var resultc = await find_correct_pass(phone, password);
        if(resultc && resultc.length > 0) {
            const phone_ = resultc[0].phone;
            let token = generateToken({phone_});
            ctx.response.body = {
                code: 0,//0表示成功
                data:token,
                msg:'登陆成功'
            };
        } else {
            ctx.response.body = {
                code: 3,//3账户或者密码错误
                data:'',
                msg:'账户或者密码错误'
            };
        }
    } else {
        ctx.response.body =  {
            code: 2,//2表示不存在
            data:'',
            msg:'登陆账户不存在'
        }
    }
};

var getUserInfo = async (ctx, next) => {
    const { phone } = ctx.request.body;
    const header = ctx.request.header;
    const token = header['x-token'];
    if(token) {
        let result = verifyToken(token);
        let tel = result.phone_;
        if(tel == phone) {
            var results = await find_have_phone(phone);
            if(results && results.length > 0) {
                const {username, phone} = results[0];
                ctx.response.body = {
                    code: 0,
                    data: {username, phone},
                    msg:''
                };
            } else {
                ctx.response.body = {
                    code: 2,
                    data:'',
                    msg:'无用户信息'
                };
            }
        } else {
            ctx.response.body = {
                code: 4,//4token异常
                data:'',
                msg:'token异常'
            };
        }
    } else {
        ctx.response.body = {
            code: 4,//4token异常
            data:'',
            msg:'no token'
        };
    }
};

var find_have_phone = async function(phone) {//查找手机号是不是已经存在了
    return new Promise(function(resolve,reject) {
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            var dataBase = db.db('mogodbTest');
            var whereStr = {"phone": phone};
            dataBase.collection('userInfo').find(whereStr).toArray(function(err, result) {
                if (err) throw err;
                db.close();
                resolve(result)
            })
        })
    })
}

var find_correct_pass = async function(phone, password) {//查找密码是不是正确
    return new Promise(function(resolve,reject) {
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            var dataBase = db.db('mogodbTest');
            var whereStr = {"phone": phone, "password": password};
            dataBase.collection('userInfo').find(whereStr).toArray(function(err, result) {
                if (err) throw err;
                db.close();
                resolve(result)
            })
        })
    })
}

var generateToken = (data) => {//生成token
    let created = Math.floor(Date.now() / 1000);
    let cert = fs.readFileSync(path.join(__dirname, '../config/pri.pem'));//私钥
    let token = jwt.sign({
        data,
        exp: created + 3600 * 24
    }, cert, {algorithm: 'RS256'});
    return token;
}

module.exports = {
    'POST /myapi/login': login,
    'POST /myapi/getUserInfo': getUserInfo
};
