var seq = require('../');
var test = require('tape');
var data = require('./data');
var sendRequest = require('../lib/send-request');

test("Send request", function(t) {
  var result = "";
  var msg = "Create a request to the API for the accession 'E-MEXP-31'.";
  var str = sendRequest("http://www.ebi.ac.uk/arrayexpress/json/v2/experiments?accession=E-MEXP-31");
  str.on('data', function (data) {
    result += data;
  });
  str.on('end', function () {
    t.deepEqual(result, data.testcall, msg);
    console.log("Finished!");
    // setTimeout(t.end, 2000)
  })
});

