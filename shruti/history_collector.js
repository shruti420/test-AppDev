/* This code is taken from github.com
function chromeToEpochTime(chromeTime){
	return new Date(chromeTime/1000000-11644473600);
}*/


var urlMappings = {};
var divsInfo = [];
var data =[]
var domainnames=[]
var domainnamesfull=[];
var set1 = new Set();
var values = [];
var web1 = [];
var webcount1 = [];
var dict1 = {};
var dict2 ={};
var timeTStr = '_ih_t_time';
let csv1="";

function parseDomain(_url){
	var matches = _url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	return matches && matches[1];
}

var m_names = new Array("Jan", "Feb", "Mar", 
"April", "May", "June", "July", "Aug", "Sep", 
"Oct", "Nov", "Dec");

var curTimestr = "";

var resetted = true;
var timeToggles = {};
var siteToggles = {};

function filter(id){
	if(id.indexOf(timeTStr) != -1){
		// time toggle clicked
		timeToggles[id] = !timeToggles[id];
	}
	else{
		siteToggles[id] = !siteToggles[id];
	}
	// loop through favicon divs and adjust opacity according to filters
	for(var i = 0; i < divsInfo.length; i++){
	    var _div = divsInfo[i][0];
	    var timeAllDisabled = true;
	    var timePassed = false;
	    var siteAllDisabled = true;
	    var sitePassed = false;
	    for(var tToggle in timeToggles){
	    	if(!timeToggles[tToggle]){
	    		continue;	// tToggle deactivated
	    	}
	    	timeAllDisabled = false;
	    	var _p = parseInt(tToggle);
		   	var _timestamp = divsInfo[i][1];
	    	var hour = _timestamp.getHours() + _timestamp.getMinutes()/60.0 + _timestamp.getSeconds()/3600.0;
	    	if (hour >= _p * 6 && hour <= (_p+1) * 6){	// check if in selected time range
	    		timePassed = true;
				break;	// selected!
			}
    	}
    	for(var sToggle in siteToggles){
    		if(!siteToggles[sToggle]){
    			continue;	// sToggle deactivated
    		}
    		siteAllDisabled = false;
    		if(divsInfo[i][2] == urlMappings[sToggle][2]){	// check if domainId matches that of selected site
    			sitePassed = true;
    			break; // selected!
    		}
    	}
    	_div.style.opacity = (timeAllDisabled || timePassed) && (siteAllDisabled || sitePassed) ? 1 : 0.1;
    }
    // set opacity of filter icons
	for(var tToggle in timeToggles){
	    var _div = document.getElementById(tToggle);
	    _div.className = timeToggles[tToggle] ? 'toggleSelected' : 'toggleDeselected';	
	}
	for(var sToggle in siteToggles){
		var _div = document.getElementById(sToggle);
	    _div.className = siteToggles[sToggle] ? 'faviconDiv toggleSelected' : 'faviconDiv toggleDeselected';	
	}
}
function arrayToCsv(data){
	return data.map(row =>
	  row
	  .map(String)  // convert every value to String
	  .map(v => v.replaceAll('"', '""'))  // escape double colons
	  .map(v => `"${v}"`)  // quote it
	  .join(',')  // comma-separated
	).join('\r\n');  // rows starting on new lines
  }
  function downloadBlob(content, filename, contentType) {
	// Create a blob
	var blob = new Blob([content], { type: contentType });
	var url = URL.createObjectURL(blob);
  
	// Create a link to download it
	var pom = document.createElement('a');
	pom.href = url;
	console.log(blob,url,pom);
	pom.setAttribute('download', filename);
	pom.click();
  }
function genFaviconDiv(){
	var faviconDiv = document.createElement('div');
	faviconDiv.className = "faviconDiv";
	return faviconDiv;
}


function genFavicons(){
	dummyA = document.createElement('a');
	chrome.history.search({
		'text': '',
		'maxResults': 1000000,
		'startTime': -1,
	}, function (historyItems){
		historyItems.sort(function(a, b) {return a.lastVisitTime - b.lastVisitTime});
		var domainId = 0;
		for(var i = 0; i < historyItems.length; i++){
			var _myDomainId;
			var item = historyItems[i];
			//console.log(historyItems[i]);
			// simplify domain name
			var domain = parseDomain(item.url);
			var faviconUrl;
			// cache favicons of the same domain
			if(!(domain in urlMappings)){
				if(domain == undefined){
					continue;
				}
				_myDomainId = domainId;
				urlMappings[domain] = [item.url, 1, domainId++];	// [raw favicon url, #visits, domainId]
				//console.log(urlMappings);
			}
			else{
				urlMappings[domain][1] += 1;
				_myDomainId = urlMappings[domain][2];
			}
			// create div for each favicon
			faviconUrl = 'chrome://favicon/' + urlMappings[domain][0];
			var faviconDiv = genFaviconDiv();
			var faviconTitle = item.title.replace(/\"/g, "");
			var timestamp = new Date(item.lastVisitTime);
			var timestr = m_names[timestamp.getMonth()] + " " + timestamp.getDate() + ", " + timestamp.getFullYear().toString().substring(2, 4);
			if(timestr != curTimestr){
				curTimestr = timestr;
				var _div = document.createElement('div');
				_div.innerHTML = timestr;
				_div.className += "dateDiv";
				document.getElementById('faviconHolder').appendChild(_div);
			}
			domainnamesfull.push([item.url,item.title,timestamp]);
			let domainx = (new URL(item.url));
			domainx = domainx.hostname;
			//console.log(domainx);
			//faviconDiv.innerHTML += '<a href="' + item.url + '"><div>Web address:"' +item.url+'"</div></a>';
			//faviconDiv.innerHTML += '<a href="' + item.url + '"><div>Web address:"' +item.url+'"</div></a>';
			var s=[];
			s.push(item.url);
			s.push(timestamp);
			data.push(s);
			domainnames.push(domainx);
			set1.add(domainx);
			//console.log(data);
			divsInfo.push([faviconDiv, timestamp, _myDomainId]);	// [the div, timestamp, domainId]
			document.getElementById('faviconHolder').appendChild(faviconDiv);
		}
		csv1=arrayToCsv(domainnamesfull);
		//console.log(csv1);
		downloadBlob(csv1, 'fullwebpages.csv', 'text/csv;charset=utf-8;');
		set1.forEach(element => {
			var count=0;
			for(var x=0;x<domainnames.length;x++){
				if(domainnames[x]===element){
					count++;
				}
			}
			values.push(count);
		  });
		var ps=0;
		set1.forEach(element => {
			console.log(element,'  --->  ', values[ps]);
			dict1[element] = values[ps++];
		});
			// get most visited sites
		//console.log(dict1);
		var xitems = Object.keys(dict1).map(
			(key) => { return [key, dict1[key]] });
		xitems.sort(
				(first, second) => { return first[1] - second[1] }
			  );
		var keys = xitems.map(
				(e) => { return e[0] });
		for(var k=0;k<keys.length;k++){
			web1.push([keys[k],dict1[keys[k]]]);
		}
		console.log(web1,'-->',webcount1);
		var newarr=[];
		for(var i=web1.length-1; i>web1.length-6;i--){
			newarr.push(web1[i]);
		}
		
		csv1=arrayToCsv(web1);
		//console.log(csv1);
		downloadBlob(csv1, 'Mostvisited.csv', 'text/csv;charset=utf-8;');
		var sortedUrls = [];
		for(var url in urlMappings){
			sortedUrls.push([urlMappings[url][1], url]);
		}
		sortedUrls.sort(function(a, b) { return (b[0] - a[0]); });
		document.getElementById('topFavicons').innerHTML = '';
		for(var i = 0; i < 12; i++){
			var faviconDiv = genFaviconDiv();
			var domain = sortedUrls[i][1];
			var faviconUrl = 'chrome://favicon/' + (urlMappings[domain])[0];
			var tooltipStr = domain + '&#10;' + '# Visits: ' + sortedUrls[i][0];
			faviconDiv.setAttribute('id', domain);
			faviconDiv.innerHTML += '<a href="#"><img title="' + tooltipStr + '" class="faviconTitle" src="' + faviconUrl + '"></img></a>';
			faviconDiv.onclick=function(){
				filter(this.id);
			}
			document.getElementById('topFavicons').appendChild(faviconDiv);
			faviconDiv.className += ' toggleDeselected';
			siteToggles[domain] = false;
		}
		//GoogleCharts.load(drawChart);
		//faviconDiv.innerHTML+='<div id="myChart" style="width: 900px; height: 500px;"></div>';
	});
}
document.addEventListener('DOMContentLoaded', function () {
	for(var i = 0; i < 4; i++){
		timeToggles[i+timeTStr] = false;
	  	document.getElementById(i+timeTStr).onclick=function(){
	  		filter(this.id);
	  	}
  	}
  	genFavicons();
	console.log(data);
	console.log(domainnames);
	console.log(set1);
});