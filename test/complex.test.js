/* eslint-env node, mocha */
import { assert } from 'chai';
import testPacked from './assertpacked';
import RJSON from '../src/index';

// Send to RJSON.pack primitive values and plain objects or you may receive
// unexpected results.
describe('Complex values', () => {
  it('should work with Complex values', (done) => {
    testPacked(new Date(), '{}', 'new Date');
    testPacked(new Function(), undefined, 'new Function');
    testPacked(() => {}, undefined, 'function () {}');
    testPacked(new String(), '{}', 'new String');
    testPacked(new Number(), '{}', 'new Number');
    testPacked(new Boolean(), '{}', 'new Boolean');
    done();
  });
});

const doc1 = [
    { key1: 1, key2: 2 },
    { key1: 3, key2: 4 },
    { key1: 5, key2: 6, key3: 7 },
    { key1: 8, key2: 9, key3: 10 },
    { key1: 1, key2: 12 },
    { key1: 13, key2: 14, key3: 15 },
];

const doc2 = {
  id: 1,
  items: [
        { key1: 7e5, key2: 'two' },
        { key1: true, key2: false, key3: [0, 1, 2] },
        { key1: null, key2: '', key3: [true, false] },
        { key1: 3, key2: [['X', 'Y'], ['X', 'Z']], key3: ['A', 'B', 'C'] },
        { key1: '', key2: [['X', 'Y']], key3: [[0, 1]] },
        { key1: '', key2: [[['X', 'Y']], ['Z']], key3: [[[0, 1]]] },
        { parent: { key1: '1', key2: 2 } },
        { parent: { key1: '4', key2: 5 } },
    { id: 8,
      creator: { id: 1, name: 'Name1' },
      tags: [{ id: 2, name: 'Tag2' }] },
    { id: 9,
      creator: { id: 2, name: 'Name2' },
      tags: [{ id: 2, name: 'Tag2' }, { id: 3, name: 'Tag3' }] },
    { id: 10,
      creator: null,
      tags: [[{ id: 4, name: 'Tag4' }, { id: 5, name: 'Tag5' }]] },
        { id: 10, creator: { id: 3 }, tags: [] },
        { id: 11, creator: {}, tags: [] },
        { id: 12, creator: {}, tags: [] },
  ],
  box: [[-14.833, -199.035, -30.143], [14.833, 199.035, 0.184]],
};

const doc3 = {
  id: 2,
  data: [{ a: 6, b: 7 }, { b: 8, a: 9 }],
};

const doc4 = { test: [{ b: '1', a: '1' },
                   { b: '2', a: '2' }] };

const docs = [doc1, doc2, doc3, doc4];

describe('More Complex values', () => {
  docs.forEach((doc, i) => {
    it(`Packing and unpacking of doc${i}`, (done) => {
      testPackAndUnpack(doc);
      testDoublePackAndUnpack(doc);
      done();
    });
  });
});

function testPackAndUnpack(data) {
  const dataStr = JSON.stringify(data);
  const packed = RJSON.pack(data);
  const packedStr = JSON.stringify(packed);
  const unpacked = RJSON.unpack(JSON.parse(packedStr));
  assert.deepEqual(data, unpacked, 'Original and unpacked data are identical.');
}

function testDoublePackAndUnpack(data) {
  const dataStr = JSON.stringify(data);
  const packed = RJSON.pack(RJSON.pack(data));
  const packedStr = JSON.stringify(packed);
  const unpacked = RJSON.unpack(RJSON.unpack(JSON.parse(packedStr)));
  assert.deepEqual(data, unpacked, 'Double packed and unpacked data are ok.');
}
