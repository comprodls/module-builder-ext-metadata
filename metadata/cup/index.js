/*********************************Library References****************************************************************/  
const { validateConfig } = require('./lib/helper');
const communicate = require('./lib/communicate');
const categoryMap = require('./lib/category-map2');
const docsMethod = require('./lib/docs-method');
const lomMap = require('./lib/lom-map');

/*********************************Global Variables******************************************************************/  
// let externalMetadataConfig = null;


/*********************************Functions************************************************************************/  

/**
 * returns  categoryMap/docs fetched from MMA endpoints .
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @param { boolean } returnErrors used to decide whether to return null against a failed taxonomy or not .
 * @returns { Promise } Promise which gives category map / docs when resolved.
 * 
 */
async function getMetadata(options, externalMetadataConfig, returnErrors){
    try {
        console.log('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_METADATA, getMetadata ' + 'received request to fetch metadata ');
        //if config is empty reject with Library not Initialized Error
        if(!externalMetadataConfig.source){
          console.log('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_METADATA, getMetadata ' + 'Library is not initialized i.e configuration missing ');
          return Promise.reject({ success: false , err: new Error("Library is not initialized ")})
        }
        //Check if Taxonomy list is empty
        if(!options || !options.taxonomy || options.taxonomy.length == 0 ){
            console.log('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_METADATA, getMetadata ' + 'Taxonomy List is Empty or Not Present');
            return Promise.reject({ success:false , err: "Taxonomy List is Empty or Not Present" })
        }
        let categoryMapResponse;
        let lomMapResponse;
        // if docs flag is true fetch all docs and convert into builder format and return 
        if(options.docs && options.docs == true){
            categoryMapResponse = await docsMethod.getAllDocs(options, externalMetadataConfig.source);
        }
        else{ // else make a categoryMap from metadata and return it
            categoryMapResponse = await categoryMap.getCategoryMap(options, externalMetadataConfig.source, returnErrors);
        }

        // if lom node is present, get the lom map.
        if(externalMetadataConfig["builder-mapping"] && externalMetadataConfig["builder-mapping"]["lom"] && externalMetadataConfig["builder-mapping"]["lom"].id){
            lomMapResponse = await lomMap.getLomMap(externalMetadataConfig.source);
        }

        return Promise.resolve({ success:true, categoryMap: categoryMapResponse, lomMap: lomMapResponse });
       
    } catch(err){
        return Promise.reject({ success:false, err : err });
    }
}


// /** This method configures this library with passed config(apiKey, url, id).
//  * @param { Object }  config  -  Config for Api endpoints.
//  * @param { String }  config.apiKey  -  Key for API endpoint authentication.
//  * @param { String }  config.url  -  MMA Endpoint base url.
//  * @param { String }  config.id  -  Unique client id.
//  * @returns {Promise} A promise which gets resolved on library initialization and if passed config is valid.
//  */
// async function configure(config){
//     // validateConfig Method validates that the config passed have all the values required to intialize this library.
//     if(validateConfig(config)){
//         externalMetadataConfig = config;
//         return Promise.resolve();
//     }
//     else{
//         return Promise.reject(new Error('Configuration Error: Missing Values'));
//     }
// }

/**
 * returns Proxy data for a term's proxy id.
 * @param {String} id - Proxy Id of a term.
 * @returns {Promise} Promise which gets resolved with term's proxy data.
 */
async function getTagDetails(id, externalMetadataConfig){
    try {
        console.log('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_TAG, getTagDetails ' + 'received request to fetch tag details for  ' + id);
        //if config is empty reject with Library not Initialized Error
        if(!externalMetadataConfig){
            console.log('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_TAG, getTagDetails ' + 'Library is not initialized i.e configuration missing ');
            return Promise.reject({ success: false , err: new Error("Library is not initialized ")})
        }
        // If empty proxyId is passed reject with a error.
        if(!id){
            console.log('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_TAG, getTagDetails ' + 'proxyId is empty');
            return Promise.reject(new Error ("Please provide a valid proxy id"));
        }
        // Fetch a Term Proxy by its id and return it.
        let results = await communicate.getProxyById(externalMetadataConfig, id);
        return Promise.resolve(results);
    }
    catch(err){
        return Promise.reject(err);
    }
}




module.exports = { getMetadata,  getTagDetails }