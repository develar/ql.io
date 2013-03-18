var assert = require("assert"),
    _ = require("underscore");
    
//constructor
var BitSet = module.exports = function() {
    this._words = [];
};

var BITS_OF_A_WORD = 32,
    SHIFTS_OF_A_WORD = 5;

/**
 *
 * @param pos
 * @return {Number} the index at the words array
 */
var whichWord = function(pos){
    return pos >> SHIFTS_OF_A_WORD;
};

/**
 *
 * @param pos
 * @return {Number} a bit mask of 32 bits, 1 bit at pos % 32 set as 1, the rest being 0
 */
var mask = function(pos){
    return 1 << (pos & 31);
}

BitSet.prototype.set = function(pos) {

    assert.ok(pos >= 0, "position must be non-negative");

    var which = whichWord(pos),
        words = this._words;
    return words[which] = words[which] | mask(pos);
};

BitSet.prototype.clear = function(pos) {

    assert.ok(pos >= 0, "position must be non-negative");

    var which = whichWord(pos),
        words = this._words;
    return words[which] = words[which] & ~mask(pos);
};

BitSet.prototype.get = function(pos) {

    assert.ok(pos >= 0, "position must be non-negative");

    var which = whichWord(pos),
        words = this._words;
    return words[which] & mask(pos);
};

BitSet.prototype.words = function() {
    return this._words.length;
};

/**
 * count all set bits
 * @return {Number}
 *
 * this is much faster than BitSet lib of CoffeeScript, it fast skips 0 value words
 */
BitSet.prototype.cardinality = function() {
    var next, sum = 0, maxWords = this.words();
    for(next = 0; next < maxWords; next += 1){
        var nextWord = this._words[next] || 0;
        if(nextWord !== 0){
            //this loops only the number of set bits, not 32 constant all the time!
            for(var bits = nextWord; bits !== 0; bits &= (bits - 1)){
                sum += 1;
            }
        }
    }
    return sum;
};

BitSet.prototype.or = function(set) {
    if (this === set){
        return this;
    }

    var next, commons = Math.min(this.words(), set.words());
    for (next = 0; next < commons; next += 1) {
        this._words[next] = (this._words[next] || 0) | (set._words[next] || 0);
    }
    if (commons < set.words()) {
        this._words = this._words.concat(set._words.slice(commons, set.words()));
    }
    return this;
};

/**
 *
 * @param set
 * @return {BitSet} this BitSet after and operation
 *
 * this is much more performant than CoffeeScript's BitSet#and operation because we'll chop the zero value words at tail.
 */
BitSet.prototype.and = function(set) {
    if (this === set) {
        return this;
    }

    var next,
        commons = Math.min(this.words(), set.words()),
        words = this._words;

    for (next = 0; next < commons; next += 1) {
        words[next] = (words[next] || 0) & (set._words[next] || 0);
    }
    if(commons > set.words()){
        _.each(_.range(commons, set.words()), function(elem){
            words.pop();//using pop instead of assign zero to reduce the length of the array, and fasten the subsequent #and operations.
        });
    }
    return this;
};

BitSet.prototype.xor = function(set) {
    var next, commons = Math.min(this.words(), set.words());
    for (next = 0; next < commons; next += 1) {
        this._words[next] = (this._words[next] || 0) ^  (set._words[next] || 0);
    }

    if(commons < set.words()){
        var maxWords = set.words();
        for(next = commons; next < maxWords; next += 1){
            this._words[next] = (set._words[next] || 0) ^ 0;
        }
    }
    else{
        var maxWords = this.words();
        for(next = commons; next < maxWords; next += 1){
            this._words[next] = (this._words[next] || 0) ^ 0;
        }
    }
    return this;
};

/**
 * this is the critical piece missing from CoffeeScript's BitSet lib, we usually just need to know the next set bit if any.
 * it fast skips 0 value word as #cardinality does, this is esp. important because of our usage, after series of #and operations
 * it's highly likely that most of the words left are zero valued, and by skipping all of such, we could locate the actual bit set much faster.
 * @param pos
 * @return {*}
 */
BitSet.prototype.nextSetBit = function(pos){
    //the very first word
    var next = whichWord(pos),
        words = this._words,
        firstWord = words[next] || 0,
        maxWords = this.words(),
        bit;
    if(firstWord){
        for(bit = pos & 31; bit < BITS_OF_A_WORD; bit += 1){
            if((firstWord & mask(bit))){
                return (next << SHIFTS_OF_A_WORD) + bit;
            }
        }
    }
    for(next = next + 1; next < maxWords; next += 1){
        var nextWord = words[next] || 0;
        if(nextWord){
            for(bit = 0; bit < BITS_OF_A_WORD; bit += 1){
                if((nextWord & mask(bit)) !== 0){
                    return (next << SHIFTS_OF_A_WORD) + bit;
                }
            }
            //shouldn't ever come here
        }
    }
    return -1;
};
