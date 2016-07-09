const request = require('request');
const JSONStream = require('jsonstream');

var sendRequest = function(url)
{ 
	var stream = request(url)
		.pipe(JSONStream.parse());

	return stream;
} 