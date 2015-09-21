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

            res.redirect('/activity/steps');
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

### Notifications
For notifications requests, parameters should be used as follows:

- callbackUrl
	- The URL the API notification service will call. This URL will be used as a key whenever one needs to list it or revoke it. 
WBS API notifications are merely HTTP POST requests to this URL (such as http://www.yourdomain.net/yourCustomApplication.php?userid=123456&startdate=1260350649 &enddate=1260350650&appli=44).
Those requests contain startdate and enddate parameters (both are integers in EPOCH format) and the userid it refers to. It is up to the targeted system to issue a measure/getmeas request using both figures to retrieve updated data.
The payload for each `appli` type is as follows:
		- 1 (Body Scale) : userid=123545&startdate=1411002541&enddate=1411002542
		- 4 (Blood pressure monitor) : userid=123545&startdate=1411002541&enddate=1411002542
		- 16 (Withings pulse) : userid=123545&date=2014-06-08
		- 44 (Sleep monitor) : userid=123545&startdate=1411002541&enddate=1411003542

- comment
	- The comment string is used as a description displayed to the user when presenting the notification setup.

- appli
	- The value for this parameter is a number, which corresponds to:
		- 1: Weight
		- 4: Heart Rate, Diastolic pressure, Systolic pressure, Oxymetry
		- 16: Activity Measure ( steps, calories, distance, elevation)
		- 44: Sleep

#### Withings.createNotification(callbackUrl, comment, appli, cb)
A notification lets your system be informed every time new data is available for a user.
Withings will call a provided url every time the user syncs its withings device with its account.
Returns the status of the POST request.

#### Withings.getNotification(callbackUrl, appli, cb)
Allows third party applications to check whether the notification service was previously subscribed 
on a specific user and to retrieve the subscription expiration date.
Returns the notification expiration date and comment.

#### Withings.listNotifications(appli, cb)
List notification configurations for a user.
Returns an array of notifications with expiration date and comment.

#### Withings.revokeNotification(callbackUrl, appli, cb)
Allows third party applications to revoke a previously subscribed notification.
This will disable the notification feature between the WBS API and the specified applications for a user.
Returns the status of the GET request.

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
