const mongoose = require('mongoose');
const tokenSchema = mongoose.Schema({
    token:String,
    idAccount:mongoose.SchemaTypes.ObjectId, 
    dateCreated:Date,
    dateLogout:Date,
    status:Boolean
});

module.exports = mongoose.model("Token",tokenSchema);