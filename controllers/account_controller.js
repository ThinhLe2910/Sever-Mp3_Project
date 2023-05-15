var Account = require("../models/Account");
var Token = require("../models/Token");
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
const server = require('../server')
const config = server.config

exports.register = (req,res)=>{
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
};
exports.login = (req,res)=>{
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
};
exports.logout = (req,res)=>{
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
};
exports.accountByToken = (req,res)=>{
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
            e.avatarImage = config.domain + '/upload/image/avatar/' + e.avatarImage
            res.json({result:1,message:"successfully",data:e});
        }).catch(()=>
        res.json({result:0,message:"Account error",data:""})
    )
    })
    }
}
exports.updateAvatar = (req,res)=>{
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
};
exports.updateAccount = (req,res)=>{
    if(!req.body.name||!req.body.token||!req.body.username||!req.body.email){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
        jwt.verify(req.body.token, config.secretString, function(err, decoded) {
            if(err || decoded==undefined){
                res.json({result:0, message:"Token is invalid",data:""});
            }else{
                        Account.findByIdAndUpdate(decoded.data._id ,{
                        username:req.body.username,
                        name:req.body.name,
                        avatarImage:req.body.avatarImage
                        }).then(data=>{
                            if(decoded.data.email!=req.body.email){
                                verifyChangleEmail(data,decoded.data.email,req.body.email)
                                res.json({result:1, message:"Check your email to verify your new address",data:""});
                            }else{
                                console.log(data);
                                res.json({result:1, message:"Account has been Updated",data:""});    
                            }
                        }).catch(()=>
                    res.json({result:0, message:"Account updated error",data:""})
                    );
            }
        })
    }
};
exports.changePassword = (req,res)=>{
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
};
exports.uploadAvatar = (req,res,err) =>{
    uploadImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        res.json({result:0,message:"Errors occurred while uploading",data:""}); 
      } else if (err) {
        res.json({result:0,message:"An unknown occurred while uploading",data:""});
      }else{
        res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename})
      }
});
}
//Active Email------------------------------------
exports.activeEmail =(req,res)=>{
    console.log(req.params._id)
    Account.updateOne({_id: req.params._id},{email_active:true})
    .catch(err=>console.log(err))
    res.json({result:1, message:"Account's Status has been actived"});
}

exports.activeNewEmail = (req,res)=>{
    Account.findByIdAndUpdate({_id: req.params._id},{email:req.params.email})
    .catch(err=>console.log(err))
    res.json({result:1, message:"Account's Email has been updated"});
}

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

var storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/image/avatar')
    },
    filename: function (req, file, cb) {
        var index = file.originalname.lastIndexOf('.')
        var type = file.originalname.slice(index)
      cb(null, Date.now()  + "-" + Math.random() + type)
    }
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


//Administor
exports.loginAdmin = function(req,res){
    res.render('administrators/login',{config:config});
}
exports.registerAdmin = function(req,res){
    res.render('administrators/register',{config:config});
}
exports.administrator = function(req,res){
    res.render('administrators/home',{config:config,page:"music"});
}
exports.profile =function(req,res){
    res.render('administrators/home',{config:config,page:"profile"});
}
exports.accountAdmin = function(req,res){
    res.render('administrators/home',{config:config,page:"account"});
}
exports.albumAdmin = function(req,res){
    res.render('administrators/home',{config:config,page:"album"});
}
exports.changePasswordAdmin = function(req,res){
    res.render('administrators/home',{config:config,page:"change-password"});
}
exports.listAccountAdmin = (req,res)=>{
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
}
exports.accountUpdateAdmin = (req,res)=>{
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
}
exports.accountDeleteAdmin = (req,res)=>{
    if(!req.body._id){
        res.json({result:0,message:"Lack of parameters",data:""});
    }else{
                    Account.findByIdAndRemove(req.body._id).then(()=>
                    res.json({result:1, message:"Account has been deleted",data:""})
                    ).catch(()=>
                    res.json({result:0, message:"Account deleted error",data:""})
                    );
                }
}
