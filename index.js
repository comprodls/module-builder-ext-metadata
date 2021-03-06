/*********************************Org References****************************************************************/  
const cup = require('./metadata/cup/index');

/*********************************Global Variables******************************************************************/  

const organizationMap = {
    'cup' : cup
}

/*********************************Functions************************************************************************/  
/**
 * return docs collection or categoryMap when resolved corresponding to clientId.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {Boolean} docs whether to fetch docs or categoryMap. Fallback is categoryMap.
 * @param {Boolean} suppressErrors used to decide whether to return null against a failed taxonomy or not .
 * @returns {Promise} docs collection or categoryMap when resolved
 */
async function getExternalMetadata(config, docs, returnErrors){
    try{
        // The returnErrors variable is used to decide whether to return null against a failed taxonomy or not . 
        console.log('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_EXTERNAL_METADATA, getExternalMetadata ' + 'received request to feth metadata for ' + config.id );
        let externalMetadataModule = await getClientInstance(config.id);
        // // configure the external module
        // await externalMetadataModule.configure(config.source); 
        // fetch parameters for external Metadata function.
        let parameters = fetchGetMetadataParameters(config, docs);
        if(!parameters){
            throw new Error('parameters for organization not found with id '+ config.id);
        }
        // call metadata function and return results.
        let results  = await externalMetadataModule.getMetadata(...parameters, config.source, returnErrors);
        return Promise.resolve(results);
    }
    catch(err){
        console.log('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_EXTERNAL_METADATA, getExternalMetadata ' + JSON.stringify(err));
        return Promise.reject(err);
    }

}

/**
 * returns instance of module corresponding to clientId.
 * @param {String} orgId  client id corresponding to the external module.
 * @returns {Object} instance of module corresponding to clientId.
 */
async function getClientInstance(clientId){
    if(organizationMap[clientId]){
        return Promise.resolve(organizationMap[clientId]);
    } 
    else {
        return Promise.reject("Organization External Metadata Module not found with id " + clientId); 
    }  
}

/**
 * return parameters needed to call getMetadata corresponfing to a specific clientId.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {Boolean} docs whether to fetch docs or categoryMap. Fallback is categoryMap.
 * @returns {Object} parameters needed to call getMetadata 
 */
function fetchGetMetadataParameters(config, docs){
    switch (config.id){
        case 'cup' : 
            return [ { taxonomy: config['builder-mapping'].category[config['builder-mapping'].category.id], docs: docs || false } ];
        default:
            return null;
    }
}

/**
 * return tag details for a id.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {String} id - tag id to fetch details for .
 * @returns {Object} tag details for a id.
 */
async function getTagDetails(config, id) {
    try {
        console.log('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_TAG_DETAILS, getTagDetails ' + 'received request to fetch tag for ' + id );
         // get clientInstance
        let externalMetadataModule = await getClientInstance(config.id);
        // configure the external module
        // await externalMetadataModule.configure(config.source);
        // call tag details function
        let result = await externalMetadataModule.getTagDetails(id, config.source);
        return Promise.resolve(result);
    }
    catch(err){
        console.log('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_TAG_DETAILS, getExternalMetadata ' + JSON.stringify(err));
        return Promise.reject(err);
    }
}


module.exports = { getExternalMetadata, getTagDetails }
