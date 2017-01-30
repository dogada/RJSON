/* eslint-env node, mocha */
import testPacked from './assertpacked';

// import * as RJSON from '../src/index';

describe('Primitives', () => {
  it('should work with Primitives', (done) => {
    testPacked('Hello!', '"Hello!"');
    testPacked(true, 'true');
    testPacked(false, 'false');
    testPacked(0, '0');
    testPacked(1, '1');
    testPacked(3.14, '3.14');
    testPacked(2e4, '20000');
    testPacked(null, 'null');
    testPacked(undefined, undefined);
    done();
  });
});

describe('Hashmaps', () => {
  it('should work with Hashmaps', (done) => {
    testPacked({}, '{}');
    testPacked({ a: 1 }, '{"a":1}');
    testPacked({ a: 1, b: 2 }, '{"a":1,"b":2}');
    testPacked({ a: 1, b: ['tag1', 'tag2'] }, '{"a":1,"b":["tag1","tag2"]}');
    testPacked([{ a: 1 }, { b: null }], '[{"a":1},{"b":null}]');
    // schema 1 is {'a': ...}
    testPacked([{ a: 1 }, { a: 7 }], '[{"a":1},[1,7]]');
    testPacked([{ a: 1 }, { a: 7 }, { a: 8 }], '[{"a":1},[1,7,8]]');
    testPacked([{ a: 1 }, { a: 7 }, { a: 8 }, { a: 9 }], '[{"a":1},[1,7,8,9]]');
    testPacked([{ a: 1, b: 2 }, { a: 8, b: 9 }, { a: 10, b: 11 }],
               '[{"a":1,"b":2},[1,8,9,10,11]]');
    // schema 1 is {'id': ..., 'items': ...}
    // schema 2 is {'a': ..., 'b': ...}
    // schema 3 is {'a': ...}
    testPacked({ id: 1,
      items: [{ a: 1, b: 2 }, { a: 8, b: 9 }, { a: 10 }] },
               '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10}]}');
    testPacked({ id: 1,
      items: [{ a: 1, b: 2 }, { a: 8, b: 9 }, { a: 10 }, { a: 11 }, { a: 12 }] },
               '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10},[3,11,12]]}');
    // After packing order of keys may be changed but
    // but restored document will be fully identical to the original document
    testPacked({ test: [{ b: '1', a: '1' }, { b: '2', a: '2' }] },
      '{"test":[{"a":"1","b":"1"},[2,"2","2"]]}');
    done();
  });
});

describe('Arrays', () => {
  it('should work with Arrays', (done) => {
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
    done();
  });
});
