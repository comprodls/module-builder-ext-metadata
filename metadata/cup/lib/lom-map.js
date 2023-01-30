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

        // Convert the FlatMap obtained from above step and convert it into Hierarchical Map (Builder Friendly Format).
        let response = createTreeFromFlattened(flattenedMap);
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

                result.data[i]['last-modified'] = { time: null, by: "" };
                result.data[i]['meta'] = { name: result.data[i].name, description: result.data[i].description, data_type: result.data[i].data_type};
                result.data[i]['breadcrumb-name'] = result.data[i].name;
                result.data[i]['breadcrumb-id'] = result.data[i].id;
                delete result.data[i].description;
                delete result.data[i].data_type;
                delete result.data[i].size;
                delete result.data[i].order;
                delete result.data[i].example;
                delete result.data[i].value_space;
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


function createTreeFromFlattened(flattenedMap) {
    try {
        let lomsArray = flattenedMap.loms;
        var recMap = {}
        var childParentMap = {};
        // loop for each lom

        for (let i in lomsArray) {
            // if childParentMap does not contain a node with currentTerm parentid.
            if (!childParentMap[lomsArray[i].parent_id]) {
                // if currentTerm parentid is "" (i.e root level lom ).
                if (lomsArray[i].parent_id == "") {
                    // push the lom data  with 0 as key as it is root level lom.
                    childParentMap['0'] = childParentMap['0'] || [];
                    childParentMap['0'].push(lomsArray[i]);
                }
                else {
                    // if parentid is not '' then create a new empty array in childParent map with current lom parentid.
                    childParentMap[lomsArray[i].parent_id] = [];
                }
            }

            // if current lom parentid is not "" then push current lom into childParent map against its parentid.
            if (lomsArray[i].parent_id != "") {
                lomsArray[i]["breadcrumb-id"] = lomsArray[lomsArray[i].parent_id]["breadcrumb-id"] + '>' + lomsArray[i]["breadcrumb-id"];
                lomsArray[i]["breadcrumb-name"] = lomsArray[lomsArray[i].parent_id]["breadcrumb-name"] + ' > ' + lomsArray[i]["breadcrumb-name"];
                childParentMap[lomsArray[i].parent_id].push(lomsArray[i]);
            }
            // if childParent does not contain a node with lom id then create a empty array node with key as lom id.
            if (!childParentMap[lomsArray[i]["id"]]) {
                childParentMap[lomsArray[i]["id"]] = [];
            }
            // push the current lom in front against the lom id in childParent map.
            childParentMap[lomsArray[i]["id"]].unshift(lomsArray[i]);
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
        getChildren(recMap, 0);

        function getChildren(recMap, parentId) {
            // if the childparent map has a node with passed parent id 
            if (childParentMap[parentId].length) {
                // loop into items on childparentmap parentid-node
                for (let i = 1; i < childParentMap[parentId].length; i++) {

                    recMap[childParentMap[parentId][i]["id"]] = {
                        "doc": childParentMap[parentId][i],
                        "lom_nodes": {}
                    }

                    // call getchildren again for current lom childs with updated parameters.
                    getChildren(recMap[childParentMap[parentId][i]["id"]].lom_nodes, childParentMap[parentId][i]["id"]);
                }
            }
        }

        return recMap;
    }
    catch(err) {
        return new Error(err);
    }   
}


module.exports = { getLomMap }