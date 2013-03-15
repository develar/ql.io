
var Q = require('q'),
    cluster = require('cluster'),
    ContextConfiguration = require('./context-configuration.js');

var ConfigurationBuilder = module.exports = function(dir, ref, emitter){

    this._dir = dir;
    this._ref = ref;
    this._emitter = emitter;
    this._isCluster = !emitter;
};

ConfigurationBuilder.prototype.build = function(callback, onError){

    var self = this;
    var ref = self._ref;
    var deferred = Q.defer();
    var timeOut = setTimeout(function(){
        deferred.reject("timeout after 3s");//timeout
    }, 3000);//TIME OUT IN 3 SECONDS

    if(self._isCluster){
        //this is a slave, and master would do the hard work
        process.on("message", function(message){
            if(message.type === "config-read"){
                clearTimeout(timeOut);
                deferred.resolve(new ContextConfiguration(message.properties, message.validContexts || []));
            }
        });

        process.send({
            "type":"read-config",
            "pid":process.pid,
            "domain":ref.domain,
            "target":ref.target,
            "project":ref.project,
            "config":ref.config,
            "version":ref.version
        });
    }
    else{
        var emitter = self._emitter;
        emitter.on("config-read", function(message){
            if(message.type === "config-read"){
                clearTimeout(timeOut);
                deferred.resolve(new ContextConfiguration(message.properties, message.validContexts || []));
            }
        });

        emitter.emit("read-config", {
            "type":"read-config",
            "pid":process.pid,
            "domain":ref.domain,
            "target":ref.target,
            "project":ref.project,
            "config":ref.config,
            "version":ref.version
        });
    }

    deferred.promise
        .then(callback)
        .fail(onError || function(){/*do nothing*/})
        .done();
    return deferred.promise;
};