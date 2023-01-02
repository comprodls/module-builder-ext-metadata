/*********************************Library References****************************************************************/
const communicate = require('./communicate');

/*********************************Global Variables******************************************************************/

/*********************************Functions************************************************************************/

/**
 * Function to return builder-friendly lomMap Heirarchy.
 * 
 * @param { Object }  config  -  Config for Api endpoints.
 * @returns { Promise } Promise which gets resolved lomMap.
 */
async function getLomMap(config) {
    try {

        let flattenedMap = await getFlattenedMap(config);
        // console.log("flattenedMap: ", flattenedMap);
        // Convert the FlatMap obtained from above step and convert it into Hierarchical Map (Builder Friendly Format).
        let response = createMapFromFlattened(flattenedMap);
        // console.log("lomMap: ", response);
        return Promise.resolve(response);
    } catch (err) {
        return Promise.reject(err);
    }
}



/**
 * Fetch all loms in respective flatMaps.
 * @param { Object }  config  -  Config for Api endpoints.
 * @returns {Promise} Promise which gets resolved with lom flatmap.
 */
async function getFlattenedMap(config) {
    try {
        let response = {};

        // get lom data response.
        let result = await communicate.getLom(config);

        for (let i = 0; i < result.data.length; i++) {
            if (result.data[i] && result.data[i].id) {
                response[result.data[i].id] = result.data[i];
            }
        }

        // return the flattend lom data map.
        return Promise.resolve({ loms: response });
    }
    catch (err) {
        return Promise.reject(err);
    }
}


/**
 * returns builder-friendly lomMap Heirarchy.
 * @param { Object }  flattenedMap - Lom data flatmap.
 * @returns { Object } lomMap in builder format.
 */
function createMapFromFlattened(flattenedMap) {
    let data = flattenedMap.loms;

    // console.log(data);
    // loop on flattened loms data and transform it into builder format
    for (let id in data) {

        // console.log(id, "+++", data);

        // put current iteration data into currentLom.
        let currentLom = data[id];

        let transformedLom = {};

        // Create transformedLom to return in builder format 
        // fill transformedLom.doc with whole data of current lom.
        transformedLom.doc = currentLom;
        // fill transformedLom.lom with n level heirarchy of lom profiles.
        currentLom.profiles = currentLom.profiles || {};
        transformedLom.lom = createTree(currentLom.profiles, id);
        // fill last modified information
        transformedLom.doc["last-modified"] = { time: null, by: "" };
        // fill theme and name info into meta node.
        transformedLom.doc.meta = { name: currentLom.name, description: currentLom.description, data_type: currentLom.data_type }
        // put parentid = 0 for Lomonomies as they are on top level of hierarchy
        transformedLom.doc.parentid = 0;
        // put _id = id for Lomonmy 
        transformedLom.doc['_id'] = id;
        // delete profiles and id from the lom doc data as they are redundant now
        delete transformedLom.doc.profiles;
        delete data[id];
        // replace old lom data with transformed lom data.
        data[id] = transformedLom;
    }
    return data;
}


/**
 * Create hierarchy for Profiles of a lom such as (Parent lom >> Child lom) 
 * @param {Array} profilesArray - Array of profiles data.
 * @param { String } pid - parentId
 * @returns { Object } n-level hierarchy of profiles of a lom
 */
function createTree(profilesArray, pid) {
    let recMap = {}
    let childParentMap = {};
    // loop for each profiles
    for (let i = 0; i < profilesArray.length; i++) {
        // if childParentMap does not contain a node with currentProfiles parentid.
        if (!childParentMap[profilesArray[i].parentId]) {
            // if currentProfiles parentid is "" (i.e root level profile ).
            if (profilesArray[i].parentId == "") {
                // push the profile data  with 0 as key as it is root level profile.
                childParentMap['0'] = childParentMap['0'] || [];
                childParentMap['0'].push(profilesArray[i]);
            }
            else {
                // if parentid is not '' then create a new empty array in childParent map with current profile parentid.
                childParentMap[profilesArray[i].parentId] = [];
            }
        }

        // if current profile parentid is not "" then push current profile into childParent map against its parentid.
        if (profilesArray[i].parentId != "") {
            childParentMap[profilesArray[i].parentId].push(profilesArray[i]);
        }
        // if childParent does not contain a node with profile id then create a empty array node with key as profile id.
        if (!childParentMap[profilesArray[i]["id"]]) {
            childParentMap[profilesArray[i]["id"]] = [];
        }
        // push the current profile in front against the profile id in childParent map.
        childParentMap[profilesArray[i]["id"]].unshift(profilesArray[i]);
    }
    /* create root level(hidden from user) which has id = 0 */
    childParentMap[0].unshift(
        {
            "id": "0",
            "meta": {
                "name": "Zero"
            }
        }
    );
    // call getChildren to make a n-level hierarchy and fill it into recMap. 
    // console.log(childParentMap);
    getChildren(recMap, 0, pid);

    function getChildren(recMap, parentId, pid) {
        // if the childparent map has a node with passed parent id 
        childParentMap[parentId] = childParentMap[parentId] || [];
        if (childParentMap[parentId].length) {
            // loop into items on childparentmap parentid-node
            for (let i = 1; i < childParentMap[parentId].length; i++) {

                recMap[childParentMap[parentId][i]["id"]] = {
                    "doc": childParentMap[parentId][i],
                    "lom": {}
                }

                recMap[childParentMap[parentId][i]["id"]].doc['last-modified'] = {
                    by: "",
                    time: null
                }

                recMap[childParentMap[parentId][i]["id"]].doc["meta"] = {
                    "name": recMap[childParentMap[parentId][i]["id"]].doc.name,
                }
                // put parentid = pid , pid here is passed parent id of currentitem
                recMap[childParentMap[parentId][i]["id"]].doc.parentid = recMap[childParentMap[parentId][i]["id"]].doc.parent_id;
                // put _id = parentId ,//for profiles only
                recMap[childParentMap[parentId][i]["id"]].doc["_id"] = recMap[childParentMap[parentId][i]["id"]].doc.parentId;
                //delete duplicate parentId
                delete recMap[childParentMap[parentId][i]["id"]].doc.parentId;
                // call getchildren again for current profile childs with updated parameters.
                // console.log(recMap);
                getChildren(recMap[childParentMap[parentId][i]["id"]].profiles, childParentMap[parentId][i]["id"], childParentMap[parentId][i]["id"]);
            }
        }
    }
    return recMap;
}

module.exports = { getLomMap }