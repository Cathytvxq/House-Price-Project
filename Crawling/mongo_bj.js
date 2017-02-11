
//mongo与mongoose的连接

var mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0:27017/Lianjia');

// var SHCommunity = require('./model/community');
var BJCommunity = require('./model/bjcommunity');

module.exports = {
  // shcommunity: SHCommunity,
  bjcommunity: BJCommunity,
};