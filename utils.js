const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const verifyToken = function (token) {//传入token 即可
    let res = '';
    let cert = fs.readFileSync(path.join(__dirname, './config/pub.pem'));//公钥
    try{
      let result = jwt.verify(token, cert, {algorithms: ['RS256']}) || {};
      let {exp = 0} = result,current = Math.floor(Date.now()/1000);
      if(current <= exp){
        res = result.data || {};
      }
    }catch(e){
   
    }
    return res;
}

exports.verifyToken = verifyToken;
   