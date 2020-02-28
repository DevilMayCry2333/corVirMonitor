var express = require('express');
var router = express.Router();
var request = require('request');
const nodemailer = require("nodemailer");
var https = require('https');
let fs = require('fs')
var app = express();

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/youkaiyu.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/youkaiyu.com/fullchain.pem')
};

https.createServer(options, app).listen(8443, '0.0.0.0');

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

var corVirus = '';
var json = {};

var url = "https://raw.githubusercontent.com/BlankerL/DXY-COVID-19-Data/master/json/DXYArea.json";
// async..await is not allowed in global scope, must use a wrapper

async function main(corVirus) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: '1712363499@qq.com', // generated ethereal user
      pass: '' // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"1712363499@qq.com', // sender address
    to: "1712363499@qq.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: corVirus, // plain text body
    html: "<b>" + corVirus + "</b>" // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

var getIssueOptions = {
        url: url,
        method: "GET",
        json:true,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"
        }
};

function getIssue() {
  return new Promise(function(resolve,reject){
      var requestC = request.defaults({jar: true});
      console.log("url: " + url );

      requestC(getIssueOptions,function(error,response,body){
        if(error){
          console.log("error occurred: " + error);
          reject(error);
        }
        //遍历results,遍历cities。
        var i,j;
        var ans = {};
        var city = [];
        for(i = 0 ; i < body.results.length; i++){
          if(body.results[i].provinceName=="福建省"){
            city = body.results[i].cities;
            break;
          }
        }
        for(j = 0 ; j < city.length; j++){
          if(city[j].cityName=="福州"){
            ans = city[j];
            break;
          }
        }
        json = ans;

        corVirus += "城市名: " + ans.cityName + "<br/>";
        corVirus += "待治愈案例: " + ans.currentConfirmedCount + "<br/>";
        corVirus += "疑似案例" + ans.suspectedCount + "<br/>";
        corVirus += "确认案例: " + ans.confirmedCount + "<br/>";
        corVirus += "治愈案例: " + ans.curedCount + "<br/>";
        corVirus += "死亡案例: " + ans.deadCount + "<br/>";

        console.log("城市名: " + ans.cityName);
        console.log("待治愈案例: " + ans.currentConfirmedCount);
        console.log("确认案例: " + ans.confirmedCount);
        console.log("治愈案例: " + ans.curedCount);
        console.log("死亡案例: " + ans.deadCount);
        resolve('ok')
      }); 
     });
}

async function hey(){
  await getIssue();
  main(corVirus).catch(console.error);
}

hey();

setInterval(async ()=>{
  corVirus = '';
  await getIssue();
  console.log("定时器代码开始执行...");
  console.log(corVirus);
  main(corVirus).catch(console.error);
},86400000)


/* GET home page. */
app.get('/', async function(req, res, next) {
  await getIssue();
  res.send(json);
  // res.render('index', { title: 'Express' });
});

module.exports = router;
