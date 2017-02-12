
//获取小区的每一页的url

var request = require('request');
var cheerio = require('cheerio');

var urlBase = 'http://sh.lianjia.com';
var urlXiaoqu = urlBase + '/xiaoqu/';
//var urls_D = [];
//var urls_Community = [];

function findURLs($){
	var urls = [];
	var url, urlFull;

	$('#filter-options').find('.gio_district').find('a').each( function(i, node){
		url = $(node).attr('href');
		urlFull = urlBase + url;
		urls.push(urlFull);
	} )
	urls = filterURLs(urls);
	return urls;
} //获取北京链家网小区页面下所有区域的url

function filterURLs(arr){
	var url;
	var newArr = [];

	for (var i = 1; i < arr.length; i++) {
		url = arr[i];
		if ( !url || url.indexOf('xiaoqu')===-1 ) {continue;}
		newArr.push(url);
	}
	return newArr;
} //过滤掉没有xiaoqu的URL 

function getURLs_District(arr){
	var url, newURL;
	var newurls = [];

	for (var i = 0; i < arr.length; i++) {
		url = arr[i];
		if (!url) {continue;}
		for (var j = 1; j <101; j++) {
			newURL = url + 'd' + j + '/';
			newurls.push(newURL);
		}
	}
	return newurls;
} //获取所有区域每一页的URL

// request.get( urlXiaoqu, function(e, res, body){
// 	if (e) {console.log(e);}
// 	if (!e && res.statusCode == 200) {
// 		var $ = cheerio.load(body);
// 		urls_D = findURLs($);
// 		urls_D = getURLs_District(urls_D);
// 		console.log('urls_D length is ' + urls_D.length);
// 		console.log(urls_D);
// 	}
// } )

module.exports = function(cb){
	request.get(urlXiaoqu, function(e, res, body){
		//if (e) {console.log(e);}
		if (!e && res.statusCode == 200) {
			var $ = cheerio.load(body);
			var urls_D = findURLs($);
			urls_D = getURLs_District(urls_D);
			console.log("urls_D " + urls_D.length);
			cb(urls_D);
		}
	})
} 

