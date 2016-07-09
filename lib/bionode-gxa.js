// # bionode-gxa

// ## Usage
// See the methods below.

var gxa = module.exports

var fs =require('fs')
var through = require('through2')
var pumpify = require('pumpify')
var request = require('request');
var JSONStream = require('JSONStream');


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

//gxa.search('experiments', 'E-MEXP-31')
// gxa.search('files', 'E-MEXP-31')

gxa.download = function(db, term, cb) {
  var opts = typeof db === 'string' ? { db: 'files', term: term } : 'files'
  cb = typeof term === 'function' ? term : cb

  var stream = pumpify.obj(
      createAPISearchUrl(opts.db, opts.term),
      sendRequest(),
      JSONStream.parse(),
      parsing(),
      fileDownload()
  )


  if (opts.term) { stream.write(opts.term); stream.end() }
  if (cb) { stream.pipe(concat(cb)) } else { return stream }
}

var parsing = function() {
  var stream = through.obj(transform)
  return stream;

  function transform (data, enc, next) {
    var self = this
    console.log(data.files.experiment.file[0].url)
      self.push(data.files.experiment.file[0].url)
      next()
  }
}


var fileDownload = function() {

    var stream = through.obj(transform)
    return stream;

    function transform (url, enc, next) {
        var self = this
        console.log(url)
        request(url)
            .pipe(fs.createWriteStream('./test.txt'))
            .on('finish', next)
    }

}

var writeFile = function(path){
    var write = fs.createWriteStream(path)
    var source = fs.createReadStream(pull(url))

    process.stdout('Copied successfully')

    pump(source, write, function (err) {

        if (err) return console.error('write error!', err)
        process.stdout('Copied successfully')
    })
}

gxa.download('files', 'E-MEXP-31')