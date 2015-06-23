var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../lib/withings');

var options;
var client;

before(function (done) {
    options = {
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
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
            var callback = sinon.spy();
            sinon.stub(client._oauth, 'getOAuthRequestToken', function (cb) {
                cb.call(void 0, null, 'token', 'tokenSecret');
            });
            client.getRequestToken(callback);

            expect(callback.calledWith(null, 'token', 'tokenSecret')).to.be.true;

            client._oauth.getOAuthRequestToken.restore();
            done();
        });

        it('generate authorization URL', function (done) {
            var url = client.authorizeUrl('token', 'tokenSecret');
            expect(url).to.exist;
            done();
        });

        it('generate an access token', function (done) {
            var callback = sinon.spy();
            sinon.stub(client._oauth, 'getOAuthAccessToken', function (r, rs, v, cb) {
                expect(r).to.eq('requestToken');
                expect(rs).to.eq('requestTokenSecret');
                expect(v).to.eq('verifier');
                cb.call(void 0, null, 'token', 'tokenSecret');
            });
            client.getAccessToken('requestToken', 'requestTokenSecret', 'verifier', callback);

            expect(callback.calledWith(null, 'token', 'tokenSecret')).to.be.true;

            client._oauth.getOAuthAccessToken.restore();
            done();
        });

        it('error when making an unauthorized API call', function (done) {
            try {
                client.apiCall('https://test.api.endpoint', function () {});
            } catch (ex) {
                expect(ex.message).to.eq('Authenticate before making API calls');
                done();
            }
        });

    });

    describe('API calls:', function () {

        beforeEach(function (done) {
            client = new Withings(options);
            done();
        });

        xit('make an API call', function (done) {
            done();
        });

    });

});

after(function (done) {
    // do some stuff
    done();
});
