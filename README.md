# withings-lib
[![NPM][npm-image]][npm-url]

[![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

Withings API library for node.js


## Install

```sh
$ npm install --save withings-lib
```


## Usage

```js
var express = require('express')
var config = require('./config/app')
var app = express()
var Withings = require('withings-lib');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session({secret: 'bigSecret'}));
app.listen(3000);

// OAuth flow
app.get('/', function (req, res) {
    // Create an API client and start authentication via OAuth
    var options = {
        consumerKey: config.CONSUMER_KEY,
        consumerSecret: config.CONSUMER_SECRET
    };
    var client = new Withings(options);

    client.getRequestToken(function (err, token, tokenSecret) {
        if (err) {
            // Throw error
            return;
        }

        req.session.oauth = {
            requestToken: token,
            requestTokenSecret: tokenSecret
        };
        
        res.redirect(client.authorizeUrl(token, tokenSecret));
    });
});

// On return from the authorization
app.get('/oauth_callback', function (req, res) {
    var verifier = req.query.oauth_verifier
    var oauthSettings = req.session.oauth
    var options = {
        consumerKey: config.CONSUMER_KEY,
        consumerSecret: config.CONSUMER_SECRET
    };
    var client = new Withings(options);

    // Request an access token
    client.getAccessToken(oauthSettings.requestToken, oauthSettings.requestTokenSecret, verifier,
        function (err, token, secret) {
            if (err) {
                // Throw error
                return;
            }

            oauthSettings.accessToken = token;
            oauthSettings.accessTokenSecret = secret;

            res.redirect('/activity');
        }
    );
});

// Display the activity measures log for a user
app.get('/activity', function (req, res) {
    var options = {
        consumerKey: config.CONSUMER_KEY,
        consumerSecret: config.CONSUMER_SECRET,
        accessToken: req.session.oauth.accessToken,
        accessTokenSecret: req.session.oauth.accessTokenSecret
    };
    var client = new Withings(options);

    client.get('measure', 'getactivity', {userid: 'amida'}, function(err, data) {
        if (err) {
            // Throw error
            return;
        }
        
        res.send('Activity log: ' + data.body);
    });
});
```

## Contributing

Contributions are welcome. See issues [here](https://github.com/amida-tech/withings-lib/issues).

## Release Notes

See release notes [here](./RELEASENOTES.md).

## License

Licensed under [Apache 2.0](./LICENSE).


[npm-image]: https://nodei.co/npm/withings-lib.png
[npm-url]: https://nodei.co/npm/withings-lib/
[travis-image]: https://travis-ci.org/amida-tech/withings-lib.svg?branch=master
[travis-url]: https://travis-ci.org/amida-tech/withings-lib
[daviddm-image]: https://david-dm.org/amida-tech/withings-lib.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/amida-tech/withings-lib
