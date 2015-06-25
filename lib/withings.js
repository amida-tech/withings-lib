var OAuth = require('oauth');
var qs = require('querystring');
var moment = require('moment');

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

    this.wbsUrl = 'http://wbsapi.withings.net/v2/';
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
client.apiCall = function (url, cb) {
    var that = this;

    if (!this.accessToken || !this.accessTokenSecret) {
        throw new Error('Authenticate before making API calls');
    }
    var signedUrl = this._oauth.signUrl(url, this.accessToken, this.accessTokenSecret);
    this._oauth.get(signedUrl, this.accessToken, this.accessTokenSecret, function (err, data, res) {
        cb.call(that, err, data);
    });
};

client.get = function (service, action, params, cb) {
    if (!cb) {
        cb = params;
        params = {};
    }
    params.action = action;

    var url = this.wbsUrl + service + '?' + qs.stringify(params);
    this.apiCall(url, cb);
};

// Get Activity Measures
client.getDailySteps = function (date, cb) {
    var params = {
        userid: this.userid,
        date: moment(date).format('YYYY-MM-DD')
    };
    this.get('measure', 'getactivity', params, function (err, data) {
        if (err) {
            cb(err);
        }
        cb(null, data.body.steps);
    });
};

client.getDailyCalories = function (date) {

};

// Get Body Measures
client.getWeightMeasures = function (startDate, endDate) {

};

client.getPulseMeasures = function (startDate, endDate) {

};

// Get Sleep Summary
client.getSleepSummary = function (startDate, endDate) {

};
