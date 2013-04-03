# RJSON: compress JSON to JSON

RJSON (Recursive JSON) converts any JSON data collection  into more compact recursive form. Compressed data is still JSON and can be parsed with `JSON.parse`. RJSON can compress not only homogeneous collections, but any data sets with free structure.

RJSON is single-pass stream compressor,  it extracts data schemes from document, assign each schema unique number and  use this number  instead of repeating same property names again and again. Each data schema is unique set of keys ordered with natural sort (alphabetically). After packing and unpacking order of keys may be changed but restored document will be fully identical to the original document.

More information about RJSON data format you can find at my blog post [Recursive JSON (RJSON) introduction](http://www.cliws.com/e/06pogA9VwXylo_GknPEeFA/) published on IMO [best social news RSS-reader](http://www.cliws.com/).

There is also available [RJSON demo](http://www.cliws.com/p/rjson/) where you can convert any JSON data into RJSON format, decode result and ensure that it matches original JSON data.

Bellow you can see same document in both forms.

**JSON**

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

**RJSON**

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

* decrease JSON data redundancy before the compression with tradition tools like gzip (for example see great tool [jsonpickle](http://jsonpickle.github.com/) or [Twitter API output](https://dev.twitter.com/docs/api/1.1/get/users/lookup) when length of field name often greater than leghth of the value itself).

* reduce JSON data size and network traffic when gzip isn't available. For example, in-browser 3D-modeling tools like [Mydeco 3D-planner](http://mydeco.com/3d-planner/) may process and send to server  megabytes of JSON-data;

* analyze large collections of JSON-data without unpacking of whole dataset. RJSON-data is still JSON-data, so it can be traversed and analyzed after parsing and fully unpacked only if a document meets  some conditions.

The above JSON vs RJSON example is based on the data structure from the [JSON DB: a compressed JSON format](http://michaux.ca/articles/json-db-a-compressed-json-format). It's concept is implemented in [JSONH - JSON Homogeneous Collections Compressor](https://github.com/WebReflection/JSONH). RJSON provides similar level of data compression like JSONH does, but RJSON isn't limited to homogeneous collections only.

The library file `rjson.js` have no external dependencies but if you use NodeJS you can install it with `npm install rjson`. To run unit tests just open `test/index.html` in your browser or execute `npm test` in the console.

For testing RJSON compression you can use `bin/rjson` script. It reads JSON/RJSON input from stdin and outputs RJSON/JSON to stdout. To unpack RJSON data try `rjson -u`. If you want to see some stat about comprerssion ratio and time, use `rjson -v`. With `rjson -t` you can active test mode in which script will compare restored and original data. For example:

    $ cat ./test/fixtures/twitter_search100.json | rjson -v > ./100.rjson
    In: 100523, Out: 64664, In/Out=155%, Time: 22ms (RJSON: 10ms).

    $ cat ./100.rjson | rjson -uv > ./100.json
    In: 64664, Out: 100523, In/Out=64%, Time: 21ms (RJSON: 4ms).

    $ curl "http://search.twitter.com/search.json?q=Javascript&rpp=100&lang=en&include_entities=true" | rjson -vt > /dev/null
    In: 103943, Out: 65763, In/Out=158%, Time: 32ms (RJSON: 18ms).


Dmitri Russu kindly ported RJSON to PHP, you can obtain it at [RJSON-php](https://github.com/dmitrirussu/RJSON-php).

Fell free to compress the world.
