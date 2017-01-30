/*
Copyright (c) 2012, Dmytro V. Dogadailo <entropyhacker@gmail.com>

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
  return Array.isArray(value) && typeof value[0] === 'number' && value[0] !== 0;
}

/**
 * @param {*} Any valid for JSON javascript data.
 * @return {*} Packed javascript data, usually a dictionary.
 */
export function pack(data) {
  const schemas = {};
  let maxSchemaIndex = 0;

  function encode(value) {
    if (typeof value !== 'object' || !value) {
      // non-objects or null return as is
      return value;
    } else if (Array.isArray(value)) {
      return encodeArray(value);
    }
    return encodeObject(value);
  }

  function encodeArray(value) {
    const len = value.length;
    const encoded = [];
    if (len === 0) return [];
    if (typeof value[0] === 'number') {
      encoded.push(0);  // 0 is schema index for Array
    }
    for (let i = 0, v; i < len; i += 1) {
      v = value[i];
      const current = encode(v);
      const last = encoded[encoded.length - 1];
      if (isEncodedObject(current) &&
                  Array.isArray(last) && current[0] === last[0]) {
                  // current and previous object have same schema,
                  // so merge their values into one array
        encoded[encoded.length - 1] =
                      last.concat(current.slice(1));
      } else {
        encoded.push(current);
      }
    }
    return encoded;
  }

  function encodeObject(value) {
    const schemaKeys = Object.keys(value).sort();
    if (schemaKeys.length === 0) {
      return {};
    }
    let encoded;
    const schema = `${schemaKeys.length}:${schemaKeys.join('|')}`;
    const schemaIndex = schemas[schema];
    if (schemaIndex) { // known schema
      encoded = [schemaIndex];
      for (let i = 0, k; k = schemaKeys[i++];) {
        encoded[i] = encode(value[k]);
      }
    } else {    // new schema
      schemas[schema] = ++maxSchemaIndex;
      encoded = {};
      for (let i = 0, k; k = schemaKeys[i++];) {
        encoded[k] = encode(value[k]);
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
export function unpack(data) {
  const schemas = {};
  let maxSchemaIndex = 0;

  function parseArray(value) {
    if (value.length === 0) {
      return [];
    } else if (value[0] === 0 || typeof value[0] !== 'number') {
      return decodeArray(value);
    }
    return decodeObject(value);
  }

  function decodeArray(value) {
    const len = value.length;
    let decoded = []; // decode array of something
    for (let i = (value[0] === 0 ? 1 : 0); i < len; i += 1) {
      const v = value[i];
      const obj = decode(v);
      if (isEncodedObject(v) && Array.isArray(obj)) {
                    // several objects was encoded into single array
        decoded = decoded.concat(obj);
      } else {
        decoded.push(obj);
      }
    }
    return decoded;
  }

  function decodeObject(value) {
    const schemaKeys = schemas[value[0]];
    const schemaLen = schemaKeys.length;
    const total = (value.length - 1) / schemaLen;
    let decoded;

    if (total > 1) {
      decoded = []; // array of objects with same schema
      for (let i = 0; i < total; i += 1) {
        const obj = {};
        for (let j = 0, k; k = schemaKeys[j++];) {
          obj[k] = decode(value[(i * schemaLen) + j]);
        }
        decoded.push(obj);
      }
    } else {
      decoded = {};
      for (var j = 0, k; k = schemaKeys[j++];) {
        decoded[k] = decode(value[j]);
      }
    }
    return decoded;
  }

  function decodeNewObject(value) {
    const schemaKeys = Object.keys(value).sort();
    if (schemaKeys.length === 0) {
      return {};
    }
    maxSchemaIndex += 1;
    schemas[maxSchemaIndex] = schemaKeys;
    const decoded = {};
    schemaKeys.forEach((k) => {
      decoded[k] = decode(value[k]);
    });
    return decoded;
  }

  function decode(value) {
    if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
      return value;
    } else if (Array.isArray(value)) {
      return parseArray(value);
    }  // object with new schema
    return decodeNewObject(value);
  }

  return decode(data);
}

export default { pack, unpack };
