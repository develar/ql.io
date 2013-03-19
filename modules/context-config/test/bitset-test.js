var BitSet = require("../bitset.js"),
    _ = require("underscore");

module.exports = {

    "test-bitset": function(test){

        var i = 0;
        var bits = new BitSet();

        var begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 1){
            bits.set(i);
        }
        console.log("set 1,000,000 times using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 2){
            bits.clear(i);
        }
        console.log("clear 500,000 times using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        test.equals(500000, bits.cardinality());
        console.log("cardinality using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 1){
            test.ok(i & 1 ? bits.get(i) : !bits.get(i));
        }
        console.log("get 1,000,000 using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 1){
            test.equals(i & 1 ? i : i + 1, bits.nextSetBit(i));
        }
        console.log("nextSetBit 1,000,000 using " + (new Date().getTime() - begin) + "ms\n");

        test.done();
    },

    "test-bitset-sparse": function(test){

        var i = 0;
        var bits = new BitSet();

        var begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 10){
            bits.set(i);
        }
        console.log("set 100,000 times using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 20){
            bits.clear(i);
        }
        console.log("clear 50,000 times using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        test.equals(50000, bits.cardinality());
        console.log("cardinality using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 1){
            bits.get(i)
        }
        console.log("get 1,000,000 using " + (new Date().getTime() - begin) + "ms\n");

        begin = new Date().getTime();
        for(var i = 0; i < 1000000; i += 1){
            bits.nextSetBit(i);
        }
        console.log("nextSetBit 1,000,000 using " + (new Date().getTime() - begin) + "ms\n");

        test.done();
    }
};