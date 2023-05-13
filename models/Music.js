const mongoose = require('mongoose');
const musicSchema = mongoose.Schema({
    idAccount:mongoose.SchemaTypes.ObjectId,
    idCategory:mongoose.SchemaTypes.ObjectId,
    dateCreated:Date,
    nameAlbum:String,
    nameSinger:String,
    file:String,
    status:Boolean,
    image:String
});

module.exports = mongoose.model("Music",musicSchema);