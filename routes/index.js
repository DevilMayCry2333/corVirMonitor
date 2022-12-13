var express = require('express');
var router = express.Router();
var request = require('request');
const nodemailer = require("nodemailer");
var http = require('http');
let fs = require('fs')
const mysql = require("mysql");
var app = express();

// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/youkaiyu.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/youkaiyu.com/fullchain.pem')
// };

http.createServer(app).listen(8888, '0.0.0.0');

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

var corVirus = '';
var json = [];

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
  console.log("send:" + corVirus);

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
      var mysql      = require('mysql2');
      const date = require('silly-datetime')
      var connection = mysql.createConnection({
        user     : 'debian-sys-maint',
        database : 'pythonTest'
      });
      connection.connect();
      let yestDay = date.format(new Date(new Date().getTime() - 1000*3600*24*2),'YYYYMMDD')
      var sql = "SELECT distinct(cityName) cityNameDis, city_confirmedCount, city_suspectedCount, city_curedCount, city_deadCount from DXYArea_Test where (cityName like '%福州%' or cityName like '%厦门%' or cityName like '%昌平区%') and date_format(updateTime,'%Y%m%d') = "
          + yestDay
          + " group by cityNameDis"
      connection.query(sql,async function (error, results, fields) {
              if (error) throw error;
                console.log(results)
              // console.log('city_confirmedCount: ', results[0].city_confirmedCount);
              // console.log('city_suspectedCount: ', results[0].city_suspectedCount);
              // console.log('city_curedCount: ', results[0].city_curedCount);
              // console.log('city_deadCount: ', results[0].city_deadCount);
              if (results.length > 0){
                  corVirus += "城市名: " + results[0].cityNameDis + "<br/>";
                  corVirus += "疑似案例" + results[0].city_suspectedCount + "<br/>";
                  corVirus += "确认案例: " + results[0].city_confirmedCount + "<br/>";
                  corVirus += "治愈案例: " + results[0].city_curedCount + "<br/>";
                  corVirus += "死亡案例: " + results[0].city_deadCount + "<br/>";
                  corVirus += "========<br/>";
                  corVirus += "城市名: " + results[1].cityNameDis + "<br/>";
                  corVirus += "疑似案例" + results[1].city_suspectedCount + "<br/>";
                  corVirus += "确认案例: " + results[1].city_confirmedCount + "<br/>";
                  corVirus += "治愈案例: " + results[1].city_curedCount + "<br/>";
                  corVirus += "死亡案例: " + results[1].city_deadCount + "<br/>";
                  corVirus += "========<br/>";
                  corVirus += "城市名: " + results[2].cityNameDis + "<br/>";
                  corVirus += "疑似案例" + results[2].city_suspectedCount + "<br/>";
                  corVirus += "确认案例: " + results[2].city_confirmedCount + "<br/>";
                  corVirus += "治愈案例: " + results[2].city_curedCount + "<br/>";
                  corVirus += "死亡案例: " + results[2].city_deadCount + "<br/>";
                  json.push(results[0]);
                  json.push(results[1]);
                  json.push(results[2]);
              }
              connection.end()
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
  json = []
  await getIssue();
  res.send(json);
  // res.render('index', { title: 'Express' });
});

module.exports = router;
