// # bionode-gxa

// ## Usage
// See the methods below.

var gxa = module.exports


var through = require('through2')
var pumpify = require('pumpify')
var request = require('request');
var JSONStream = require('jsonStream');


var PROXY = typeof window !== 'undefined' ? 'http://cors.inb.io/' : ''
var APIROOT = PROXY + 'http://www.ebi.ac.uk/arrayexpress/json/v2/'

// ## Search
// Takes a database type string and a search term and returns a stream of objects found:
// 
// db: Can be either 'files' or 'experiments'
// 
gxa.search = function(db, term, cb) {
  var opts = typeof db === 'string' ? { db: db, term: term } : db
  cb = typeof term === 'function' ? term : cb

  var stream = pumpify.obj(
    createAPISearchUrl(opts.db, opts.term),
    sendRequest(),
    process.stdout
  )

  if (opts.term) { stream.write(opts.term); stream.end() }
  if (cb) { stream.pipe(concat(cb)) } else { return stream }
}

function createAPISearchUrl (db, term) {
  var stream = through.obj(transform)
  return stream

  function transform (obj, enc, next) {
    var query = APIROOT + db + '?keywords=' + encodeURI(obj.toString().replace(/['"]+/g, ''))
    this.push(query)
    next()
  }
}

// 
var sendRequest = function() {
  var stream = through.obj(transform)
  return stream;
  
  function transform (url, enc, next) {
    var self = this
    request(url, gotData)
    function gotData(err, res, body) {
      self.push(body)
    }
  }
}

gxa.search('experiments', 'E-MEXP-31')
// gxa.search('files', 'E-MEXP-31')

