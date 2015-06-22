var OAuth = require('oauth');
var _ = require('lodash');

// Resources

// API Endpoints
var endpoints = {
    requestToken: 'https://oauth.withings.com/account/request_token',
    accessToken: 'https://oauth.withings.com/account/access_token',
    authorize: 'https://oauth.withings.com/account/authorize'
};

// OAuth API Client
var WithingsClient = function(options) {
    
    this._oauth = new OAuth.OAuth(
        endpoints.requestToken,
        endpoints.accessToken,
        options.consumerKey,
        options.consumerSecret,
        '1.0',
        null,
        'HMAC-SHA1'
    );
    
    // Store authenticated access if it exists
    if (options.accessToken) {
        this.accessToken = options.accessToken;
        this.accessTokenSecret = options.accessTokenSecret;
    } 
};

var client = WithingsClient.prototype;
module.exports = WithingsClient;

// Authentication
client.getRequestToken = function(cb) {
    this._oauth.getOAuthRequestToken(cb);
};

client.authorizeUrl = function(token, tokenSecret) {
    return this._oauth.signUrl(endpoints.authorize, token, tokenSecret);
};

client.getAccessToken = function(token, tokenSecret, verifier, cb) {
    this._oauth.getOAuthAccessToken(token, tokenSecret, verifier, cb);
};


// API Methods