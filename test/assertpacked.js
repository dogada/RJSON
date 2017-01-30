/* RJSON unit tests. */
import assert from 'assert';
import { pack } from '../src/index';

export default function testPacked(data, expectedStr, message) {
  const dataStr = JSON.stringify(pack(data));
  assert.equal(dataStr, expectedStr, message);
}
