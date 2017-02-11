
//mongo与mongoose的连接

var mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0:27017/Lianjia');

var SHCommunity = require('./model/shcommunity');
//var BJCommunity = require('./model/community');

module.exports = {
  shcommunity: SHCommunity,
  //bjcommunity: BJCommunity,
};