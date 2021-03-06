importScripts("glue.js");

var endpoint = "http://155.41.27.122:9000";

function nibbleToChar(nibble)
{
		return String.fromCharCode((nibble < 10 ? 48 : 87) + nibble);
}

function bytesToHexString(bytes)
{
	var str = "";
	for (var i = 0; i != bytes.length; ++i)
	{
		str += nibbleToChar(bytes[i] >>> 4);
		str += nibbleToChar(bytes[i] & 0xf);
	}
	return str;
}

function serializeIterableObject(iterable) 
{
	var returnVal = new Array(iterable.length)
	const iterableIterator = iterable.values();
	for (var i = 0; i < iterable.length; i++) {
		returnVal[i] = iterableIterator.next().value;
	}
	return returnVal;
}

function serialize(arr) 
{
	var arrStr = ""
	for (var i = 0; i < arr.length; i++)
	{
		arrStr += arr[i].toString();
		arrStr += " ";
	}
	return arrStr;
}

function serializeHeader(arr) 
{
	var arrStr = "";
	// header-hash size is 32 bytes
	for (var i = 0; i < 32; i=i+4)
	{
		var hex = arr[i].toString(16) + arr[i+1].toString(16) + arr[i+2].toString(16) + arr[i+3].toString(16);
		var int = parseInt(hex,16).toString();
		arrStr += " " + int;
	}
	return arrStr;
}

function http_get(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl+"/get", true ); // true for asynchronous request, false for synchronous
    xmlHttp.onload = function callback() 
    {
    	if (xmlHttp.readyState === 4) 
    	{
    		if (xmlHttp.status === 200) 
    		{
    			var parsedResponse = JSON.parse(xmlHttp.responseText);
    			// header = Array
				var header = Uint32Array.from(parsedResponse["header"]);
				// 	// cache = 1D Array
				var cache = Uint32Array.from(parsedResponse["cache"]);
				var cacheSize = parseInt(parsedResponse["cacheSize"]);
				var dagSize = parseInt(parsedResponse["dagSize"]);
				var headerStr = serializeHeader(header);
				var cacheStr = serialize(cache);
    			mine(headerStr,cacheStr,cacheSize,dagSize);
    		} 
    		else 
    		{
      			return null;
    		}
  		}
    }
    xmlHttp.send(null);
}

function http_post(theUrl,data) 
{
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl+"/post", false );
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(data);
    return;	
}


http_get(endpoint);

function mine(headerStr,cacheStr,cacheSize,dagSize){

	// Accessing cpp bindings
	var hashrate = Module.mine(headerStr,cacheStr,cacheSize,dagSize);	
	console.log("Client hashes average hashrate: " + hashrate);
	alert(hashrate);
}

// allocate 208 MB memory
// emcc --bind -o glue.js miner.cpp -w -O3 -s TOTAL_MEMORY=218103808
// emcc --bind -o glue.js miner.cpp -w -O3 -s ALLOW_MEMORY_GROWTH=1
/*
var src = Util.stringToBytes("abcd");
console.log(Util.bytesToHexString(new Keccak().digest(32, src)));
src = new Uint32Array(src.buffer);
var dst1 = new Uint32Array(8);
new Keccak().digestWords(dst1, 0, dst1.length, src, 0, src.length);
console.log(Util.wordsToHexString(dst1));
var dst = new Uint32Array(16);
new Keccak().digestWords(dst, 0, dst.length, src, 0, src.length);
console.log(Util.wordsToHexString(dst));
*/