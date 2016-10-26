// # bionode-gxa

// ## Usage
// See the methods below.
var gxa = module.exports

var fs = require('fs');
var path = require('path');
var through = require('through2');
var pumpify = require('pumpify');
var concat = require('concat-stream');
var request = require('request');
var JSONStream = require('JSONStream');

var PROXY = typeof window !== 'undefined' ? 'http://cors.inb.io/' : ''
var APIROOT = PROXY + 'http://www.ebi.ac.uk/arrayexpress/json/v2/'

// ## Search
// Search the GXA database and return a JSON
// 
// Examples:
//   // Search the experiments associated with the accession number E-MEXP-31 
//   // and pipe into the STDout
//      - gxa.search('experiments', 'E-MEXP-31').pipe(process.stdout)
//   // Search for the files associated with the accession number E-MEXP-31
//      - gxa.search('files', 'E-MEXP-31')
// 
// Arguments: 
//   - db: Can be either 'files' or 'experiments'
//   - term: the accession number (e.g. E-MEXP-31) that you want to search
// 
//   - cb: a callback
//
// Output:
//   - JSON - JSON object (that can then be piped into )
gxa.search = function(db, term, cb) {
  var opts = { db: db, term: term }
  cb = typeof term === 'function' ? term : cb

  var stream = pumpify.obj(
    createAPISearchUrl(opts.db, opts.term),
    sendRequest() // Returns a JSON object
  )

  if (opts.term) { stream.write(opts.term); stream.end() }
  if (cb) { stream.pipe(concat(cb)) } else { return stream }
}

// ## Download
// - Download all the related files for a accession number
// 
// Examples:
//   // Download all the associated files to accession number ('E-MEXP-31')
//   // into a folder named 'out'
//      - gxa.download('E-MEXP-31', 'out')
// 
// Arguments:
//   - term: the accession number (e.g. E-MEXP-31) that you want to search
// 
//   - folder: (optional) the output directory. By default, this is the current
//     working directory
//   - cb: a callback
//
// Output:
//   - Files are written directly to disk.

gxa.download = function(term, folder, cb) {
  var opts = { term: term, folder: folder }
  if (typeof folder === 'function') {
    cb = folder
    opts.folder = '.'
  }
  // TODO: Ideally would pipe gxa.search('files', term) into the stream rather
  //  than repeating the steps in gxa.search here as well.
  var stream = pumpify.obj(
    createAPISearchUrl('files', opts.term),
    sendRequest(),
    JSONStream.parse(),
    parsing(),
    fileDownload(opts.folder)
  )
  if (opts.term) { stream.write(opts.term); stream.end() }
  if (cb) { stream.pipe(concat(cb)) } else { return stream }

  function parsing () {
    var stream = through.obj(transform)
    return stream;

    function transform (data, enc, next) {
      var self = this
      data.files.experiment.file.forEach(fileData => self.push(fileData) )
      next()
    }
  }

  function fileDownload (folder) {
    var stream = through.obj(transform)
    return stream;

    function transform (fileData, enc, next) {
      url = fileData.url
      file = path.join(folder, fileData.name)
      createDir(folder);

      request(url)
        .pipe(fs.createWriteStream(file))
        .on('finish', next)
    }
    
    function createDir (path, mask, cb) {
      if (typeof mask == 'function') { cb = mask; mask = 0777; }

      fs.mkdir (path, mask, function(err) {
        if (err && err.code !== 'EEXIST') {
          process.stdout.write("Unable to create output directory")
        }
        if (cb) cb(null);
      });
    }
  }
}

// Generates a URL (using the GXA API) that is used to search the GXA database
function createAPISearchUrl (db, term) {
  var stream = through.obj(transform)
  return stream

  function transform (obj, enc, next) {
    var query = APIROOT + db + '?keywords=' + encodeURI(obj.toString().replace(/['"]+/g, ''))
    this.push(query)
    next()
  }
}

// SendRequest
// - Internal function used to request a URL in a STREAM friendly manner
function sendRequest() {
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
