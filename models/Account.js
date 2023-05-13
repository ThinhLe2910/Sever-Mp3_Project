const mongoose = require('mongoose');
const userChema = new mongoose.Schema({
    username:String,
    name:String,
    password:String,
    email:String,
    email_active:Boolean,
    type:Number,//0 client,1 administrator
    status:Number,//1 active,0 block
    dateCreated:Date,
    avatarImage:String,
});

module.exports = mongoose.model("Account",userChema)