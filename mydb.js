/*
 * 数据库
 * */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var myDb = {
    TextSchema: {
        id: ObjectId,
        site: String,
        title : String,
        time :  String,
        author : String,
        content :  String,
        link: String
    },
    NewlistSchema: {
        id: ObjectId,
        website: String,
        list : []
    },
    textModel: function () {
        return mongoose.model('text', this.TextSchema);
    },
    newlistModel: function () {
        return mongoose.model('newlist', this.NewlistSchema);
    },
    connect: function () {
        mongoose.connect('mongodb://localhost/my_database');
    }
};

module.exports = myDb;
