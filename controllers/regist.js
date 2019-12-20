const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/mogodbTest';

var register = async (ctx, next) => {
    const {phone, password, username} = ctx.request.body;
    var result = await find_have_phone(phone);
    if(result && result.length > 0) {
        ctx.response.body =  {
            code:1,//1表示已经存在
            data:'',
            msg:'该手机号已存在，请直接登陆'
        }
    } else {
        var result = await inser_user_info({phone, password, username});
        if(result === '注册成功') {
            ctx.response.body = {
                code: 0,//0表示成功
                data:'',
                msg:'注册成功'
            };
        } else {
            ctx.response.body = {
                code: 4,//插入数据库失败
                data:'',
                msg:'注册失败'
            };;
        }
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

var inser_user_info = async function(data) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            var dataBase = db.db('mogodbTest');
            const {phone, password, username} = data;
            var userInfo = {phone, password, username};
            dataBase.collection('userInfo').insertOne(userInfo, function (err, res) {
                if (err) throw err;
                db.close();
                resolve('注册成功');
            })
        })
    })
}

module.exports = {
    'POST /myapi/register': register
};
