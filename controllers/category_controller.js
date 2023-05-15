const Category = require("../models/Category");
var multer  = require('multer')
const server = require('../server')
const config = server.config


exports.showListCategory =  (req,res)=>{
    Category.find().then(result => {
    result.forEach(category=>{
        var categoryImage =  category.image
        category.image = config.domain + "/upload/image/category/" + categoryImage
    })
    res.json({result:1,message:"Succesfully" ,data:result})
    }).catch(err=>console.log(err))   
}
exports.addCategory = (req,res)=>{
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
}
exports.updateCategory = (req,res)=>{
    if(!req.body.name||!req.body._id||!req.body.image){
        res.json({result:0,message:"Lack of parameters"});
    }else{
        Category.findByIdAndUpdate(req.body._id,{name:req.body.name,image:req.body.image}).then(data=>
        res.json({result:1, message:"Category has been updated",data:data})
        ).catch(()=>
        res.json({result:0, message:"Category updated error"})
        );
    }
};
exports.deleteCategory = (req,res)=>{
    if(!req.body._id){
        res.json({result:0,message:"Lack of parameters"});  
    }else{
        Category.findByIdAndDelete(req.body._id).then(()=>
        res.json({result:1, message:"Category has been deleted",data:""}) 
        ).catch(()=>
        res.json({result:0, message:"Category deleted error"})
        );
    }
};
exports.uploadImage = (req,res)=>{
    uploadImageCategory(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.json({result:0,message:"Errors occurred while uploading",data:""}); 
          } else if (err) {
            res.json({result:0,message:"An unknown occurred while uploading",data:""});
          }else{
            res.json({result:1,message:"File has been uploaded successfully",data:req.file.filename});
          }
        });
};
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