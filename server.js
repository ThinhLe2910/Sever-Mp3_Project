var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var cookieParser = require('cookie-parser');

var fs = require("fs");
var server = require("http").Server(app);
server.listen(process.env.PORT || 3000);
var io = require("socket.io")(server);
app.io = io;
app.use(cookieParser());

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

var mongoose = require("mongoose");

//config
const config = 
{   
    "domain" : "http://localhost:3000",
    "dbMongo":{
      "server":"",
        "username":"",
        "password":"",
        "dbName":"",
        "localhost": "mongodb://localhost:27017/db_mp3"
    },
    "auth":{
      "username": "thinh.le089@gmail.com",
      "password":"jwtmjkvwmqseyiak"
    },
    "secretString" :"*(l120th222h5i8n0haa*Y@*ODHljashdho9a28yd82ohd"
}
const connectionString = config.dbMongo.localhost
mongoose.connect(connectionString, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(()=>{
            console.log("Mongo is connected successfully");
            require("./routes/Main")(app,config);
            // require("./routes/sockets")(app,config);
      })
      .catch((err)=>{
           console.log(err); console.log("Mongo connected error");
      });
   

app.get('/',function (req,res) {
    res.send(connectionString)
  })