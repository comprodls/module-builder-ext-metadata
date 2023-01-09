/*********************************Library References****************************************************************/
const communicate = require('./communicate');
const fs = require('fs');

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
        // let stream = fs.createWriteStream(process.cwd() + '/getMetadataResponse.json');
        // stream.write(JSON.stringify(flattenedMap, null, '\t'));
        // console.log("flattenedMap: ", flattenedMap);
        // Convert the FlatMap obtained from above step and convert it into Hierarchical Map (Builder Friendly Format).
        let response = createTreeFromFlattened(flattenedMap);
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

                result.data[i]['last-modified'] = { time: null, by: "" };
                result.data[i]['meta'] = { name: result.data[i].name, description: result.data[i].description, data_type: result.data[i].data_type};
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


 function createTreeFromFlattened(flattenedMap){
    let lomsArray = flattenedMap.loms;
    var recMap = {}
    var childParentMap = {};
    // loop for each lom
    
    for(let i in lomsArray) {
        // if childParentMap does not contain a node with currentTerm parentid.
        if(!childParentMap[lomsArray[i].parent_id]) {
            // if currentTerm parentid is "" (i.e root level lom ).
            if(lomsArray[i].parent_id == ""){
                // push the lom data  with 0 as key as it is root level lom.
                childParentMap['0'] = childParentMap['0'] || [];
                childParentMap['0'].push(lomsArray[i]);
            }
            else{
                // if parentid is not '' then create a new empty array in childParent map with current lom parentid.
                childParentMap[lomsArray[i].parent_id] =  [];
            }
        }

        // if current lom parentid is not "" then push current lom into childParent map against its parentid.
        if(lomsArray[i].parent_id != ""){
            childParentMap[lomsArray[i].parent_id].push(lomsArray[i]);
        }
        // if childParent does not contain a node with lom id then create a empty array node with key as lom id.
        if(!childParentMap[lomsArray[i]["id"]]) {
            childParentMap[lomsArray[i]["id"]] = [];
        }
        // push the current lom in front against the lom id in childParent map.
        childParentMap[lomsArray[i]["id"]].unshift(lomsArray[i]);
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
    // console.log(">>", childParentMap);
    // call getChildren to make a n-level hierarchy and fill it into recMap. 
    getChildren(recMap, 0);
   
    function getChildren(recMap, parentId) {
        // if the childparent map has a node with passed parent id 
        // console.log(childParentMap);
        if(childParentMap[parentId].length) {
            // loop into items on childparentmap parentid-node
            for(let i=1; i< childParentMap[parentId].length; i++) {

                recMap[childParentMap[parentId][i]["id"]] = {
                    "doc" : childParentMap[parentId][i],
                    "lom_nodes" : {}
                }
                
                // console.log("->", recMap);
                // call getchildren again for current lom childs with updated parameters.
                getChildren(recMap[childParentMap[parentId][i]["id"]].lom_nodes, childParentMap[parentId][i]["id"]);   
            }
        }
    }

    return recMap;
}


module.exports = { getLomMap }

let map = {
	"loms": {
		"0a552eafe-dc6e-49b5-bb07-4ff93a703482": {
			"id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Educational",
			"parent_id": "",
			"value": "This is an example value",
			"profiles": [
				{
					"id": "1b9fc6ff-c4a6-4ac9-ba19-38fb8f82a7e6",
					"type": "lom_profile",
					"name": "English Profile",
					"description": "An example LOM profile pointing to an MMA Term",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
					"data_type": "term",
					"size": 4,
					"parentId": "",
					"order": "unordered",
					"example": "Silent Reading",
					"value": "d4a033ab-53b9-418f-9973-191097dc80b4",
					"value_space": "string"
				},
				{
					"id": "2c984b01-a761-4afd-8519-b708e45ddc38",
					"type": "lom_profile",
					"name": "Science Profile",
					"description": "An example LOM profile of duration type",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
					"data_type": "duration",
					"size": "max 3",
					"parentId": "",
					"order": "ordered",
					"example": "P10m45s",
					"value": "P3m58s",
					"value_space": "string"
				}
			],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Educational",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"0a552eafe-dc6e-49b5-bb07-4ff93a34578": {
			"id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Language",
			"parent_id": "",
			"value": "This is an example value",
			"profiles": [
				{
					"id": "1b9fc6ff-c4a6-4ac9-ba19-38fb8f82adv44",
					"type": "lom_profile",
					"name": "Hindi",
					"description": "An example LOM profile pointing to an MMA Term",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "term",
					"size": 4,
					"parentId": "",
					"order": "unordered",
					"example": "Hindi",
					"value": "d4a033ab-53b9-418f-9973-191097dc80b4",
					"value_space": "string"
				},
				{
					"id": "2c984b01-a761-4afd-8519-b708e45dda12",
					"type": "lom_profile",
					"name": "Gujrati",
					"description": "An example LOM profile of duration type",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "duration",
					"size": "max 3",
					"parentId": "",
					"order": "ordered",
					"example": "P10m45s",
					"value": "P3m58s",
					"value_space": "string"
				}
			],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Language",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"0a552eafe-dc6e-49b5-bb07-4ff93a34546": {
			"id": "0a552eafe-dc6e-49b5-bb07-4ff93a34546",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Entertainment",
			"parent_id": "",
			"value": "This is an example value",
			"profiles": [
				{
					"id": "1b9fc6ff-c4a6-4ac9-ba19-38fb8f82a7e6",
					"type": "lom_profile",
					"name": "English Profile",
					"description": "An example LOM profile pointing to an MMA Term",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
					"data_type": "term",
					"size": 4,
					"parentId": "",
					"order": "unordered",
					"example": "Silent Reading",
					"value": "d4a033ab-53b9-418f-9973-191097dc80b4",
					"value_space": "string"
				},
				{
					"id": "2c984b01-a761-4afd-8519-b708e45ddc38",
					"type": "lom_profile",
					"name": "Science Profile",
					"description": "An example LOM profile of duration type",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
					"data_type": "duration",
					"size": "max 3",
					"parentId": "",
					"order": "ordered",
					"example": "P10m45s",
					"value": "P3m58s",
					"value_space": "string"
				}
			],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Entertainment",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"0a552eafe-dc6e-49b5-bb07-4ff93a34erdf6": {
			"id": "0a552eafe-dc6e-49b5-bb07-4ff93a34erdf6",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Sports",
			"parent_id": "",
			"value": "This is an example value",
			"profiles": [
				{
					"id": "1b9fc6ff-c4a6-4ac9-ba19-38fb8f82adv44",
					"type": "lom_profile",
					"name": "Hindi",
					"description": "An example LOM profile pointing to an MMA Term",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "term",
					"size": 4,
					"parentId": "",
					"order": "unordered",
					"example": "Hindi",
					"value": "d4a033ab-53b9-418f-9973-191097dc80b4",
					"value_space": "string"
				},
				{
					"id": "2c984b01-a761-4afd-8519-b708e45dda12",
					"type": "lom_profile",
					"name": "Gujrati",
					"description": "An example LOM profile of duration type",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "duration",
					"size": "max 3",
					"parentId": "",
					"order": "ordered",
					"example": "P10m45s",
					"value": "P3m58s",
					"value_space": "string"
				}
			],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Sports",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"0a552eafe-dc6e-49b5-bb07df-b5vfb452": {
			"id": "0a552eafe-dc6e-49b5-bb07df-b5vfb452",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Speaking",
			"parent_id": "",
			"value": "This is an example value",
			"profiles": [
				{
					"id": "1b9fc6ff-c4a6-4ac9-ba19-38fb8f82a7e6",
					"type": "lom_profile",
					"name": "English Profile",
					"description": "An example LOM profile pointing to an MMA Term",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "term",
					"size": 4,
					"parentId": "",
					"order": "unordered",
					"example": "Silent Reading",
					"value": "d4a033ab-53b9-418f-9973-191097dc80b4",
					"value_space": "string"
				},
				{
					"id": "2c984b01-a761-4afd-8519-b708e45ddc38",
					"type": "lom_profile",
					"name": "Science Profile",
					"description": "An example LOM profile of duration type",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "duration",
					"size": "max 3",
					"parentId": "",
					"order": "ordered",
					"example": "P10m45s",
					"value": "P3m58s",
					"value_space": "string"
				}
			],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Speaking",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"0a552eafe-dc6e-49b5-bb07-4fdg4655v": {
			"id": "0a552eafe-dc6e-49b5-bb07-4fdg4655v",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Music",
			"parent_id": "",
			"value": "This is an example value",
			"profiles": [
				{
					"id": "1b9fc6ff-c4a6-4ac9-ba19-38fb8f82adv44",
					"type": "lom_profile",
					"name": "Hindi",
					"description": "An example LOM profile pointing to an MMA Term",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "term",
					"size": 4,
					"parentId": "",
					"order": "unordered",
					"example": "Hindi",
					"value": "d4a033ab-53b9-418f-9973-191097dc80b4",
					"value_space": "string"
				},
				{
					"id": "2c984b01-a761-4afd-8519-b708e45dda12",
					"type": "lom_profile",
					"name": "Gujrati",
					"description": "An example LOM profile of duration type",
					"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a34578",
					"data_type": "duration",
					"size": "max 3",
					"parentId": "",
					"order": "ordered",
					"example": "P10m45s",
					"value": "P3m58s",
					"value_space": "string"
				}
			],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Music",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"0a552eafe-dc6e-49b5-bb07-4ff93a345fesc": {
			"id": "0a552eafe-dc6e-49b5-bb07-4ff93a345fesc",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Speaking",
			"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"value": "This is an example value",
			"profiles": [],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Speaking",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"er6frdyf-dc6e-49b5-bb07-4ff93a703482": {
			"id": "er6frdyf-dc6e-49b5-bb07-4ff93a703482",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Writing",
			"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"value": "This is an example value",
			"profiles": [],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Writing",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		},
		"er6frdyf-dc6e-49b5-bb07-4ff9334f2": {
			"id": "er6frdyf-dc6e-49b5-bb07-4ff9334f2",
			"type": "lom_node",
			"url": "https://meta-xapi-dev.cambridgeone.org/v2/resources/lom/0a552eafe-dc6e-49b5-bb07-4ff93a703482",
			"name": "Advance",
			"parent_id": "0a552eafe-dc6e-49b5-bb07-4ff93a345fesc",
			"value": "This is an example value",
			"profiles": [],
			"last-modified": {
				"time": null,
				"by": ""
			},
			"meta": {
				"name": "Advance",
				"description": "An example LOM node",
				"data_type": "langstring"
			}
		}
	}
};
createTreeFromFlattened(map);