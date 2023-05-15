const Recent = require("../models/Recent");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var Token = require("../models/Token");
var jwt = require('jsonwebtoken');
const server = require('../server')
const config = server.config

exports.addRecent = (req,res)=>{
    if(!req.body.token||!req.body.idMusic){
        res.json({result:0,message:'Lack of parameters',data:""});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{
                Recent.findOneAndReplace({idAccount:decoded.data,recent:req.body.idMusic},{idAccount:decoded.data,recent:req.body.idMusic,date:Date.now()}).then(data=>{
                    if(data != null){
                        res.json({result:1, message:"Music existing",data:""}); 
                    }else{
                        var recent = new Recent({
                            idAccount : decoded.data._id,
                            recent : req.body.idMusic,
                            date:Date.now()
                        })
                        recent.save().then(()=>{
                            res.json({result:1, message:"Account's recent save successfully",data:""});

                        }).catch(()=>res.json({result:0, message:"Save recent error",data:""}));    
                    }
                })               
            }
        });
      
    }
};
exports.getRecent = (req,res)=>{
    if(!req.body.token){
        res.json({result:0,message:'Lack of parameters',data:""});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{
                Recent.aggregate([{
                    $lookup:{
                        from:'musics',
                        localField:'recent',
                        foreignField:'_id',
                        as:'listrecent'
                        }
                    }
                    ,
                    {
                        $match: 
                        {
                            idAccount: new ObjectId(decoded.data._id.toString()) 
                        }
                    }
                    ,
                    { $sort : { date : -1 } }
                    ,
                    {
                        $limit : 5
                    },
                    {
                        $project: {
                            "date": 0,
                            "idAccount" : 0
                          }
                    }
                    ]).then(data=>{
                        data.forEach(function (data) {  
                            var musicImage = config.domain + '/upload/image/music/' + data.listrecent[0].image
                            var musicFile = config.domain + '/upload/music/' + data.listrecent[0].file   
                                data.listrecent[0].image =  musicImage
                                data.listrecent[0].file = musicFile
                            });    
                            res.json({result:1,message:"successfully",data:data})
                        }).catch(()=>  res.json({result:0,message:"List music recent error"}))
                    };
        })
}};