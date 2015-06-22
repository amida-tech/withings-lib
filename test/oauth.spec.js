var expect = require('chai').expect;
var assert = require('chai').assert;
var qs = require('querystring');

var oauth = require('../lib/oauth');

before(function (done) {
    // clear db and other stuff
    done();
});

describe('Withings OAuth functionality:', function() {
    
    xit('get an OAuth request token', function(done) {
        var options = {
            oauthConsumerKey: '1b2fff4f26bfeb92b642fdcf54709e0954d9d21935d3444febf3e1884e973',
            oauthConsumerSecret: '2d91017e9212bb0ec47f4de08b8423809537c9fd9f3c0d85d28c5d6b3db',
            oauthCallback: 'amida-tech.com'
        };
        oauth.getRequestToken(options, function(err, res, body) {
            if (err) {
                done(err);
            } else {
                expect(body).to.contain('oauth_token');
                expect(body).to.contain('oauth_token_secret');
                done();
            }
        });
    });
    
    xit('authorize an end-user', function(done) {
        var options = {
            oauthConsumerKey: '1b2fff4f26bfeb92b642fdcf54709e0954d9d21935d3444febf3e1884e973',
            oauthConsumerSecret: '2d91017e9212bb0ec47f4de08b8423809537c9fd9f3c0d85d28c5d6b3db',
            oauthCallback: 'amida-tech.com'
        };
        oauth.getRequestToken(options, function(err, res, body) {
            if (err) {
                done(err);
            } else {
                expect(body).to.be.a('string');
                var tokens = qs.parse(body);
                options.oauthRequestTokenKey = tokens.oauth_token;
                options.oauthRequestTokenSecret = tokens.oauth_token_secret;
                oauth.authorizeUser(options, function(err, res, body) {
                    if (err) {
                        done(err);
                    } else {
                        expect(body).to.contain('My Withings account');
                        done();
                    }
                });
            }
        });
    });
    
    xit('generate an access token', function(done) {
        
    });
     
});

after(function (done) {
    // do some stuff
    done();
});