/*********************************Library References****************************************************************/ 
const communicate = require('./communicate');

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  

/**
 * returns builder-friendly categoryMap Heirarchy.
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @param { boolean } returnErrors used to decide whether to return null against a failed taxonomy or not .
 * @returns { Promise } Promise which gets resolved categoryMap.
 */
async function getCategoryMap(options, config, returnErrors){
    try {
        // Fetch data from provided taxonomies id and create flatMap from it.
        let flattenedMap = await getFlattenedMap(options.taxonomy, config, returnErrors);
        // Convert the FlatMap obtained from above step and convert it into Hierarchical Map (Builder Friendly Format).
        let response = createMapFromFlattened(flattenedMap);
        return Promise.resolve(response);
    } catch (err) {
        return Promise.reject(err);
    }
}



/**
 * Fetch all taxonomies and their corresponding color in respective flatMaps.
 * @param { Object }  taxonomies -  taxonomy list .
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns {Promise} Promise which gets resolved with taxonomy flatmap and corresponding color flatmap.
 */
async function getFlattenedMap(taxonomies, config, returnErrors){
    try{
        let response = {};
        let promiseArray = [];
        let colorMap = {};
        let taxonomyArray = [];
        // Loop over taxonomy list and make a call for each taxonomy id and store the promise in an promiseArray.
        // Similarly make ColorMap in which every taxonomy id has a corresponding theme.
        for(let taxonomyId in taxonomies ){
            colorMap[taxonomyId] = taxonomies[taxonomyId].theme || 'black'; // Chosen black as a fallback color
            taxonomyArray.push(taxonomyId);
            promiseArray.push(communicate.getLatestTaxonomyById(config, taxonomyId));
        }

        // Create a flatmap of taxonomies result and store it key-value pairs in response object where key = taxonomy_id
        // and value = taxonomy data from API
        let result = await Promise.all(promiseArray);
        for (let i = 0; i < result.length; i++){
            if(result[i].data && result[i].data.id){
                response[result[i].data.id] = result[i].data;
            }
            else if(returnErrors){ // if the current taxonomy does not have any data and returnErrors parameter is true then set null against the taxonomy
                response[taxonomyArray[i]] = null;
            }
        }
        // return the flattend taxonomies data and colorMap
        return Promise.resolve({ taxonomies:response, colorMap:colorMap });
    }
    catch(err){    
        return Promise.reject(err);
    }
}


/**
 * returns builder-friendly categoryMap Heirarchy.
 * @param { Object }  flattenedMap - Taxonomy data flatmap and its corresponding colormap.
 * @param { Object }  flattenedMap.taxonomies - Pass taxonomy list .
 * @param { Object }  flattenedMap.colorMap - Set true to fetch all docs and false to fetch categoryMap.
 * @returns { Object } categoryMap in builder format.
 */
function createMapFromFlattened(flattenedMap){
    let data = flattenedMap.taxonomies;
    let colorMap = flattenedMap.colorMap;

    // loop on flattened taxonomies data and transform it into builder format
    for(let id in data) {
        // put current iteration data into currentTax.
        let currentTax = data[id];

        if(!currentTax){ // if currentTaxonomy data is set as null then do not create its map and keep the data null as it is
            data[id] = null;
            continue;
        }
        
        let transformedTax = {};
        // Create transformedTax to return in builder format 
        // fill transformedTax.doc with whole data of current taxonomy.
        transformedTax.doc = currentTax;
        // fill transformedTax.tags with n level heirarchy of taxonomy terms.
        transformedTax.tags = createTree(currentTax.terms, id);   
        // fill last modified information
        transformedTax.doc["last-modified"] = { time: null, by: "" };
        // fill theme and name info into meta node.
        transformedTax.doc.meta = { name: currentTax.name, theme: colorMap[id], }
        // put parentid = 0 for taxonomies as they are on top level of hierarchy
        transformedTax.doc.parentid =  0;
        // put _id = id for taxonmy 
        transformedTax.doc['_id'] = id;
        // delete terms and id from the taxonomy doc data as they are redundant now
        delete transformedTax.doc.terms;
        delete data[id];
        // replace old taxonomy data with transformed taxonomy data.
        data[id] = transformedTax;
    }
    return data;
}


/**
 * Create hierarchy for terms of a Taxonomy such as (Parent term >> Child term) 
 * @param {Array} termsArray - Array of Terms data.
 * @param { String } pid - parentId
 * @returns { Object } n-level hierarchy of terms of a taxonomy
 */
function createTree(termsArray, pid){
    var recMap = {}
    var childParentMap = {};
    // loop for each term
    for(let i=0; i< termsArray.length; i++) {
        // if childParentMap does not contain a node with currentTerm parentid.
        if(!childParentMap[termsArray[i].parentId]) {
            // if currentTerm parentid is "" (i.e root level term ).
            if(termsArray[i].parentId == ""){
                // push the term data  with 0 as key as it is root level term.
                childParentMap['0'] = childParentMap['0'] || [];
                childParentMap['0'].push(termsArray[i]);
            }
            else{
                // if parentid is not '' then create a new empty array in childParent map with current term parentid.
                childParentMap[termsArray[i].parentId] =  [];
            }
        }

        // if current term parentid is not "" then push current term into childParent map against its parentid.
        if(termsArray[i].parentId != ""){
            childParentMap[termsArray[i].parentId].push(termsArray[i]);
        }
        // if childParent does not contain a node with term id then create a empty array node with key as term id.
        if(!childParentMap[termsArray[i]["id"]]) {
            childParentMap[termsArray[i]["id"]] = [];
        }
        // push the current term in front against the term id in childParent map.
        childParentMap[termsArray[i]["id"]].unshift(termsArray[i]);
    }
    /* create root level(hidden from user) which has id = 0 */
    childParentMap[0].unshift(
        {
            "id" : "0",
            "meta" : {
                "name" : "Zero"
            }
        }
    );
    // call getChildren to make a n-level hierarchy and fill it into recMap. 
    getChildren(recMap, 0, pid);
   
    function getChildren(recMap, parentId, pid) {
        // if the childparent map has a node with passed parent id 
        if(childParentMap[parentId].length) {
            // loop into items on childparentmap parentid-node
            for(let i=1; i< childParentMap[parentId].length; i++) {

                recMap[childParentMap[parentId][i]["masterId"]] = {
                    "doc" : childParentMap[parentId][i],
                    "tags" : {}
                }

                recMap[childParentMap[parentId][i]["masterId"]].doc['last-modified'] = {
                    by: "",
                    time: null
                }

                recMap[childParentMap[parentId][i]["masterId"]].doc["meta"] =  {
                    "name":  recMap[childParentMap[parentId][i]["masterId"]].doc.name,
                    "theme": ""
                }
                // put parentid = pid , pid here is passed parent id of currentitem
                recMap[childParentMap[parentId][i]["masterId"]].doc.parentid =  pid;
                // put _id = masterId ,//for terms only
                recMap[childParentMap[parentId][i]["masterId"]].doc["_id"] =   recMap[childParentMap[parentId][i]["masterId"]].doc.masterId;
                //delete duplicate parentId
                delete recMap[childParentMap[parentId][i]["masterId"]].doc.parentId;
                // call getchildren again for current term childs with updated parameters.
                getChildren(recMap[childParentMap[parentId][i]["masterId"]].tags, childParentMap[parentId][i]["id"], childParentMap[parentId][i]["masterId"]);   
            }
        }
    }
    return recMap;
}

module.exports = { getCategoryMap }