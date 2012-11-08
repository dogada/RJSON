/*
Copyright (c) 2012, Dmytro V. Dogadailo. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/*
RJSON is Recursive JSON.

RJSON converts any JSON data collection into more compact recursive
form. Compressed data is still JSON and can be parsed with `JSON.parse`. RJSON
can compress not only homogeneous collections, but any data sets with free
structure.

RJSON is stream single-pass compressor, it extracts data schemes from a
document, assign each schema unique number and use this number instead of
repeating same property names again and again.

Bellow you can see same document in both forms.

JSON:

{
    "id": 7,
    "tags": ["programming", "javascript"],
    "users": [
    {"first": "Homer", "last": "Simpson"},
    {"first": "Hank", "last": "Hill"},
    {"first": "Peter", "last": "Griffin"}
    ],
    "books": [
    {"title": "JavaScript", "author": "Flanagan", "year": 2006},
    {"title": "Cascading Style Sheets", "author": "Meyer", "year": 2004}
    ]
}

RJSON:

{
    "id": 7,
    "tags": ["programming", "javascript"],
    "users": [
    {"first": "Homer", "last": "Simpson"},
        [2, "Hank", "Hill", "Peter", "Griffin"]
    ],
    "books": [
    {"title": "JavaScript", "author": "Flanagan", "year": 2006},
        [3, "Cascading Style Sheets", "Meyer", 2004]
    ]
}

RJSON allows to:

* reduce JSON data size and network traffic when gzip isn't available. For
example, in-browser 3D-modeling tools like [Mydeco
3D-planner](http://mydeco.com/3d-planner/) may process and send to server
megabytes of JSON-data;
* analyze large collections of JSON-data without
unpacking of whole dataset. RJSON-data is still JSON-data, so it can be
traversed and analyzed after parsing and fully unpacked only if a document meets
some conditions.

*/

var RJSON = (function() {
    'use strict';

    var hasOwnProperty = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    getKeys = Object.keys || _keys,
    isArray = Array.isArray || _isArray;

    /**
     * @param {*} Any valid for JSON javascript data.
     * @return {*} Packed javascript data, usually a dictionary.
     */
    function pack(data) {
        var schemas = {}, maxSchemaIndex = 0;

        function encode(value) {
            var encoded, i, j, k, v, current, last, len,
            schema, schemaKeys, schemaIndex;
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            }

            if (isArray(value)) {
                len = value.length;
                if (len === 0) {
                    return [];
                }
                encoded = [];
                if (typeof value[0] === 'number') {
                    encoded.push(0);  // 0 is schema index for Array
                }
                for (i = 0; i < len; i++) {
                    v = value[i];
                    current = encode(v);
                    last = encoded[encoded.length - 1];
                    if (isEncodedObject(current) &&
                        isArray(last) && current[0] === last[0]) {
                        // current and previous object have same schema,
                        // so merge their values into one array
                        encoded[encoded.length - 1] =
                            last.concat(current.slice(1));
                    } else {
                        encoded.push(current);
                    }
                }
            } else {
                schemaKeys = getKeys(value).sort();
                if (schemaKeys.length === 0) {
                    return {};
                }
                schema = schemaKeys.length + ':' + schemaKeys.join('|');
                schemaIndex = schemas[schema];
                if (schemaIndex) { // known schema
                    encoded = [schemaIndex];
                    for (i = 0, k; k = schemaKeys[i++]; ) {
                        encoded[i] = encode(value[k]);
                   }
                } else {    // new schema
                    schemas[schema] = ++maxSchemaIndex;
                    encoded = {};
                    for (i = 0, k; k = schemaKeys[i++]; ) {
                        encoded[k] = encode(value[k]);
                    }
                }
            }
            return encoded;
        }

        return encode(data);
    }

    /**
     * @param {*} data Packed javascript data.
     * @return {*} Original data.
     */
    function unpack(data) {
        var schemas = {}, maxSchemaIndex = 0;

        function decode(value) {
            var decoded, i, j, k, v, obj, schemaKeys, schemaLen, total, len;
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            }

            if (isArray(value)) {
                len = value.length;
                if (len === 0) {
                    decoded = [];
                } else if (value[0] === 0 || typeof value[0] !== 'number') {
                    decoded = []; // decode array of something
                    for (i = (value[0] === 0 ? 1 : 0); i < len; i++) {
                        v = value[i];
                        obj = decode(v);
                        if (isEncodedObject(v) && isArray(obj)) {
                            // several objects was encoded into single array
                            decoded = decoded.concat(obj);
                        } else {
                            decoded.push(obj);
                        }
                    }
                } else {
                    schemaKeys = schemas[value[0]];
                    schemaLen = schemaKeys.length;
                    total = (value.length - 1) / schemaLen;
                    if (total > 1) {
                        decoded = []; // array of objects with same schema
                        for (i = 0; i < total; i++) {
                            obj = {};
                            for (j = 0; k = schemaKeys[j++]; ) {
                                obj[k] = decode(value[i * schemaLen + j]);
                            }
                            decoded.push(obj);
                        }
                    } else {
                        decoded = {};
                        for (j = 0, k; k = schemaKeys[j++]; ) {
                            decoded[k] = decode(value[j]);
                        }
                    }
                }

            } else { // new schema
                schemaKeys = getKeys(value).sort();
                if (schemaKeys.length === 0) {
                    return {};
                }
                schemas[++maxSchemaIndex] = schemaKeys;
                decoded = {};
                for (i = 0, k; k = schemaKeys[i++]; ) {
                    decoded[k] = decode(value[k]);
                }
            }
            return decoded;
        }

        return decode(data);
    }

    /**
     * Object is encoded as array and object schema index is stored as
     * first item of the array. Valid schema index should be greater than 0,
     * because 0 is reserved for Array schema.
     * Several objects with same schema can be stored in the one array.
     * @param {*} value encoded value to check.
     * @return {boolean} true if value contains an encoded object or several
     * objects with same schema.
     */
    function isEncodedObject(value) {
        return isArray(value) && typeof value[0] === 'number' && value[0] !== 0;
    }

    function _keys(obj) {
        var keys = [], k;
        for (k in obj) {
            if (hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    function _isArray(obj) {
        return toString.apply(obj) === '[object Array]';
    }

    return {
        pack: pack,
        unpack: unpack
    };

}());


// export for node.js
if(typeof module != 'undefined' && module.exports) {
    module.exports = RJSON;
}
