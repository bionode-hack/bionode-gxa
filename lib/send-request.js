const request = require('request');
const JSONStream = require('jsonstream');

var sendRequest = function(url) {
	return request(url)
		.pipe(JSONStream.parse());
};


module.exports = sendRequest;