var OAuth = require('oauth');
var qs = require('querystring');
var moment = require('moment');

/*
 * Available API methods:
 *
 * - OAuth
 *   - getRequestToken
 *   - authorizeUrl
 *   - getAccessToken
 *
 * - Measures
 *   - getDailySteps
 *   - getDailyCalories
 *   - getWeightMeasures
 *   - getPulseMeasures
 *   - getSleepSummary
 *
 * - Notifications
 *   - createNotification
 *   - getNotification
 *   - listNotifications
 *   - revokeNotification
 */

// API Endpoints
var endpoints = {
    requestToken: 'https://oauth.withings.com/account/request_token',
    accessToken: 'https://oauth.withings.com/account/access_token',
    authorize: 'https://oauth.withings.com/account/authorize'
};

// OAuth API Client
var WithingsClient = function (options) {

    this._oauth = new OAuth.OAuth(
        endpoints.requestToken,
        endpoints.accessToken,
        options.consumerKey,
        options.consumerSecret,
        '1.0',
        options.callbackUrl,
        'HMAC-SHA1'
    );

    // Store authenticated access if it exists
    if (options.accessToken) {
        this.accessToken = options.accessToken;
        this.accessTokenSecret = options.accessTokenSecret;
    }

    // Store a user ID if it exists
    if (options.userID) {
        this.userID = options.userID;
    }

};

var client = WithingsClient.prototype;
module.exports = WithingsClient;

// Authentication
client.getRequestToken = function (cb) {
    this._oauth.getOAuthRequestToken(cb);
};

client.authorizeUrl = function (token, tokenSecret) {
    return this._oauth.signUrl(endpoints.authorize, token, tokenSecret);
};

client.getAccessToken = function (token, tokenSecret, verifier, cb) {
    this._oauth.getOAuthAccessToken(token, tokenSecret, verifier, cb);
};

// API Base Methods
client.apiCall = function (url, method, cb) {
    var that = this;

    if (!this.accessToken || !this.accessTokenSecret) {
        throw new Error('Authenticate before making API calls');
    }
    if (!this.userID) {
        throw new Error('API calls require a user ID');
    }

    var signedUrl = this._oauth.signUrl(url, this.accessToken, this.accessTokenSecret);

    if (method === 'get') {
        this._oauth.get(signedUrl, this.accessToken, this.accessTokenSecret, function (err, data, res) {
            cb.call(that, err, data);
        });
    }
    if (method === 'post') {
        this._oauth.post(signedUrl, this.accessToken, this.accessTokenSecret, function (err, data, res) {
            cb.call(that, err, data);
        });
    }
};

client.get = function (service, action, params, cb) {
    if (!cb) {
        cb = params;
        params = {};
    }
    params.action = action;
    params.userid = this.userID;

    var baseUrl;
    if (action === 'getmeas') {
        baseUrl = 'http://wbsapi.withings.net/';
    } else {
        baseUrl = 'http://wbsapi.withings.net/v2/';
    }

    var url = baseUrl + service + '?' + qs.stringify(params);
    this.apiCall(url, 'get', cb);
};

client.post = function (service, action, params, cb) {
    if (!cb) {
        cb = params;
        params = {};
    }
    params.action = action;
    params.userid = this.userID;

    var baseUrl = 'http://wbsapi.withings.net/';

    var url = baseUrl + service + '?' + qs.stringify(params);
    this.apiCall(url, 'post', cb);
};

// Get Activity Measures
client.getDailyActivity = function (date, cb) {
    var params = {
        date: moment(date).format('YYYY-MM-DD')
    };
    this.get('measure', 'getactivity', params, cb);
};

client.getDailySteps = function (date, cb) {
    this.getDailyActivity(date, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body.steps);
    });
};

client.getDailyCalories = function (date, cb) {
    this.getDailyActivity(date, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body.calories);
    });
};

// Get Body Measures
client.getMeasures = function (measType, startDate, endDate, cb) {
    var params = {
        startdate: moment(startDate).unix(),
        enddate: moment(endDate).unix(),
        meastype: measType
    };
    this.get('measure', 'getmeas', params, cb);
};

client.getWeightMeasures = function (startDate, endDate, cb) {
    this.getMeasures(1, startDate, endDate, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body.measuregrps);
    });
};

client.getPulseMeasures = function (startDate, endDate, cb) {
    this.getMeasures(11, startDate, endDate, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body.measuregrps);
    });
};

// Get Sleep Summary
client.getSleepSummary = function (startDate, endDate, cb) {
    var params = {
        startdateymd: moment(startDate).format('YYYY-MM-DD'),
        enddateymd: moment(endDate).format('YYYY-MM-DD')
    };
    this.get('sleep', 'getsummary', params, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body.series);
    });
};

// Notifications
client.createNotification = function (callbackUrl, comment, appli, cb) {
    var params = {
        callbackurl: callbackUrl,
        comment: comment,
        appli: appli
    };
    this.post('notify', 'subscribe', params, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.status);
    });
};

client.getNotification = function (callbackUrl, appli, cb) {
    if (!cb) {
        cb = appli;
        appli = null;
    }
    var params = {
        callbackurl: callbackUrl,
    };
    if (appli) {
        params.appli = appli;
    }
    this.get('notify', 'get', params, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body);
    });
};

client.listNotifications = function (appli, cb) {
    if (!cb) {
        cb = appli;
        appli = null;
    }
    var params = {};
    if (appli) {
        params.appli = appli;
    }
    this.get('notify', 'list', params, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.body.profiles);
    });
};

client.revokeNotification = function (callbackUrl, appli, cb) {
    if (!cb) {
        cb = appli;
        appli = null;
    }
    var params = {
        callbackurl: callbackUrl,
    };
    if (appli) {
        params.appli = appli;
    }
    this.get('notify', 'revoke', params, function (err, data) {
        if (err) {
            return cb(err);
        }
        data = JSON.parse(data);
        cb(null, data.status);
    });
};
