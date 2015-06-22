var expect = require('chai').expect;
var assert = require('chai').assert;

var Withings = require('../lib/withings');

var options;
var client;

before(function (done) {
    options = {
        consumerKey: '1b2fff4f26bfeb92b642fdcf54709e0954d9d21935d3444febf3e1884e973',
        consumerSecret: '2d91017e9212bb0ec47f4de08b8423809537c9fd9f3c0d85d28c5d6b3db',
        callbackUrl: 'amida-tech.com'
    };
    done();
});

describe('Withings API Client:', function () {

    describe('OAuth functionality:', function () {
        
        beforeEach(function (done) {
            client = new Withings(options);
            done();
        });

        it('get an OAuth request token', function (done) {
            client.getRequestToken(function(err, token, tokenSecret) {
                if (err) {
                    done(err);
                }
                expect(token).to.exist;
                expect(tokenSecret).to.exist;
                done();
            });
        });

        it('authorize an end-user', function (done) {
            client.getRequestToken(function(err, token, tokenSecret) {
                if (err) {
                    done(err);
                }
                var url = client.authorizeUrl(token, tokenSecret);
                expect(url).to.exist;
                done();
            });
        });

        xit('generate an access token', function (done) {
            done(); 
        });
        
        xit('error when making an unauthorized API call', function (done) {
            done();
        });

    });
    
    describe('API calls:', function () {
        
        beforeEach(function (done) {
            client = new Withings(options);
            done();
        });
        
        xit('make an API call', function(done){
            done();
        });
        
    });

});

after(function (done) {
    // do some stuff
    done();
});