var Account = require("../models/Account");
var Token = require("../models/Token");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { json } = require("body-parser");
var nodemailer = require('nodemailer');
const Category = require("../models/Category");
const Music = require("../models/Music");
const mongoose = require('mongoose');
const Recent = require("../models/Recent");
const e = require("express");
const ObjectId = mongoose.Types.ObjectId;

module.exports = function(app,config){

    //check Admin---------------------------------------
    var checkAdministrator_get =  function(req,res,next){
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
    
    var checkAdministrator =  function(req,res,next){
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
    //Router---------------------------------------
    app.get('/loginAdmin',function(req,res){
        res.render('administrators/login',{config:config});
    });
    app.get('/registerAdmin',function(req,res){
        res.render('administrators/register',{config:config});
    });
    app.get('/administrator',checkAdministrator_get,function(req,res){
        res.render('administrators/home',{config:config,page:"music"});
    });
    app.get('/administrator/profile',checkAdministrator_get,function(req,res){
        res.render('administrators/home',{config:config,page:"profile"});
    });
    app.get('/administrator/account',checkAdministrator_get,function(req,res){
        res.render('administrators/home',{config:config,page:"account"});
    });
    app.get('/administrator/album',checkAdministrator_get,function(req,res){
        res.render('administrators/home',{config:config,page:"album"});
    });
    app.get('/administrator/change-password',checkAdministrator_get,function(req,res){
        res.render('administrators/home',{config:config,page:"change-password"});
    });
    // Account Admin---------------------------------------
    app.post('/account/list',checkAdministrator_get,(req,res)=>{
        if(!req.body.token){
            res.json({result:0,message:'Lack of parameters',data:""})
        }else{
            Account.find({type:0
            })
            .then(e=>{
                e.forEach(e=>{
                e.password = "****"
                })
                res.json({result:1,message:"successfully",data:e});
            }).catch(()=>
            res.json({result:0,message:"Account error",data:""})
        )
        }
    })
    app.post('/administrator/account/update',checkAdministrator,(req,res)=>{
        if(!req.body.name||!req.body._id||!req.body.username||!req.body.email||!req.body.avatarImage){
            res.json({result:0,message:"Lack of parameters",data:""});
        }else{
                if(req.body.name.length<=5 || req.body.name.username<=5 || req.body.email.length<=5){
                res.json({result:0, message:"Wrong parameters"});
                }else{
                        Account.findByIdAndUpdate(req.body._id,{
                            username:req.body.username,
                            email:req.body.email,
                            name:req.body.name,
                            avatarImage:req.body.avatarImage,    
                        }).then(()=>
                        res.json({result:1, message:"Account has been updated",data:""})
                        ).catch(()=>
                        res.json({result:0, message:"Account updated error",data:""})
                        );
                    }
        }
    });
    app.post('/administrator/account/delete',checkAdministrator,(req,res)=>{
        if(!req.body._id){
            res.json({result:0,message:"Lack of parameters",data:""});
        }else{
                        Account.findByIdAndRemove(req.body._id).then(()=>
                        res.json({result:1, message:"Account has been deleted",data:""})
                        ).catch(()=>
                        res.json({result:0, message:"Account deleted error",data:""})
                        );
                    }
        });
    // Music Admin---------------------------------------
    app.post('/administrator/music/update',checkAdministrator,(req,res)=>{
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
        });
    app.post('/administrator/music/delete',checkAdministrator,(req,res)=>{
        if(!req.body._id){
            res.json({result:0,message:"Lack of parameters"});
        }else{
                    Music.findByIdAndRemove({_id:req.body._id}).then(()=>
                    res.json({result:1, message:"Music has been deleted",data:""}))
                        .catch(()=>
                    res.json({result:0, message:"Music deleted error"})
                        );   
                    }

        });
    app.post('/administrator/music',checkAdministrator,(req,res)=>{
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
                },{
                    $sort:{
                        _id : -1
                    }
                }
        ]).then(data=>{
            data.forEach(function (music) {
                music.accountUpload[0].password = null;
                });
                
                res.json({result:1,message:"successfully",data:data});
            }).catch(()=>  res.json({result:0,message:"List music error"}))
    });

    //Active Email------------------------------------
    
    app.get('/account/active/:_id',function(req,res){
        console.log(req.params._id)
        Account.updateOne({_id: req.params._id},{email_active:true})
        .catch(err=>console.log(err))
        res.json({result:1, message:"Account's Status has been actived"});
    })
    app.get('/account/active/:_id/:email',function(req,res){
        Account.findByIdAndUpdate({_id: req.params._id},{email:req.params.email})
        .catch(err=>console.log(err))
        res.json({result:1, message:"Account's Email has been updated"});
    })
    //Verify Email------------------------------------

    var verifyEmail = function (hash,newAccount){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.auth.username,
              pass: config.auth.password
            }
          });
         
          var mailOptions = {
            from: config.auth.username,
            to: newAccount.email,
            subject: 'Active Account',
            html: `
                <h3>Hello ${newAccount.username}<h3>
                <p>Thank you for resgitering into our application</p>
                <p>To active your account please follow this link ....<a href="${config.domain}/account/active/${hash}">Click Here</a></p>
            `
          };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }
    var verifyChangleEmail = function (user,currentEmail,newEmail){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.auth.username,
              pass: config.auth.password
            }
          });
         
          var mailOptions = {
            from: config.auth.username,
            to: currentEmail,
            subject: 'Active Account',
            html: `
                <h3>Hello ${user.username}<h3>
                <p>If you edit your email you need to verify this new Address ${newEmail}</p>
                <p>To verify your email please follow this link ....<a href="${config.domain}/account/active/${user._id}/${newEmail}">Click Here</a></p>
            `
          };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }

    //Login---------------------------------------
    app.post('/register',function(req,res){
        if(!req.body.name||!req.body.username||!req.body.password||!req.body.email||!req.body.confirmPassword){       
            res.json({result:0,message:"Lack of parameters",data:""});
        }else{
                if(req.body.password != req.body.confirmPassword)
                {
                    res.json({result:0,message:"The password confirmation does not match",data:""});
                }else{
                    //check parameters
                    var name = req.body.name
                    var ur = req.body.username;
                    var pw = req.body.password;
                    var em = req.body.email;
                    if(ur.length<=5 || em.length<=5 || pw.length<=5 || name.length <= 5 ||!em.includes("@gmail.com")){
                        res.json({result:0, message:"Wrong parameters",data:""});
                    }else{
                        Account.find({$or:[{username:ur,email_active:true},{email:em,email_active:true}]}).then(users=>{
                        if(users.length > 0){
                            res.json({result:0, message:"Username/Email is availble",data:""});
                        }else{
                                    bcrypt.genSalt(10,function(err,salt){
                                        bcrypt.hash(pw, salt, function(err, hash) {
                                            if(err){
                                                res.json({result:0, message:"Hash password error",data:""});
                                            }else{
                                                var newAccount = new Account({
                                                    username : ur,
                                                    password : hash,
                                                    name:name,
                                                    email : em,
                                                    email_active : false,
                                                    type : 0,
                                                    status : 0,
                                                    dateCreated : Date.now(),
                                                    avatarImage: "avatar.png"
                                                });
                                                verifyEmail(newAccount._id,newAccount);
                                                newAccount.save().then(()=>{
                                                    res.json({result:1, message:"Account has been registered successfully. Visit your email to active Account",data:""});
            
                                                }).catch(()=>res.json({result:0, message:"Save user error",data:""}));
                                            }
                                        })
                                        })
                        }
                        })
                        }
                    }
            }                        
    });
    app.post('/login',(req,res)=>{
        if(!req.body.username||!req.body.password){
            res.json({result:0,message:'Lack of parameters',data:""})
        }else{
            var username = req.body.username;
            var password = req.body.password;
            Account.findOne({username:username,email_active:true}).then(user=>{
                if(user==null){
                    res.json({result:0,message:'Username is not availble',data:""})
                }else{
                    bcrypt.compare(password,user.password,function(err,res2){
                        if(err||res2 == false){
                            res.json({result:0,message:'Wrong Password',data:""})
                        }else{
                            user.password = "***";
                            jwt.sign({data:user},config.secretString,{expiresIn:'72h'},function(err2,token){
                                if(err2){
                                    res.json({result:0, message:"Token created error"}); 
                                }else{
                                    var newToken = new Token({
                                        token:token,
                                        idAccount:user._id,
                                        dateCreated:Date.now(),
                                        status:true
                                    });
                                    newToken.save().then(()=>
                                    res.json({result:1, message:"Succesfully",data:token})
                                    ).catch(()=> 
                                    res.json({result:0, message:"Token saved error"})
                                    )
                                }
                            });
                        }
                    });
                }
            }).catch();
        }
    })
    app.post('/logout',(req,res)=>{
        if(!req.body.token){
            res.json({result:0,message:'Lack of parameters',data:""})
        }else{
            Token.findOne({token:req.body.token.trim()}).then(result=>
            {
                if(result==null){
                    res.json({result:0, message:"Token is not exist",data:""});
                }else{
                    Token.findOneAndUpdate({token:req.body.token},{status:false,dateLogout:Date.now()}).then(()=>
                        res.json({result:1,message:"Logout successfully",data:""})
                    ).catch(()=>
                        res.json({result:0,message:"Logout error",data:""})
                    );
                }
            }).catch(()=>
                res.json({result:0, message:"Token is not exist",data:""})
            )
        }
    })
    
    //Account---------------------------------------

    app.post('/account/updateAvatar',(req,res)=>{
        if(!req.body.token||!req.body.avatarImage){
            res.json({result:0,message:"Lack of parameters",data:""});
        }else{
            var _id = '';
            jwt.verify(req.body.token, config.secretString, function(err, decoded) {
                if(err || decoded==undefined){
                    res.json({result:0, message:"Token is invalid"});
                }else{
                        _id = decoded.data._id 
                        Account.findByIdAndUpdate(_id,{
                            avatarImage:req.body.avatarImage
                        }).then(e=>
                        res.json({result:1, message:"Account has been updated",data:""})
                        ).catch(()=>
                        res.json({result:0, message:"Account updated error",data:""})
                        );
                }
            })
            
        }
    });
    app.post('/account/update',(req,res)=>{
        if(!req.body.name||!req.body.token||!req.body.username||!req.body.email){
            res.json({result:0,message:"Lack of parameters",data:""});
        }else{
            jwt.verify(req.body.token, config.secretString, function(err, decoded) {
                if(err || decoded==undefined){
                    res.json({result:0, message:"Token is invalid",data:""});
                }else{
                            Account.findByIdAndUpdate(decoded.data._id ,{
                            username:req.body.username,
                            name:req.body.name
                            }).then(data=>{
                                if(decoded.data.email!=req.body.email){
                                    verifyChangleEmail(data,decoded.data.email,req.body.email)
                                    res.json({result:1, message:"Check your email to verify your new address",data:""});
                                }else{
                                    res.json({result:1, message:"Account has been Updated",data:""});    
                                }
                            }).catch(()=>
                        res.json({result:0, message:"Account updated error",data:""})
                        );
                }
            })
        }
    });
    app.post('/account/change-password',(req,res)=>{
        if(!req.body.token||!req.body.password||!req.body.currentPassword||!req.body.comfirmPassword){
            res.json({result:0,message:"Lack of parameters",data:""});
        }else{
            if(req.body.password != req.body.comfirmPassword){
                res.json({result:0,message:"Comfirm Password has to match",data:""});
            }else{
                if(req.body.password.length <= 6){
                    res.json({result:0,message:"Password has to have 6 characters",data:""});
                }else{
                    jwt.verify(req.body.token, config.secretString, function(err, decoded) {
                        if(err || decoded==undefined){
                            res.json({result:0, message:"Token is invalid",data:""});
                        }else{
                                Account.findOne({_id:decoded.data._id}).then((result)=>{
                                    bcrypt.compare(req.body.currentPassword,result.password,function(err,result){
                                        if(err||result==false){
                                            res.json({result:0, message:"Wrong Current Password",data:""});
                                        }          
                                        else{
                                            bcrypt.genSalt(10,function(err,salt){
                                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                                                if(err){
                                                    res.json({result:0, message:"Hash password error",data:""});
                                                }else{
                                                    Account.findByIdAndUpdate(decoded.data._id,{password:hash}).then(()=>
                                                    res.json({result:1, message:"Account has been updated Password",data:""})
                                                    );
                                                }
                                            });
                                            })
                                        }
                                    })
                                })  
                            }
                      })
                    }
                };       
        }    
    });

    //recent---------------------------------------

    app.post('/recent',(req,res)=>{
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
    })
    app.post('/get/recent',(req,res)=>{
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
                        }, 
                        {
                        $lookup:{
                            from:'accounts',
                            localField:'idAccount',
                            foreignField:'_id',
                            as:'Account'
                            }
                        },
                        {
                            $match: 
                            {
                                idAccount: new ObjectId(decoded.data._id.toString()) 
                            }
                        },
                        { $sort : { date : -1 } }
                        ,
                        {
                            $limit : 5
                        },
                        {
                            $project: {
                                "date": 0,
                              }
                        }
                        ]).then(data=>{
                            data.forEach(function (data) {  
                                var accountImage = config.domain + '/upload/image/' + data.Account[0].avatarImage
                                data.Account[0].avatarImage =  accountImage
                                data.Account[0].password = null;
                                var musicImage = config.domain + '/upload/image/music/' + data.listrecent[0].image
                                var musicFile = config.domain + '/upload/music/' + data.listrecent[0].file   
                                    data.listrecent[0].image =  musicImage
                                    data.listrecent[0].file = musicFile
                                });    
                                res.json({result:1,message:"successfully",data:data})
                            }).catch(()=>  res.json({result:0,message:"List music recent error"}))
                        };
            })
        }});

    //get Account Infor By Token--------------------

    app.post('/account',(req,res)=>{
        if(!req.body.token){
            res.json({result:0,message:'Lack of parameters',data:""})
        }else{
            var idAccount = '';
            jwt.verify(req.body.token, config.secretString, function(err, decoded) {
                if(err || decoded==undefined){
                    res.json({result:0, message:"Account is invalid",data:""});
                }else{
                    idAccount = decoded.data._id;
                }
            Account.findById(idAccount)
            // }])
            .then(e=>{
                e.password = "****"
                res.json({result:1,message:"successfully",data:e});
            }).catch(()=>
            res.json({result:0,message:"Account error",data:""})
        )
        })
        }
    })

    //multer---------------------------------------

    var multer  = require('multer');
    var storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/image')
    },
    filename: function (req, file, cb) {
        var index = file.originalname.lastIndexOf('.')
            var type = file.originalname.slice(index)
      cb(null, Date.now()  + "-" + Math.random() + type)
    }
    });
    var storageImageCategory = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public/upload/image/category')
        },
        filename: function (req, file, cb) {
            var index = file.originalname.lastIndexOf('.')
            var type = file.originalname.slice(index)
          cb(null, Date.now()  + "-" + Math.random() + type)
        }
        });
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
    var uploadImage = multer({ 
    storage: storageImage,
    fileFilter: function (req, file, cb) {
        if(file.mimetype=="image/bmp" || file.mimetype=="image/png"|| file.mimetype=="image/jpg"|| file.mimetype=="image/jpeg"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
    
    }).single("avatar");
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
    var uploadImageCategory = multer({ 
            storage: storageImageCategory,
            fileFilter: function (req, file, cb) {
                if(file.mimetype=="image/bmp" || file.mimetype=="image/png"|| file.mimetype=="image/jpg"|| file.mimetype=="image/jpeg"){
                    cb(null, true)
                }else{
                    return cb(new Error('Only image are allowed!'))
                }
            } 
    }).single("category");
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
    app.post("/uploadAvatar",function(req,res,err){
        uploadImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.json({result:0,message:"Errors occurred while uploading",data:""}); 
          } else if (err) {
            res.json({result:0,message:"An unknown occurred while uploading",data:""});
          }else{
            res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename})
          }
    });
    });
    
    //Category---------------------------------------
    app.post('/category/uploadImage',(req,res)=>{
        uploadImageCategory(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                res.json({result:0,message:"Errors occurred while uploading",data:""}); 
              } else if (err) {
                res.json({result:0,message:"An unknown occurred while uploading",data:""});
              }else{
                res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename});
              }
            });
    })
    app.post('/category/add',checkAdministrator,(req,res)=>{
        if(!req.body.name || !req.body.image){
            res.json({result:0,message:"Lack of parameters"});
        }else{
            Category.find({name:req.body.name}).then((result)=>{
                if(result.length>0){
                    res.json({result:0,message:"Name's Category already exists."});
                }else{
                    var newCategory = new Category({
                    name :req.body.name,
                    image: req.body.image
                });
                    newCategory.save().then(()=>
                        res.json({result:1, message:"Category has been created",data:newCategory})
                    ).catch(()=>
                        res.json({result:0, message:"Category created error"})
                );
                }
            })
        }   
    });
    app.post('/category/update',checkAdministrator,(req,res)=>{
        if(!req.body.name||!req.body._id||!req.body.image){
            res.json({result:0,message:"Lack of parameters"});
        }else{
            Category.findByIdAndUpdate(req.body._id,{name:req.body.name,image:req.body.image}).then(data=>
            res.json({result:1, message:"Category has been updated",data:data})
            ).catch(()=>
            res.json({result:0, message:"Category updated error"})
            );
        }
    });
    app.post('/category/delete',checkAdministrator,(req,res)=>{
        if(!req.body._id){
            res.json({result:0,message:"Lack of parameters"});  
        }else{
            Category.findByIdAndDelete(req.body._id).then(()=>
            res.json({result:1, message:"Category has been deleted",data:""}) 
            ).catch(()=>
            res.json({result:0, message:"Category deleted error"})
            );
        }
    });
    app.post('/category/list',(req,res)=>{
        Category.find().then(result => {
        result.forEach(category=>{
            var categoryImage =  category.image
            category.image = config.domain + "/upload/image/category/" + categoryImage
        })
        res.json({result:1,message:"Succesfully" ,data:result})
        }).catch(err=>console.log(err))
        
    })


    //Music---------------------------------------
    app.post('/music/uploadImage',(req,res)=>{
        
        uploadMusicImage(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                res.json({result:0,message:"Errors occurred while uploading",data:""}); 
              } else if (err) {
                res.json({result:0,message:"An unknown occurred while uploading",data:""});
              }else{
                res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename});
              }
            });
    })
    app.post('/music/accountId',(req,res)=>{
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
        }})
    app.post('/music/findByAcc',(req,res)=>{
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
         })
    
    app.post('/music/add',(req,res)=>{
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
    });
    app.post("/uploadMusic",function(req,res,err){
        uploadMusic(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.json({result:0,message:"Errors occurred while uploading",data:""}); 
          } else if (err) {
            res.json({result:0,message:"An unknown occurred while uploading",data:""});
          }else{
            res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename});
          }
        });
    });
    app.post('/music/update',(req,res)=>{
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
    });
    app.post('/music/updateStatus',(req,res)=>{
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
    });
    app.post('/music/delete',(req,res)=>{

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
    })
    app.post('/music',(req,res)=>{
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
            var imageCategory = config.domain + '/upload/image/category/' + data.Category[0].image
            var fileMusic = config.domain + '/upload/music/' + data.file
            data.image =  imageMusic
            data.file = fileMusic
            data.accountUpload[0].password = null;
            data.Category[0].image =  imageCategory
            });    
            
            res.json({result:1,message:"successfully",data:data});
        }).catch(()=>  res.json({result:0,message:"List music error"}))
    });
    app.post('/music/categoryId',(req,res)=>{
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
            }});

};