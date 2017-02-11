
//pool函数 用于完成housecount 和 buildingcount的更新


var request = require('request');
var Mongo = require('./mongo_sh');
var cheerio = require('cheerio');

//var URL = require('./data/url');

var poolCount = 10;
var timeout = 150;
var dataCount = 0;
var buildingCount, houseCount;

function update_count(obj){
	Mongo.shcommunity.findOneAndUpdate({
		community_name: obj.community_name
	}, obj, {
		upsert: true
	},  function(){
		dataCount = dataCount + 1;
		console.log("更新成功" + dataCount);
	});
}//building_count, house_count


function Pool(d){
	this.urls = d;
	this.reset();
	this.init();
}

Pool.prototype = {
	reset: function(){
		this.spiderIndex = 0;
    	this.queryingIndex = 0;
    	this.queryN = this.urls.length;
	},
	init: function(){
		this.querying = [];
	},
	process: function(e, res, body){
		if (!e && res.statusCode == 200) {
			//parser(e, res, body);
			var $ = cheerio.load(body);
			var text_tmp = [];
			$('.res-info').find('.col-2').find('li').each(function(i,node){
				if (i==5) {
					buildingCount = $(node).find('span').text().replace(/[^0-9]/ig,"");
				}
				else if (i==6) {
					houseCount = $(node).find('span').text().replace(/[^0-9]/ig,"");
				}
			});

			var community = $('.res-top').find('.title').find('span').find('h1').text();
			console.log(this.spiderIndex + '|' + this.urls.length + '/' + community + '+' + buildingCount + '+' + houseCount);
			//console.log(buildingCount + '+' + houseCount);

			var result = {
				community_name: community,
				building_count: buildingCount,
				house_count: houseCount,
			}
			update_count(result);
			//console.log(result);
			//console.log("spiderIndex: " + spiderIndex);
			return this.onProcessed();
		}else{
			console.log('错误');
			return this.onProcessed();
		}
	},
	onProcessed: function(){
		this.queryingIndex--;
	    //console.log("onProcessed queryingIndex: " + this.queryingIndex);
	    setTimeout(function(){
	      this.query();
	    }.bind(this), timeout);
	},
	query: function(){
		if (this.queryingIndex > poolCount) return;
		if (this.spiderIndex >= this.urls.length) {
			console.log(this.urls.length + "大功告成！！");
			process.exit();
		}
	    var url = (this.urls[this.spiderIndex]).url;
	    //console.log('queryN' + this.queryN);
	    request.get(url, function(e, res, body){
	      this.process(e, res, body);
	    }.bind(this));
	    this.spiderIndex = this.spiderIndex + 1;
	    this.queryingIndex = this.queryingIndex + 1;
	    if(this.queryingIndex < poolCount) this.query();
	}
};

module.exports = Pool;




