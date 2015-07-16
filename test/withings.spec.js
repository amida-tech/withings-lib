var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../lib/withings');

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {

    describe('OAuth functionality:', function () {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com'
            };
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

        it('error when making an API call with no user ID', function (done) {
            client.accessToken = 'accessToken';
            client.accessTokenSecret = 'accessTokenSecret';
            try {
                client.apiCall('https://test.api.endpoint', function () {});
            } catch (ex) {
                expect(ex.message).to.eq('API calls require a user ID');
                done();
            }
        });

    });

    describe('API calls:', function () {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                userID: 'userID'
            };
            client = new Withings(options);
            done();
        });

        it('make an API call', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                expect(u).to.contain('https://test.api.endpoint');
                expect(t).to.eq('accessToken');
                expect(ts).to.eq('accessTokenSecret');
                cb.call(void 0, null, data);
            });
            client.apiCall('https://test.api.endpoint', 'get', callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client._oauth.get.restore();
            done();
        });

        it('make a GET request', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            var params = {
                date: 'YYYY-MM-DD'
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                expect(u).to.contain('http://wbsapi.withings.net/v2/measure');
                cb.call(void 0, null, data);
            });
            client.get('measure', 'getactivity', params, callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client._oauth.get.restore();
            done();
        });

        it('make a GET request with no params', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                expect(u).to.contain('http://wbsapi.withings.net/v2/measure');
                cb.call(void 0, null, data);
            });
            client.get('measure', 'getactivity', callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client._oauth.get.restore();
            done();
        });

        it('make a POST request with no params', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            sinon.stub(client._oauth, 'post', function (u, t, ts, cb) {
                expect(u).to.contain('http://wbsapi.withings.net/notify');
                cb.call(void 0, null, data);
            });
            client.post('notify', 'subscribe', callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client._oauth.post.restore();
            done();
        });

    });

    describe('Get Activity measures:', function () {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                userID: 'userID'
            };
            client = new Withings(options);
            done();
        });

        it('getDailySteps', function (done) {
            var data = {
                body: {
                    steps: '5000'
                }
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getDailySteps(new Date(), function (err, steps) {
                expect(steps).to.eq(data.body.steps);
            });

            client._oauth.get.restore();
            done();
        });

        it('getDailySteps error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getDailySteps(new Date(), function (err, steps) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

        it('getDailyCalories', function (done) {
            var data = {
                body: {
                    calories: '3000'
                }
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getDailyCalories(new Date(), function (err, cals) {
                expect(cals).to.eq(data.body.calories);
            });

            client._oauth.get.restore();
            done();
        });

        it('getDailyCalories error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getDailyCalories(new Date(), function (err, cals) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

    });

    describe('Get Body measures:', function () {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                userID: 'userID'
            };
            client = new Withings(options);
            done();
        });

        it('getWeightMeasures', function (done) {
            var data = {
                body: {
                    measuregrps: [{
                        "measures": [{
                            "value": 79300,
                            "type": 1,
                            "unit": -3
                        }]
                    }]
                }
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getWeightMeasures(new Date(), new Date(), function (err, weights) {
                expect(weights).to.eq(data.body.measuregrps);
            });

            client._oauth.get.restore();
            done();
        });

        it('getWeightMeasures error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getWeightMeasures(new Date(), new Date(), function (err, weights) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

        it('getPulseMeasures', function (done) {
            var data = {
                body: {
                    measuregrps: [{
                        "measures": [{
                            "value": 600,
                            "type": 11,
                            "unit": -1
                        }]
                    }]
                }
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getPulseMeasures(new Date(), new Date(), function (err, pulses) {
                expect(pulses).to.eq(data.body.measuregrps);
            });

            client._oauth.get.restore();
            done();
        });

        it('getPulseMeasures error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getPulseMeasures(new Date(), new Date(), function (err, pulses) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

    });

    describe('Get Sleep summary:', function () {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                userID: 'userID'
            };
            client = new Withings(options);
            done();
        });

        it('getSleepSummary', function (done) {
            var data = {
                body: {
                    series: [{
                        "data": {
                            "wakeupduration": 1800,
                            "lightsleepduration": 18540,
                            "deepsleepduration": 8460,
                            "remsleepduration": 10460,
                            "durationtosleep": 420,
                            "durationtowakeup": 360,
                            "wakeupcount": 3
                        },
                        "modified": 1412087110
                    }]
                }
            };
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getSleepSummary(new Date(), new Date(), function (err, series) {
                expect(series).to.eq(data.body.series);
            });

            client._oauth.get.restore();
            done();
        });

        it('getSleepSummary error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getSleepSummary(new Date(), new Date(), function (err, series) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

    });

    describe('Notifications:', function (done) {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                userID: 'userID'
            };
            client = new Withings(options);
            done();
        });

        it('createNotification', function (done) {
            var data = {
                "status": 0
            };
            var cbUrl = 'http://test.url';
            var comment = 'test comment';
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.createNotification(cbUrl, comment, appli, function (err, status) {
                expect(status).to.eq(data.status);
            });

            client._oauth.get.restore();
            done();
        });

        it('createNotification error', function (done) {
            var cbUrl = 'http://test.url';
            var comment = 'test comment';
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.createNotification(cbUrl, comment, appli, function (err, status) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

        it('getNotifications', function (done) {
            var data = {
                "status": 0,
                "body": {
                    "expires": 2147483647,
                    "comment": "test comment"
                }
            };
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getNotification(cbUrl, appli, function (err, body) {
                expect(body).to.eq(data.body);
            });

            client._oauth.get.restore();
            done();
        });

        it('getNotifications error with optional params', function (done) {
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getNotification(cbUrl, function (err, body) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

        it('listNotifications', function (done) {
            var data = {
                "status": 0,
                "body": {
                    "profiles": [{
                        "expires": 2147483647,
                        "comment": "http:\/\/www.withings.com"
                    }, {
                        "expires": 2147483647,
                        "comment": "http:\/\/www.corp.withings.com"
                    }]
                }
            };
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.listNotifications(appli, function (err, profiles) {
                expect(profiles).to.eq(data.body.profiles);
            });

            client._oauth.get.restore();
            done();
        });

        it('listNotifications error with optional params', function (done) {
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.listNotifications(function (err, profiles) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

        it('revokeNotifications', function (done) {
            var data = {
                "status": 0
            };
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.revokeNotification(cbUrl, appli, function (err, status) {
                expect(status).to.eq(data.status);
            });

            client._oauth.get.restore();
            done();
        });

        it('revokeNotifications error with optional params', function (done) {
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client._oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.revokeNotification(cbUrl, function (err, status) {
                expect(err.message).to.eq('ERROR');
            });

            client._oauth.get.restore();
            done();
        });

    });

});
