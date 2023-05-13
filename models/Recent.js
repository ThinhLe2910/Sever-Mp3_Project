const mongoose = require('mongoose');
const recentcChema = new mongoose.Schema({
    idAccount:{type:mongoose.SchemaTypes.ObjectId},
    recent:{type:mongoose.SchemaTypes.ObjectId},
    date:Date
});

module.exports = mongoose.model("Recent",recentcChema)