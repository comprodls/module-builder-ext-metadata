"use strict";

var unitTest = require('./../index');

// Below config and options are specific to CUP.
var config = {
    "id": "",
    "syncTime": 20000,
    "source": {
        "type": "",
        "url": "",
        "apiKey": ""
    },
    "builder-mapping": {
        "category": {
            "id": "",
            "taxonomy": {
                "replace_with_taxonomy_id": {
                    "theme": "metadata-theme-lemon"
                }
            }
        }
    }
};

unitTest.getExternalMetadata(config, false).then(function (res) {
    console.log(res);
}).catch(function (err) {
    console.log(err);
});