
const Music = require("../models/Music");
const categoryController = require('../controllers/category_controller')
const accountController = require('../controllers/account_controller')
const recentController = require('../controllers/recent_controller')
const musicController = require('../controllers/music_controller')
const check = require('../controllers/checkAdmin_controller')

module.exports = function(app,config){
    //Router---------------------------------------
    app.get('/loginAdmin',accountController.loginAdmin);
    app.get('/registerAdmin',accountController.registerAdmin);
    app.get('/administrator',check.checkAdministrator_get,accountController.administrator);
    app.get('/administrator/profile',check.checkAdministrator_get,accountController.profile);
    app.get('/administrator/account',check.checkAdministrator_get,accountController.accountAdmin);
    app.get('/administrator/album',check.checkAdministrator_get,accountController.albumAdmin);
    app.get('/administrator/change-password',check.checkAdministrator_get,accountController.changePasswordAdmin);
    // Account Admin---------------------------------------
    app.post('/account/list',check.checkAdministrator_get,accountController.listAccountAdmin)
    app.post('/administrator/account/update',check.checkAdministrator,accountController.accountUpdateAdmin);
    app.post('/administrator/account/delete',check.checkAdministrator,accountController.accountDeleteAdmin);
    // Music Admin---------------------------------------
    app.post('/administrator/music/update',check.checkAdministrator,musicController.updateMusicAdmin);
    app.post('/administrator/music/delete',check.checkAdministrator,musicController.deleteMusic);
    app.post('/administrator/music',check.checkAdministrator,(req,res)=>{
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
    
    app.get('/account/active/:_id',accountController.activeEmail)
    app.get('/account/active/:_id/:email',accountController.activeNewEmail)
 

    //Login---------------------------------------
    app.post('/register',accountController.register);
    app.post('/login',accountController.login)
    app.post('/logout',accountController.register)
    
    //Account---------------------------------------

    app.post('/account/updateAvatar',accountController.updateAvatar);
    app.post('/account/update',accountController.updateAccount);
    app.post('/account/change-password',accountController.changePassword);
    app.post("/uploadAvatar",accountController.uploadAvatar);
    //recent---------------------------------------

    app.post('/recent',recentController.addRecent)
    app.post('/get/recent',recentController.getRecent);

    //get Account Infor By Token--------------------

    app.post('/account',accountController.accountByToken)
 
    //Category---------------------------------------
    app.post('/category/uploadImage',categoryController.uploadImage)
    app.post('/category/add',check.checkAdministrator,categoryController.addCategory);
    app.post('/category/update',check.checkAdministrator,categoryController.updateCategory);
    app.post('/category/delete',check.checkAdministrator,categoryController.deleteCategory);
    app.post('/category/list',categoryController.showListCategory)


    //Music---------------------------------------
    app.post('/music/uploadImage',musicController.uploadImageMusic)
    app.post('/music/accountId',musicController.findMusicByToken)
    app.post('/music/findByAcc',musicController.findMusicByAccountId)
    
    app.post('/music/add',musicController.addMusic);
    app.post("/uploadMusic",musicController.uploadMusic);
    app.post('/music/update',musicController.updateMusic);
    app.post('/music/updateStatus',musicController.updateStatus);
    app.post('/music/delete',musicController.deleteMusic)
    app.post('/music',musicController.getListMusic);
    app.post('/music/categoryId',musicController.findMusicByCategoryId);
  
}