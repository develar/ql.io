var EventEmitter = require("events").EventEmitter,
    Builder = require("../app.js"),
    cluster = require("cluster");

module.exports = {

    "test-app": function(test){

        var emitter = new EventEmitter();
        emitter.on("read-config", function(message){

            emitter.emit("config-read", {
                "type":"config-read",
                "properties":[{
                    "key":"k1",
                    "context": {"site":"en-US"},
                    "value":"v1"
                }
                ,{
                    "key":"k1",
                    "context": {"site":"de-DE"},
                    "value":"v2"
                }],
                "validContexts":["site"]
            });
        });

        var builder = new Builder("", {

        }, emitter);

        builder.build(function(config){

            test.ok(config, "config cannot be null!");
            test.equals(config.get("k1"), "v1");
            console.log(config.get("k1"));

            test.done();
        }, function(error){

            test.fail(error);
            test.done();
        });
    },

    "test-app-cluster": function(test){

        if(cluster.isMaster){

            var worker = cluster.fork();
            worker.on('message', function(message){
                worker.send({
                    "type":"config-read",
                    "properties":[{
                        "key":"k1",
                        "context": {"site":"en-US"},
                        "value":"v1"
                    }
                        ,{
                            "key":"k1",
                            "context": {"site":"de-DE"},
                            "value":"v2"
                        }],
                    "validContexts":["site"]
                });
            });

            var timeOut = setTimeout(function(){
                worker.kill('SIGTERM');
            }, 5000);

            cluster.on('exit', function(worker, code, signal) {
                test.done();
            });
        }
        else{

            var builder = new Builder("", {});
            builder.build(function(config){
                test.ok(config, "config cannot be null!");
                test.equals(config.get("k1"), "v1");
                console.log(config.get("k1"));

            }, function(error){
                test.fail(error);
            });
        }
    }
};