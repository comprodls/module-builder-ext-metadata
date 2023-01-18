const lomMap = require('../metadata/cup/lib/lom-map');
const request = require('request');
const unitTest = require('./../index');
const fs = require('fs');

// Below config and options are specific to CUP.
let config = {
    "id": "cup",
    "syncTime": 20000,
    "source": {
        "type": "external",
        "url": "https://meta-api-stg.cambridgeone.org/v1/resources",
        "apiKey": "ME9X40X-KE84ZK3-QVREZNT-NZYYXMA"
        // "url": "https://63ad1c4834c46cd7ae908f2d.mockapi.io/v1/resources", // dummy Url
    },
    "builder-mapping": {
        "category": {
            "id": "taxonomy",
            "taxonomy": {
                "88bafa5d-c271-a6d4-92fa-9e03b4cd7e1b": {
                    "theme": "metadata-theme-lemon"
                },
                "70bafa5f-1ceb-0133-db39-f536c751dd79": {
                    "theme": "metadata-theme-arctic-blue"
                },
                "62bafa6c-18b7-030e-7281-5647849bfdf8": {
                    "theme": "metadata-theme-sweet-pink"
                },
                "42ba15c6-e180-a8dc-54ad-1d727b49857a": {
                    "theme": "metadata-theme-emerald"
                },
                "b6bb289b-bd85-9c93-3990-62f064db627a": {
                    "theme": "metadata-theme-green"
                },
                "acbb289a-6032-13b1-e943-c43bac009853": {
                    "theme": "metadata-theme-amber"
                },
                "44bb5949-8c47-2fe5-5fde-9542a73c4ba8": {
                    "theme": "metadata-theme-arctic-blue"
                },
                "64bbf6e2-45ab-f1d0-f15d-1f1b6d6e307f": {
                    "theme": "metadata-theme-cyan-blue"
                },
                "56bb289d-9793-e106-a3f6-6cb99599bc07": {
                    "theme": "metadata-theme-arctic-blue"
                },
                "f0bd099e-9c63-2b09-cbd6-0ebfa5b1e826": {
                    "theme": "metadata-theme-royal-blue"
                },
                "98bdef13-c0c8-1055-7533-72263a7acf1e": {
                    "theme": "metadata-theme-lemon"
                },
                "62bdef0d-da1e-ef36-c0b6-2f611d77cb3b": {
                    "theme": "metadata-theme-green"
                }
            }
        },
        "lom": {
            id: "lom"
        }
    }
}

unitTest.getExternalMetadata(config, false, true).then(res => {
    let stream = fs.createWriteStream(process.cwd() + '/getMetadataResponse.json');
    stream.write(JSON.stringify(res, null, '\t'));
    // console.log(JSON.stringify(res));
}).catch(err => {
    console.log(err);
})