
//pool函数入口


var request = require('request');

var Pool = require('./SHLianjia_bh_pool');
var URL = require('/Users/cathy/Nodejs/DataAnalytics/Project/data/urls_sh.json');

new Pool(URL).query();