const unitTest = require('./../index');

// Below config and options are specific to CUP.
let config = {
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
}

unitTest.getExternalMetadata(config, false).then(res=>{
   console.log(res);
}).catch(err=>{
    console.log(err);
})
