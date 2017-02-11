
//

var request = require('request');
var parser = require('./SHLianjia_parser.js');

var timeInterval = 100;
var poolCount = 10;

function Pool(urls){
	this.urls = urls;
	this.reset();
	this.init();
}

Pool.prototype = {
	reset: function(){
		this.queryingIndex = 0;
		this.spiderIndex = 0;
	},
	init: function(){
		this.querying = [];
	},
	process: function(e, res, body){
		if (!e && res.statusCode == 200) {
			parser(e, res, body);
			console.log("spiderIndex: " + this.spiderIndex);
			return this.onProcessed();
		}else{
			return this.onProcessed();
		}
	},
	onProcessed: function(){
		this.queryingIndex --;
		setTimeout(function() {
			this.query();
		}.bind(this), timeInterval);
	},
	query: function(){
		if (this.queryingIndex > poolCount) {return;}
		if (this.spiderIndex >= this.urls.length) { process.exit();}
		var url = this.urls[this.spiderIndex];
		request.get(url, function(e, res, body){
			this.process(e, res, body);
		}.bind(this));
		this.queryingIndex = this.queryingIndex + 1;
		this.spiderIndex = this.spiderIndex + 1;
		if (this.queryingIndex < poolCount) {this.query();}
	}
}

module.exports = Pool;




