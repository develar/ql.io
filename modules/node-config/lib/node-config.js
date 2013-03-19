/**
 * https://wiki.vip.corp.ebay.com/display/RAPTOR/App+Data+1.2#AppData12-MongoServiceforusersofRaptorConfigMongoService
 *
 * @type {*}
 */

var loadConfig = function(root, message, self){
    var domain = root[message.domain];
    var target = domain[message.target];
    var project = target[message.project];
    var config = project[message.config];
    var version = config[message.version];

    self.emit({
        type:"config-read",
        message:message,
        properties:version
    });
};

//constructor
var NodeConfig = module.exports = function(dir, emitter){

    var self = this;
    //for persistence/coldcache purpose.
    self._dir = dir;

    if(emitter){
        self._emitter = emitter;
        self._emitter.on("read-config", function(message){
            self.load(message);
        });
        self.emit = function(message){
            self._emitter.emit("config-read", message);
        }
    }
    else{
        self.emit = function(message){
            process.send(message);
        }
    }

    process.env["NODE_CONFIG_DIR"] = dir;
    self._config = require("config");
};

//main api
NodeConfig.prototype.load = function(message){

    var self = this;
    loadConfig(self._config, message, self);

    self._config.watch(self._config, null, function(obj, prop, oldValue, newValue){
        loadConfig(self._config, message, self);
    });
};
