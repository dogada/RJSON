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

* reduce JSON data size and network traffic when gzip isn't available. For example, in-browser 3D-modeling tools like [Mydeco 3D-planner](http://mydeco.com/3d-planner/) may process and send to server  megabytes of JSON-data;

* analyze large collections of JSON-data without unpacking of whole dataset. RJSON-data is still JSON-data, so it can be traversed and analyzed after parsing and fully unpacked only if a document meets  some conditions.

The above JSON vs RJSON example is based on the data structure from the [JSON DB: a compressed JSON format](http://michaux.ca/articles/json-db-a-compressed-json-format). It's concept is implemented in [JSONH - JSON Homogeneous Collections Compressor](https://github.com/WebReflection/JSONH). RJSON provides similar level of data compression like JSONH does, but RJSON isn't limited to homogeneous collections only.

To run unit tests just open `test/index.html` in your browser.

The code is available under Simplified BSD License, fell free to compress the world.
