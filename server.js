'use strict';

var express = require('express');
var validUrl = require('valid-url');
var storage = require('node-persist');
var urllib = require('url');

var app = express();
require('dotenv').load();

storage.initSync({
    dir:'store'
});

// for new urls to shorten
app.get('/new/*', function (req, res) {
  var url = req.params[0];
  
  // 1. check url for validity
  if(!validUrl.isWebUri(url)) {
    res.json({error: 'Invalid URL'});
  }
  else {
    // 2. add to db
    var nextIndex = storage.length() + 1;
    storage.setItemSync(String(nextIndex), url);
    // 3. send response with url info
    res.json({
      original_url: url,
      short_url: urllib.format({ protocol: req.protocol, host: req.get('host')}) + '/' + nextIndex
    });
  }

});

// for redirects
app.get('/:id', function(req, res) {
  // 1. search db for url linked to id param
  var url = storage.getItemSync(String(req.params.id));
  if (url) {
    // 2. send redirect response to url
    res.redirect(url);
  }
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});