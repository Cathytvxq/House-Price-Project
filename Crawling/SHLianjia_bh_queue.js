

//用排队爬虫的方式爬取，update mongodb


var request = require('request');
var cheerio = require ('cheerio');
var Mongo = require('./mongo_sh');
var URL = require('./data/urls')

var dataCount = 0;
function update_count(obj){
	Mongo.shcommunity.findOneAndUpdate({
		community_name: obj.community_name
	}, obj, {
		upsert: true
	},  function(){
		dataCount = dataCount + 1;
		console.log(dataCount);
	});
}//building_count, house_count

var spiderIndex = 0;
//var buildingCount = 0;
//var houseCount = 0;
function query(done){
	var url = URL[spiderIndex].url;
	console.log(URL.length + '/' + url);
	spiderIndex ++;
	if (!url) {return query(done);}
	if (spiderIndex >= URL.length) {return done();}
	request.get(url, function(e, res, body){
		if (!e && res.statusCode == 200) {
			//parser(e, res, body);
			var $ = cheerio.load(body);
			var text_tmp = [];
			$('.res-info').find('.col-2').find('li').each(function(i,node){
				var tmp = $(node).find('span').text().replace(/[^0-9]/ig,"");
				text_tmp.push(tmp);
			});
			//console.log(text_tmp.length);

			var community = String($('.res-top').find('.title').find('span').find('h1').text());
			var buildingCount = String(text_tmp[5]).replace(/[^0-9]/ig,"");
			var houseCount = String(text_tmp[6]).replace(/[^0-9]/ig,"");
			console.log(buildingCount + '/' + houseCount);

			var result = {
				community_name: community,
				building_count: buildingCount,
				house_count: houseCount,
			}
			update_count(result);
			//console.log(result);
			//console.log("spiderIndex: " + spiderIndex);
			return query(done);
		}else{
			console.log('错误');
			return query(done);
		}
	})
}

query(function(){
  console.log('大功告成..');
  process.exit();
});



