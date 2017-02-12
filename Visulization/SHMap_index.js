


var container = document.getElementsByClassName('container')[0];
var svg_width = container.offsetWidth;
	svg_height = container.offsetHeight;
var margin = {left: 30, top: 30, right: 30, bottom: 30};
//
var svg = d3.select(".container")
.append("svg")
.attr("width", svg_width)
.attr("height", svg_height);
//
var tooltip = d3.select(".tooltip")
.style('opacity', 0.0)


//
var title = "上海房价一览"
svg.append("g")
.classed('title', true)
.append('text')
.text(title)
.attr("x", svg_width/2 - 90)//"translate(" + svg_width/2 + "," + (margin.top+50) + ")"
.attr("y", margin.top + 5)
.attr('z-index',1)


//
//获取房价信息
var avrPriceMapDist = {},
	minPriceMapDist = {},
	maxPriceMapDist = {};
var minAvrPrice = Infinity;
var maxAvrPrice = 0;
d3.csv("./SHdistrictPrice.csv",function(ds){
	for (var i = 0; i < ds.length; i++) {
		var distr = ds[i].district;
		avrPriceMapDist[distr] = ds[i].avrPrice;
		minPriceMapDist[distr] = ds[i].minPrice;
		maxPriceMapDist[distr] = ds[i].maxPrice;
		//
		if (ds[i].avrPrice < minAvrPrice) { 
			minAvrPrice = ds[i].avrPrice;
		}
		else if (ds[i].avrPrice > maxAvrPrice) { 
			maxAvrPrice = ds[i].avrPrice;
		}//找到区域中平均房价的最大最小值，为颜色映射
	}
});


//
//画上海地图，获取地图映射函数
var scale = 25000;//放大的程度
var center = [121.4802370000,31.2363050000];
var projection = d3
.geoMercator()
.scale(scale)
.center(center)
.translate([svg_width / 2, svg_height / 2]);
//
var path = d3.geoPath().projection(projection);
//上海地图
d3.json('./shanghai.json', function(ds){
 	svg.append("g")
 	.classed('map', true)
 	.selectAll("path")
 	.data(ds.features)
 	.enter()
 	.append("path")
 	.attr("d", path)
 	.attr('fill', '#fff')
    .attr('z-index', '1')
    .attr('stroke', '#ddd')//画上海的地图
	.on('mouseover', function(d){
		var dist = d.properties.name.substring(0,2);
		if ((dist!='南汇') && (dist!='卢湾')) {
			// onMouseOver(d, dist);
			var avrP =avrPriceMapDist[dist];
			var k = getK(avrP, minAvrPrice, maxAvrPrice);
			var color = getFillColor(k);
			d3.select(this).attr('fill', color);
			//
			tooltip
			.html(d.properties.name)
			.style("opacity", 1.0)
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY + 10) + "px");
			//
			dataFrame(d);
			//
			drawDots(dist);
		}else{
			tooltip
			.html(d.properties.name)
			.style("opacity", 1.0)
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY + 10) + "px");
		}
	})
	.on('mousemove', onMouseMove)
	.on('mouseout', onMouseOut)
 });


//
function onMouseMove(){
	tooltip
	.attr("left", (d3.event.pageX) + "px")
	.style("top", (d3.event.pageY + 10) + "px")
}

function onMouseOut(){
	d3.select(this).attr('fill', '#fff');
   	tooltip.style("opacity", 0.0);
   	d3.selectAll(".dots").remove();
}

function dataFrame(d){
	var distr = d.properties.name.substring(0,2);
	d3.select(".tooltip")
	.append("div")
	.style("top", "30px")
	.classed("dataframe", true)
	.html("均价: " + avrPriceMapDist[distr])
	.append("div")
	.html("最低: " + minPriceMapDist[distr])
	.append("div")
	.html("最高: " + maxPriceMapDist[distr])
}

//颜色映射
//1.归一化得到K  v越大得到的K值越小，相应的颜色越深
function getK(v, min, max){
	v = Math.max(Math.min(v, max), min);
    return (max - v) / (max - min) || 0;
}
//2.rgba转换成string
function str2array(c){
	return c
    .replace('rgba(', '')
    .replace(')', '')
    .split(',')
    .map(function(v){
      return parseFloat(v, 10);
    });
}
//3.颜色值
function getFillColor(k){
	var cmin = 'rgba(255,0,0,0.9)';
	var cmax = 'rgba(255,255,255,1)';
	var cminArr = str2array(cmin);
 	var cmaxArr = str2array(cmax);
 	var r = Math.floor(cminArr[0] + (cmaxArr[0] - cminArr[0]) * k);
    var g = Math.floor(cminArr[1] + (cmaxArr[1] - cminArr[1]) * k);
    var b = Math.floor(cminArr[2] + (cmaxArr[2] - cminArr[2]) * k);
    var a = cminArr[3] + (cmaxArr[3] - cminArr[3]) * k;
    return 'rgba(' + [r,g,b,a].join(',') + ')';
}
function getDotColor(k){
	var cmin = 'rgba(0,0,255,0.9)';
	var cmax = 'rgba(255,255,255,1)';
	var cminArr = str2array(cmin);
 	var cmaxArr = str2array(cmax);
 	var r = Math.floor(cminArr[0] + (cmaxArr[0] - cminArr[0]) * k);
    var g = Math.floor(cminArr[1] + (cmaxArr[1] - cminArr[1]) * k);
    var b = Math.floor(cminArr[2] + (cmaxArr[2] - cminArr[2]) * k);
    var a = cminArr[3] + (cmaxArr[3] - cminArr[3]) * k;
    return 'rgba(' + [r,g,b,a].join(',') + ')';
}

//画出房子的位置，对价格做映射
function drawDots(dis) {
	d3.csv('./SHcommunityPriceDistrictLoca.csv', function(ds){
		svg.append("g")
		.classed('dots', true)
		.selectAll("circle")
		.data(ds)
		.enter()
		.append("circle")
		.attr("cx", function(d){
			return projection([d.lng, d.lat])[0];
		})
		.attr("cy", function(d){
			return projection([d.lng, d.lat])[1];
		})
		.attr("r", function(d){
			if ((d.district == dis) && (d.price!=0)) {
				return '3px';
			}
			else if ((d.district == dis) && (d.price==0)){
				return '1px';
			}
			else{ return '0px'; }
		} )//'6px'
		.attr('fill', function(d){
			if ((d.district == dis) && (d.price!=0)) {
				var k = getK(d.price, minPriceMapDist[dis], maxPriceMapDist[dis]);
				var dotColor = getDotColor(k);
				return dotColor;
			}
			else if ((d.district == dis) && (d.price==0)) {
				return 'rgba(255, 255, 0, 1.0)'
			}
			else{ return 'none';}

		})//设置透明色比较好看，可以看出叠加'rgba(249,212,217,0.3)'
      	// .attr('z-index', '1') //订的高一些不要被地图给盖住
      	.classed('dot', true)//css
	})
}
