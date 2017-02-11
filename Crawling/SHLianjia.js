//
//主程序入口
//

var request = require('request');
var Pool = require('./SHLianjia_pool');
var getURL = require('./SHLianjia_url');

getURL( function(urls){
	new Pool(urls).query();
})