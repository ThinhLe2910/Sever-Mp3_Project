
var Token = require("../models/Token");
var jwt = require('jsonwebtoken');
const server = require('../server')
const config = server.config

exports.checkAdministrator_get =  function(req,res,next){
    if(req.cookies.Token == undefined){
        res.json({result:0, message:"Lack of parameters"});
    }else{
        Token.findOne({token:req.cookies.Token, status:true}).then(token=>{
            if(token==null){
                res.json({result:0, message:"Token is not exist"});
            }else{
                jwt.verify(req.cookies.Token, config.secretString, function(err, decoded) {
                    if(err || decoded==undefined){
                        res.json({result:0, message:"Token is invalid"});
                    }else{
                        if(decoded.data.type != 1){
                            res.json({result:0, message :"You are not Administrator"});
                        }else{
                            next();
                        }
                    }
                });
            }
        });
    }
} 

exports.checkAdministrator =  function(req,res,next){
    if(!req.body.token){
        res.json({result:0, message:"Lack of parameters"});
    }else{
        Token.findOne({token:req.body.token, status:true}).then(token=>{
            if(token==null){
                res.json({result:0, message:"Token is not exist"});
            }else{
                jwt.verify(req.body.token, config.secretString, function(err, decoded) {
                    if(err || decoded==undefined){
                        res.json({result:0, message:"Token is invalid"});
                    }else{
                        if(decoded.data.type != 1){
                            res.json({result:0, message :"You are not Administrator"});
                        }else{
                            next();
                        }
                    }
                });
            }
        }).catch(()=>
            res.json({result:0, message:"Token is not exist"})
        );
    }
}