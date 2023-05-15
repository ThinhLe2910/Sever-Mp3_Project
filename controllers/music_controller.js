const Music = require("../models/Music");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var jwt = require('jsonwebtoken');
const server = require('../server')
const config = server.config
var multer  = require('multer');


exports.getListMusic = (req,res)=>{
    Music.aggregate([
        {$lookup:{
            from:'accounts',
            localField:'idAccount',
            foreignField:'_id',
            as:'accountUpload'
            }
        },{
            $match:{
                status: true 
            }
        },{
            $sort:{
                _id : -1
            }
        }
]).then(data=>{
    data.forEach(function (data) {                      
        var imageMusic = config.domain + '/upload/image/music/' + data.image
        var fileMusic = config.domain + '/upload/music/' + data.file
        data.image =  imageMusic
        data.file = fileMusic
        data.accountUpload[0].password = null;
        });    
        
        res.json({result:1,message:"successfully",data:data});
    }).catch(()=>  res.json({result:0,message:"List music error"}))
};
exports.addMusic = (req,res)=>{
    if(!req.body.token||!req.body.idCategory||!req.body.nameAlbum||!req.body.nameSinger||!req.body.file||!req.body.image){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{ 
                    var newMusic = new Music({
                        idAccount : decoded.data._id ,
                        idCategory : req.body.idCategory,
                        nameAlbum : req.body.nameAlbum,
                        nameSinger : req.body.nameSinger,
                        file:req.body.file,
                        image:req.body.image,
                        status:true
                    });
                    newMusic.save().then(()=> res.json({result:1, message:"Music has been created",data:""})).catch(()=>
                    res.json({result:0, message:"Music created error",data:""})
                    );
            }
        });      
    }
};
exports.updateMusic = (req,res)=>{
    console.log(req.body.image);
    if(!req.body.token||!req.body._id||!req.body.idCategory||!req.body.nameAlbum||!req.body.nameSinger||!req.body.file||!req.body.image){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{
                    Music.findOne({_id:req.body._id,idAccount:decoded.data._id}).then(data=>{
                        if(data == null){
                            res.json({result:0, message:"The music isn't belong to you",data:""});
                        }else{
                            var index = req.body.file.lastIndexOf('/')
                            var nameFile = req.body.file.slice(index+1)
                            var indexImage = req.body.image.lastIndexOf('/')
                            var nameImage = req.body.image.slice(indexImage+1)
                        Music.findByIdAndUpdate(req.body._id,{
                            idCategory : req.body.idCategory,
                            nameAlbum : req.body.nameAlbum,
                            nameSinger : req.body.nameSinger,
                            file:nameFile,
                            image:nameImage
                        }).then(()=> 
                            res.json({result:1, message:"Music has been updated",data:""}))
                        .catch(()=>
                            res.json({result:0, message:"Music updated error",data:""})
                        );
                    }
                }) 
            }
        });
    }
};
exports.deleteMusic = (req,res)=>{

    if(!req.body.token||!req.body._id){
        res.json({result:0,message:"Lack of parameters"});
    }else{
        var idAccount = '';
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{
                Music.findOne({_id:req.body._id,idAccount:decoded.data._id}).then(data=>{
                    if(data == null){
                        res.json({result:0, message:"The music isn't belong to you",data:""});
                    }else{
                        Music.findByIdAndRemove({_id:req.body._id}).then(()=>
                res.json({result:1, message:"Music has been deleted",data:""}))
                    .catch(()=>
                res.json({result:0, message:"Music deleted error"})
                    );
                    }
                })
            }
        });
    }
};
exports.uploadMusic = (req,res,err)=>{
    uploadMusic(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        res.json({result:0,message:"Errors occurred while uploading",data:""}); 
      } else if (err) {
        res.json({result:0,message:"An unknown occurred while uploading",data:""});
      }else{
        res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename});
      }
    });
}
exports.findMusicByCategoryId = (req,res)=>{
    if(!req.body.categoryId){
        res.json({result:0, message:"Lack of parameters"});
    }else{
    Music.aggregate([
        {
            $lookup:
            {
            from:'accounts',
            localField:'liked',
            foreignField:'_id',
            as:'likedlist'
            }
        },
        {
            $lookup:
            {
            from:'categories',
            localField:'idCategory',
            foreignField:'_id',
            as:'Category'
            }
        }
        ,
        {
            $lookup:
            {
            from:'accounts',
            localField:'idAccount',
            foreignField:'_id',
            as:'accountUpload'
            }
        } ,
        {
            $match: 
            {
                idCategory: new ObjectId(req.body.categoryId.toString()),
                status: true 
            }
        }
        ]).then(data=>{
            data.forEach(function (music) {
                var musicFile = config.domain +'/upload/music/'+ music.file
                var musicImage = config.domain +'/upload/image/music/'+ music.image
                var accountImage = config.domain +'/upload/image/'+ music.accountUpload[0].avatarImage
                var categoryImage = config.domain +'/upload/image/category/'+ music.Category[0].image
                music.accountUpload[0].password = null;
                music.file = musicFile
                music.image = musicImage
                music.accountUpload[0].avatarImage = accountImage
                music.Category[0].image = categoryImage
                
                });
                res.json({result:1,message:"successfully",data:data});
            }).catch(()=>  res.json({result:0,message:"List music error"}))
}};
exports.updateStatus = (req,res)=>{
    if(!req.body.token||!req.body.status||!req.body.id){
        res.json({result:0,message:"Lack of parameters"});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{
                    Music.findOne({idAccount:decoded.data._id,_id:req.body.id}).then(data=>{
                        if(data == null){
                            res.json({result:0, message:"Do not have music",data:""});
                        }else{
                        Music.findByIdAndUpdate(req.body.id,{
                            status : req.body.status,
                        }).then((data)=> 
                            res.json({result:1, message:"Music has been updated status",data:""}))
                        .catch(()=>
                            res.json({result:0, message:"Music updated error",data:""})
                        );
                    }
                }) 
            }
        });
    }
}
exports.uploadImageMusic =(req,res)=>{
    uploadMusicImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.json({result:0,message:"Errors occurred while uploading",data:""}); 
          } else if (err) {
            res.json({result:0,message:"An unknown occurred while uploading",data:""});
          }else{
            res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename})
          }
    })
}
exports.findMusicByToken = (req,res)=>{
    if(!req.body.token){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid"});
            }else{
                Music.aggregate([{
                    $lookup:{
                        from:'accounts',
                        localField:'liked',
                        foreignField:'_id',
                        as:'likedlist'
                    }},{
                    $lookup:{
                        from:'categories',
                        localField:'idCategory',
                        foreignField:'_id',
                        as:'Category'
                    }
                    }
                    ,
                    {$lookup:{
                        from:'accounts',
                        localField:'idAccount',
                        foreignField:'_id',
                        as:'accountUpload'
                    }
                    }, 
                    {
                        $match: 
                        {
                            idAccount: new ObjectId(decoded.data._id.toString()) 
                        }
                    },{
                        $sort:{
                            _id : -1
                        }
                    }
                    ]).then(data=>{
                        data.forEach(function (music) {
                            var musicImage = config.domain + '/upload/image/music/' + music.image
                            var musicFile = config.domain + '/upload/music/' + music.file
                            var categoryImage = config.domain + '/upload/image/category/' + music.Category[0].image
                            var accountImage = config.domain + '/upload/image/' + music.accountUpload[0].avatarImage
                            music.accountUpload[0].password = null;
                            music.image = musicImage
                            music.file = musicFile
                            music.Category[0].image =  categoryImage
                            music.accountUpload[0].avatarImage =  accountImage
                            });
                            
                            res.json({result:1,message:"successfully",data:data});
                        }).catch(()=>  res.json({result:0,message:"List music error"}))
                    };
        })
    }}
exports.findMusicByAccountId = (req,res)=>{
    if(!req.body._id){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
                Music.aggregate([{
                    $lookup:{
                        from:'accounts',
                        localField:'liked',
                        foreignField:'_id',
                        as:'likedlist'
                    }},{
                    $lookup:{
                        from:'categories',
                        localField:'idCategory',
                        foreignField:'_id',
                        as:'Category'
                    }
                    }
                    ,
                    {$lookup:{
                        from:'accounts',
                        localField:'idAccount',
                        foreignField:'_id',
                        as:'accountUpload'
                    }
                    }, 
                    {
                        $match: 
                        {
                            idAccount: new ObjectId(req.body._id.toString()) 
                        }
                    }
                    ]).then(data=>{
                        data.forEach(function (data) {
                            var imageMusic = config.domain + '/upload/image/music/' + data.image
                            var imageCategory = config.domain + '/upload/image/category/' + data.Category[0].image
                            var fileMusic = config.domain + '/upload/music/' + data.file
                            var accountImage = config.domain +'/upload/image/'+ data.accountUpload[0].avatarImage
                            data.accountUpload[0].avatarImage = accountImage
                            data.image =  imageMusic
                            data.file = fileMusic
                            data.accountUpload[0].password = null;
                            data.Category[0].image =  imageCategory
                            });
                            
                            res.json({result:1,message:"successfully",data:data});
                        }).catch(()=>  res.json({result:0,message:"List music error"}))
                    };
 };
var storageImageMusic = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/image/music')
    },
    filename: function (req, file, cb) {
        var index = file.originalname.lastIndexOf('.')
        var type = file.originalname.slice(index)
      cb(null, Date.now()  + "-" + Math.random() + type)
    }
});
var uploadMusicImage = multer({ 
storage: storageImageMusic,
fileFilter: function (req, file, cb) {
    if(file.mimetype=="image/bmp" || file.mimetype=="image/png"|| file.mimetype=="image/jpg"|| file.mimetype=="image/jpeg"){
        cb(null, true)
    }else{
        return cb(new Error('Only image are allowed!'))
    }
}

}).single("music");
var storageMp3 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/music')
    },
    filename: function (req, file, cb) { 
        var index = file.originalname.lastIndexOf('.')
        var type = file.originalname.slice(index)
      cb(null, Date.now()  + "-" + Math.random() + type)
    },

}); 
var uploadMusic = multer({ 
    storage: storageMp3,
    fileFilter: function (req, file, cb) {
        if(file.mimetype==="audio/mp3"||file.mimetype==="audio/mpeg"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("music");

//administrator

exports.updateMusicAdmin = (req,res)=>{
    if(!req.body.status||!req.body._id||!req.body.idCategory||!req.body.nameAlbum||!req.body.nameSinger||!req.body.file||!req.body.image){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
        Music.findOne({_id:req.body._id}).then(data=>{
            if(data == null){
                res.json({result:0, message:"Do not have music",data:""});
            }else{
            Music.findByIdAndUpdate(req.body._id,{
                idCategory : req.body.idCategory,
                nameAlbum : req.body.nameAlbum,
                nameSinger : req.body.nameSinger,
                status :req.body.status,
                file:req.body.file,
                image: req.body.image
            }).then(()=> 
                res.json({result:1, message:"Music has been updated",data:""}))
            .catch(()=>
                res.json({result:0, message:"Music updated error",data:""})
            ); 
            }
        });
    }
}
exports.deleteMusicAdmin = (req,res)=>{
    if(!req.body._id){
        res.json({result:0,message:"Lack of parameters"});
    }else{
                Music.findByIdAndRemove({_id:req.body._id}).then(()=>
                res.json({result:1, message:"Music has been deleted",data:""}))
                    .catch(()=>
                res.json({result:0, message:"Music deleted error"})
                    );   
                }

}
