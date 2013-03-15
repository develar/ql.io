var ContextConfiguration = require("../context-configuration.js");

module.exports = {

    "test-context-configuration": function(test){
        var config = new ContextConfiguration([], []);
        config.append({
            "key":"k1",
            "value":"v1"
        });

        test.equals(config.get("k1"), "v1");

        console.log(config.get("k1"));

        test.done();
    },

    "test-context-configuration-complex": function(test){

        var config = new ContextConfiguration([], ["site"]);
        config.append({
            "key":"k1",
            "context": {"site":"en-US"},
            "value":"v1"
        });
        config.append({
            "key":"k1",
            "context": {"site":"de-DE"},
            "value":"v2"
        });

        test.equals(config.get("k1", [{"site":"en-US"}]), "v1");
        console.log(config.get("k1", [{"site":"en-US"}]));

        test.equals(config.get("k1", [{"site":"de-DE"}]), "v2");
        console.log(config.get("k1", [{"site":"de-DE"}]));

        test.done();
    },

    "test-context-configuration-ultimate": function(test){

        var config = new ContextConfiguration([], ["site", "page"]);
        config.append({
            "key":"k1",
            "context": {"site":"en-US", "page":"1"},
            "value":"v1"
        });
        config.append({
            "key":"k1",
            "context": {"site":"de-DE", "page":"5"},
            "value":"v2"
        });

        test.equals(config.get("k1", [[{"site":"en-US"}, {"page":"5"}], [{"site":"en-US"}, {"page":"1"}]]), "v1");
        test.equals(config.get("k1", [[{"site":"de-DE"}, {"page":"5"}]]), "v2");

        test.done();
    }
};