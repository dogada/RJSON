/* RJSON unit tests.
*/

if (typeof require !== 'undefined') {
    RJSON = require('../rjson.js');
}

function testPacked(data, expectedStr, message) {
    equal(JSON.stringify(RJSON.pack(data)), expectedStr, message);
}

test('Primitives', function() {
    testPacked('Hello!', '"Hello!"');
    testPacked(true, 'true');
    testPacked(false, 'false');
    testPacked(0, '0');
    testPacked(1, '1');
    testPacked(3.14, '3.14');
    testPacked(2e4, '20000');
    testPacked(null, 'null');
    testPacked(undefined, undefined);
});

test('Hashmaps', function() {
    testPacked({}, '{}');
    testPacked({a: 1}, '{"a":1}');
    testPacked({a: 1, b: 2}, '{"a":1,"b":2}');
    testPacked({a: 1, b: ['tag1', 'tag2']}, '{"a":1,"b":["tag1","tag2"]}');
    testPacked([{a: 1}, {b: null}], '[{"a":1},{"b":null}]');
    // schema 1 is {'a': ...}
    testPacked([{a: 1}, {a: 7}], '[{"a":1},[1,7]]');
    testPacked([{a: 1}, {a: 7}, {a: 8}], '[{"a":1},[1,7,8]]');
    testPacked([{a: 1}, {a: 7}, {a: 8}, {a: 9}], '[{"a":1},[1,7,8,9]]');
    testPacked([{a: 1, b: 2}, {a: 8, b: 9}, {a: 10, b: 11}],
               '[{"a":1,"b":2},[1,8,9,10,11]]');
    // schema 1 is {'id': ..., 'items': ...}
    // schema 2 is {'a': ..., 'b': ...}
    // schema 3 is {'a': ...}
    testPacked({id: 1,
                items: [{a: 1, b: 2}, {a: 8, b: 9}, {a: 10}]},
               '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10}]}');
    testPacked({id: 1,
                items: [{a: 1, b: 2}, {a: 8, b: 9}, {a: 10}, {a: 11}, {a: 12}]},
               '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10},[3,11,12]]}');
    // After packing order of keys may be changed but
    // but restored document will be fully identical to the original document
    testPacked({'test': [{'b': '1', 'a': '1'}, {'b': '2', 'a': '2'}]},
              '{"test":[{"a":"1","b":"1"},[2,"2","2"]]}');

});

test('Arrays', function() {
    testPacked([], '[]');
    testPacked(['A'], '["A"]');
    testPacked([['A']], '[["A"]]');
    testPacked(['A', 'B', 'C'], '["A","B","C"]');
    testPacked([1, 2, 3], '[0,1,2,3]');
    testPacked([0, 1], '[0,0,1]');
    testPacked([0], '[0,0]');
    testPacked([1], '[0,1]');
    testPacked([1.618, 3.14], '[0,1.618,3.14]');
    testPacked([[1.618, 3.14]], '[[0,1.618,3.14]]');
    testPacked([['X', 'Y'], ['A', 'B']], '[["X","Y"],["A","B"]]');
    testPacked([[1, 2], [3, 4]], '[[0,1,2],[0,3,4]]');
});

// Send to RJSON.pack primitive values and plain objects or you may receive
// unexpected results.
test('Complex values', function() {
    testPacked(new Date(), '{}', 'new Date');
    testPacked(new Function(), undefined, 'new Function');
    testPacked(function() {}, undefined, 'function () {}');
    testPacked(new String(), '{}', 'new String');
    testPacked(new Number(), '{}', 'new Number');
    testPacked(new Boolean(), '{}', 'new Boolean');
});

var doc1 = [
    {key1: 1, key2: 2},
    {key1: 3, key2: 4},
    {key1: 5, key2: 6, key3: 7},
    {key1: 8, key2: 9, key3: 10},
    {key1: 1, key2: 12},
    {key1: 13, key2: 14, key3: 15}
];

var doc2 = {
    'id': 1,
    'items': [
        {'key1': 7e5, 'key2': 'two'},
        {'key1': true, 'key2': false, 'key3': [0, 1, 2]},
        {'key1': null, 'key2': '', 'key3': [true, false]},
        {'key1': 3, 'key2': [['X', 'Y'], ['X', 'Z']], 'key3': ['A', 'B', 'C']},
        {'key1': '', 'key2': [['X', 'Y']], 'key3': [[0, 1]]},
        {'key1': '', 'key2': [[['X', 'Y']], ['Z']], 'key3': [[[0, 1]]]},
        {'parent': {'key1': '1', 'key2': 2}},
        {'parent': {'key1': '4', 'key2': 5}},
        {id: 8, creator: {id: 1, name: 'Name1'},
         tags: [{id: 2, name: 'Tag2'}]},
        {id: 9, creator: {id: 2, name: 'Name2'},
         tags: [{id: 2, name: 'Tag2'}, {id: 3, name: 'Tag3'}]},
        {id: 10, creator: null,
         tags: [[{id: 4, name: 'Tag4'}, {id: 5, name: 'Tag5'}]]},
        {id: 10, creator: {id: 3}, tags: []},
        {id: 11, creator: {}, tags: []},
        {id: 12, creator: {}, tags: []}
    ],
    'box': [[-14.833, -199.035, -30.143], [14.833, 199.035, 0.184]]
};

var doc3 = {
    id: 2,
    data: [{a: 6, b: 7}, {b: 8, a: 9}]
};

var doc4 = {test: [{b: '1', a: '1'},
                   {b: '2', a: '2'}]};

var docs = [doc1, doc2, doc3, doc4];
for (var i = 0, doc; doc = docs[i++];) {
    (function(d) {
        test('Packing and unpacking of doc' + i, function() {
            testPackAndUnpack(d);
            testDoublePackAndUnpack(d);
        });
    })(doc);
}

function testPackAndUnpack(data) {
    var dataStr = JSON.stringify(data),
    packed = RJSON.pack(data),
    packedStr = JSON.stringify(packed),
    unpacked = RJSON.unpack(JSON.parse(packedStr));
    deepEqual(data, unpacked, 'Original and unpacked data are identical.');
}

function testDoublePackAndUnpack(data) {
    var dataStr = JSON.stringify(data),
    packed = RJSON.pack(RJSON.pack(data)),
    packedStr = JSON.stringify(packed),
    unpacked = RJSON.unpack(RJSON.unpack(JSON.parse(packedStr)));
    deepEqual(data, unpacked, 'Double packed and unpacked data are ok.');
}

