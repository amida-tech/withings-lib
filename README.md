# withings-lib
[![NPM][npm-image]][npm-url]

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependency Status][daviddm-image]][daviddm-url]

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
        consumerSecret: config.CONSUMER_SECRET,
        callbackUrl: config.CALLBACK_URL
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
        consumerSecret: config.CONSUMER_SECRET,
        callbackUrl: config.CALLBACK_URL,
        userID: req.query.userid
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

// Display today's steps for a user
app.get('/activity/steps', function (req, res) {
    var options = {
        consumerKey: config.CONSUMER_KEY,
        consumerSecret: config.CONSUMER_SECRET,
        accessToken: req.session.oauth.accessToken,
        accessTokenSecret: req.session.oauth.accessTokenSecret,
        userID: req.query.userid
    };
    var client = new Withings(options);

    client.getDailySteps(new Date(), function(err, data) {
        if (err) {
            res.send(err);    
        }
        res.json(data);
    }
});
```

## Client API

### Activity Measures

#### Withings.getDailySteps(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, data)`. The `data` is the integer number of steps the user has taken today.

#### Withings.getDailyCalories(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, data)`. The `data` is the integer number of calories the user has consumed today.

### Body Measures
Body measures return measurement group arrays with the following form. Measures are displayed in scientific notation.
```json
{
    "grpid": <Integer>,
    "date": <UNIX timestamp>,
    "measures": [
       {
           "value": <Integer mantissa>,
           "type": <Ingteger, corresponding to data type>,
           "unit": <Integer exponent>
       }
    ]
}
```

#### Withings.getWeightMeasures(startDate, endDate, callback)
The dates are `Date` objects, and the callback is of the form `function(err, data)`. The `data` is an array of measurement groups.

#### Withings.getPulseMeasures(startDate, endDate, callback)
The dates are `Date` objects, and the callback is of the form `function(err, data)`. The `data` is an array of measurement groups.

### Sleep Summary
Sleep summaries return series arrays with the following form. Durations are displayed in seconds.
```json
{
   "id": <Integer>,
   "startdate": <UNIX timestamp>,
   "enddate": <UNIX timestamp>,
   "date": <YYYY-MM-DD>,
   "data":
   { 
     "wakeupduration": <Integer duration>,
     "lightsleepduration": <Integer duration>,
     "deepsleepduration": <Integer duration>,
     "remsleepduration": <Integer duration>,
     "durationtosleep": <Integer duration>,
     "durationtowakeup": <Integer duration>,
     "wakeupcount": <Integer>
    },
    "modified": <UNIX timestamp>
}
```

#### Withings.getSleepSummary(startDate, endDate, callback)
The dates are `Date` objects, and the callback is of the form `function(err, data)`. The `data` is an array of measurement groups.

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
[coveralls-image]: https://coveralls.io/repos/amida-tech/withings-lib/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/amida-tech/withings-lib?branch=master
[daviddm-image]: https://david-dm.org/amida-tech/withings-lib.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/amida-tech/withings-lib
