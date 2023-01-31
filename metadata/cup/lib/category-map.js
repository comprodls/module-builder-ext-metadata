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
            promiseArray.push(communicate.getTaxonomyById(config, taxonomyId));
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

        if(!data[id]){ // if currentTaxonomy data is set as null then do not create its map and keep the data null as it is
            data[id] = null;
            continue;
        }

        let transformedTax = {};
        transformedTax.doc = data[id];
        transformedTax.doc["last-modified"] = { time: null, by: "" };
        transformedTax.doc.meta = { name: transformedTax.doc.name, theme: "", }

        // fill transformedTax.tags with n level heirarchy of taxonomy terms.
        transformedTax.tags = createTree(data[id].relationships);

        delete transformedTax.doc.relationships;
        delete transformedTax.doc.description;

        data[id] = transformedTax;
    }
    return data;
}


/**
 * Create hierarchy for terms of a Taxonomy such as (Parent term >> Child term) 
 * @param {Array} termsArray - Array of Terms data.
 * @returns { Object } n-level hierarchy of terms of a taxonomy
 */
function createTree(termsArray){
    var recMap = {}
    var childParentMap = {};
    // loop for each term
    for(let i=0; i< termsArray.length; i++) {

        if (termsArray[i].weight === 1) {
            continue;
        }

        // if childParent does not contain a node with term id then create a empty array node with key as term id.
        if(!childParentMap[termsArray[i]["relationship_id"]]) {
            childParentMap[termsArray[i]["relationship_id"]] = [];
        }

        if (termsArray[i].weight == 2) {
            // push the current term in front against the term id in childParent map.
            childParentMap[termsArray[i]["relationship_id"]].unshift(termsArray[i]);
        }

        termsArray[i].parentId = "";
        // find parentId of term
        if (termsArray[i].relationships) {
            for (let rterm of termsArray[i].relationships) {
                if (rterm.direction === "incoming" && rterm.weight === 3) {
                    termsArray[i].parentId = rterm.relationship_id;
                }
            }
        }

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
    }

    /* create root level(hidden from user) which has id = 0 */
    childParentMap[0].unshift(
        {
            "relationship_id" : "0",
            "meta" : {
                "name" : "Zero"
            }
        }
    );

    // call getChildren to make a n-level hierarchy and fill it into recMap. 
    getChildren(recMap, 0);
   
    function getChildren(recMap, parentId) {
        // if the childparent map has a node with passed parent id 
        if(childParentMap[parentId].length) {
            // loop into items on childparentmap parentid-node
            for(let i=1; i< childParentMap[parentId].length; i++) {

                recMap[childParentMap[parentId][i]["relationship_id"]] = {
                    "doc" : {},
                    "tags" : {}
                }

                recMap[childParentMap[parentId][i]["relationship_id"]].doc["id"] = childParentMap[parentId][i].relationship_id;
                recMap[childParentMap[parentId][i]["relationship_id"]].doc["name"] = childParentMap[parentId][i].name;

                recMap[childParentMap[parentId][i]["relationship_id"]].doc['last-modified'] = {
                    by: "",
                    time: null
                }

                recMap[childParentMap[parentId][i]["relationship_id"]].doc["meta"] =  {
                    "name":  childParentMap[parentId][i].name,
                    "description": childParentMap[parentId][i].description,
                    "theme": ""
                }

                // call getchildren again for current term childs with updated parameters.
                getChildren(recMap[childParentMap[parentId][i]["relationship_id"]].tags, childParentMap[parentId][i]["relationship_id"]);   
            }
        }
    }
    return recMap;
}

module.exports = { getCategoryMap }