var OAuth = require('oauth');
var request = require('request');
var https = require('https');
var CryptoJS = require('crypto-js');
var base64_encode = require('base64').encode;
var urlencode = require('urlencode');

function generateNonce(){ return CryptoJS.MD5(""+Math.random());}
function generateOAuthTimestamp(){ return Math.round((new Date()).getTime()/1000);}

function getRequestToken(options, cb) {
        
    var baseUrl = 'https://oauth.withings.com/account/request_token';
    var nonce = generateNonce();
    var timestamp = generateOAuthTimestamp();
    
    var queryString = 'oauth_callback=' + options.oauthCallback +
        '&oauth_consumer_key=' + options.oauthConsumerKey +
        '&oauth_nonce=' + nonce +
        '&oauth_signature_method=HMAC-SHA1' +
        '&oauth_timestamp=' + timestamp +
        '&oauth_version=1.0';
    
    var baseString = 'GET&' + urlencode(baseUrl) + '&' + urlencode(queryString);

    var hash = CryptoJS.HmacSHA1(baseString, options.oauthConsumerSecret + '&');
    var hash64 = CryptoJS.enc.Base64.stringify(hash);
    var signature = urlencode(hash64);
    
    request(baseUrl +
        '?oauth_callback=' + options.oauthCallback +
        '&oauth_consumer_key=' + options.oauthConsumerKey +
        '&oauth_nonce=' + nonce +
        '&oauth_signature_method=HMAC-SHA1' +
        '&oauth_timestamp=' + timestamp +
        '&oauth_version=1.0' + 
        '&oauth_signature=' + signature,
        function(err, res, body) {
            if (!err && res.statusCode === 200) {
                cb(null, res, body);
            } else {
                cb(err, res, body);
            }
    });

}

function authorizeUser() {
    
}

function generateAccessToken() {
    
}



module.exports = {
    getRequestToken: getRequestToken
};