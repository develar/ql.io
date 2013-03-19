// Use nodeunit to run this
var testCase = require('nodeunit').testCase,
    EventEmitter = require('events').EventEmitter,
    NodeConfig = require('../lib/node-config'),
    Q = require('q');


// Trap all uncaught exception here.
process.on('uncaughtException', function (error) {
    console.log(error.stack || error);
});

module.exports = testCase({

    setUp:function (callback) {
        callback();
    },

    tearDown:function (callback) {
        callback();
    },

    'load-qa-config-srp':function (test) {
        var emitter = new EventEmitter();
        var deferred = Q.defer();

        emitter.on("config-read", function(message){
            deferred.resolve(message);
        });

        deferred.promise.then(function(message){
            console.log(message);
            test.ok(message, "message shouldn't be null");
            test.equal(message.type, "config-read");
            test.equal(message.message.config, "SRP");
            test.equal(message.properties.length, 2);
        })
        .fail(function(error){
            console.log(error);
        })
        .fin(function(){
            test.done();
        }).done();

        new NodeConfig(process.cwd() + "/test/config", emitter).load({
            "domain":"E|qa.ebay.com",
            "target":"Global",
            "project":"search",
            "config":"SRP",
            "version":"1.0.0"
        });
    }
});

