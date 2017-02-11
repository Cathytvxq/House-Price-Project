
//解析每区域页面

var request = require('request');
var cheerio = require('cheerio');
var Mongo = require('./mongo_sh');

var thisYear =2016;
var urlBase = 'http://sh.lianjia.com';
var dataCount = 0;

function update(obj){
	Mongo.shcommunity.findOneAndUpdate({
		community_id: obj.community_id
	}, obj, {
		upsert: true
	},  function(){
		dataCount = dataCount + 1;
		console.log(dataCount);
	});
}

function parser(e, res, body){
	var $ = cheerio.load(body);
	var listNode = $('#house-lst');
	$(listNode).find('li').each(function(i,node){
		var infoNode = $(node).find('.info-panel');
		//h2
		var communityId = $(infoNode).find('h2').find('a').attr('key');
		var url = urlBase + $(infoNode).find('h2').find('a').attr('href');
		var communityName = $(infoNode).find('h2').find('a').attr('title');
		//.col-1
		var districtName = $(infoNode).find('.col-1').find('.where').find('.actshowMap_list').attr('districtname');
		var plateName = $(infoNode).find('.col-1').find('.where').find('.actshowMap_list').attr('platename');//
		
		var xiaoqu = $(infoNode).find('.actshowMap_list').attr('xiaoqu');
		xiaoqu = xiaoqu.replace(/'/g, '');
		xiaoqu = xiaoqu.replace(/\[/g, '');
		xiaoqu = xiaoqu.replace(/\]/g, '');
		xiaoqu = xiaoqu.split(',');
		var lat = parseFloat(xiaoqu[1]);
		var lng = parseFloat(xiaoqu[0]);

		var completionYear = $(infoNode).find('.col-1').find('.other').find('div').text().replace(/[^0-9]/ig,""); 
		//.col-3
		var avr_price = $(infoNode).find('.col-3').find('.price').find('span').text().replace(/[^0-9]/ig,"");
		avr_price = Number(avr_price);

		var age = thisYear - completionYear;

		var result = {
			community_name:  communityName,
			community_id: communityId,
			district: districtName,
			plate: plateName,
			price: avr_price,
			age: age,
			lat: lat,
			lng: lng,
			url: url,
			building_count: 0,
			house_count: 0,
		}
		//console.log(result);
		update(result);
	})
}

module.exports = parser;

