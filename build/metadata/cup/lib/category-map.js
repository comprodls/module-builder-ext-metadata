'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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
 * @returns { Promise } Promise which gets resolved categoryMap.
 */
var getCategoryMap = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(options, config) {
        var flattenedMap, response;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return getFlattenedMap(options.taxonomy, config);

                    case 3:
                        flattenedMap = _context.sent;

                        // Convert the FlatMap obtained from above step and convert it into Hierarchical Map (Builder Friendly Format).
                        response = createMapFromFlattened(flattenedMap);
                        return _context.abrupt('return', _promise2.default.resolve(response));

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', _promise2.default.log(_context.t0));

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 8]]);
    }));

    return function getCategoryMap(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * Fetch all taxonomies and their corresponding color in respective flatMaps.
 * @param { Object }  taxonomies -  taxonomy list .
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns {Promise} Promise which gets resolved with taxonomy flatmap and corresponding color flatmap.
 */


var getFlattenedMap = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(taxonomies, config) {
        var response, promiseArray, colorMap, taxonomyId, result, i;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        response = {};
                        promiseArray = [];
                        colorMap = {};
                        // Loop over taxonomy list and make a call for each taxonomy id and store the promise in an promiseArray.
                        // Similarly make ColorMap in which every taxonomy id has a corresponding theme.

                        for (taxonomyId in taxonomies) {
                            colorMap[taxonomyId] = taxonomies[taxonomyId].theme || 'black'; // Chosen black as a fallback color
                            promiseArray.push(communicate.getLatestTaxonomyById(config, taxonomyId));
                        }

                        // Create a flatmap of taxonomies result and store it key-value pairs in response object where key = taxonomy_id
                        // and value = taxonomy data from API
                        _context2.next = 7;
                        return _promise2.default.all(promiseArray);

                    case 7:
                        result = _context2.sent;

                        for (i = 0; i < result.length; i++) {
                            if (result[i].data && result[i].data.id) {
                                response[result[i].data.id] = result[i].data;
                            }
                        }
                        // return the flattend taxonomies data and colorMap
                        return _context2.abrupt('return', _promise2.default.resolve({ taxonomies: response, colorMap: colorMap }));

                    case 12:
                        _context2.prev = 12;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', _promise2.default.reject(_context2.t0));

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 12]]);
    }));

    return function getFlattenedMap(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

/**
 * returns builder-friendly categoryMap Heirarchy.
 * @param { Object }  flattenedMap - Taxonomy data flatmap and its corresponding colormap.
 * @param { Object }  flattenedMap.taxonomies - Pass taxonomy list .
 * @param { Object }  flattenedMap.colorMap - Set true to fetch all docs and false to fetch categoryMap.
 * @returns { Object } categoryMap in builder format.
 */


function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*********************************Library References****************************************************************/
var communicate = require('./communicate');function createMapFromFlattened(flattenedMap) {
    var data = flattenedMap.taxonomies;
    var colorMap = flattenedMap.colorMap;

    // loop on flattened taxonomies data and transform it into builder format
    for (var id in data) {
        // put current iteration data into currentTax.
        var currentTax = data[id];
        var transformedTax = {};
        // Create transformedTax to return in builder format 
        // fill transformedTax.doc with whole data of current taxonomy.
        transformedTax.doc = currentTax;
        // fill transformedTax.tags with n level heirarchy of taxonomy terms.
        transformedTax.tags = createTree(currentTax.terms, id);
        // fill last modified information
        transformedTax.doc["last-modified"] = { time: null, by: "" };
        // fill theme and name info into meta node.
        transformedTax.doc.meta = { name: currentTax.name, theme: colorMap[id]
            // put parentid = 0 for taxonomies as they are on top level of hierarchy
        };transformedTax.doc.parentid = 0;
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
function createTree(termsArray, pid) {
    var recMap = {};
    var childParentMap = {};
    // loop for each term
    for (var i = 0; i < termsArray.length; i++) {
        // if childParentMap does not contain a node with currentTerm parentid.
        if (!childParentMap[termsArray[i].parentId]) {
            // if currentTerm parentid is "" (i.e root level term ).
            if (termsArray[i].parentId == "") {
                // push the term data  with 0 as key as it is root level term.
                childParentMap['0'] = childParentMap['0'] || [];
                childParentMap['0'].push(termsArray[i]);
            } else {
                // if parentid is not '' then create a new empty array in childParent map with current term parentid.
                childParentMap[termsArray[i].parentId] = [];
            }
        }

        // if current term parentid is not "" then push current term into childParent map against its parentid.
        if (termsArray[i].parentId != "") {
            childParentMap[termsArray[i].parentId].push(termsArray[i]);
        }
        // if childParent does not contain a node with term id then create a empty array node with key as term id.
        if (!childParentMap[termsArray[i]["id"]]) {
            childParentMap[termsArray[i]["id"]] = [];
        }
        // push the current term in front against the term id in childParent map.
        childParentMap[termsArray[i]["id"]].unshift(termsArray[i]);
    }
    /* create root level(hidden from user) which has id = 0 */
    childParentMap[0].unshift({
        "id": "0",
        "meta": {
            "name": "Zero"
        }
    });
    // call getChildren to make a n-level hierarchy and fill it into recMap. 
    getChildren(recMap, 0, pid);

    function getChildren(recMap, parentId, pid) {
        // if the childparent map has a node with passed parent id 
        if (childParentMap[parentId].length) {
            // loop into items on childparentmap parentid-node
            for (var _i = 1; _i < childParentMap[parentId].length; _i++) {

                recMap[childParentMap[parentId][_i]["masterId"]] = {
                    "doc": childParentMap[parentId][_i],
                    "tags": {}
                };

                recMap[childParentMap[parentId][_i]["masterId"]].doc['last-modified'] = {
                    by: "",
                    time: null
                };

                recMap[childParentMap[parentId][_i]["masterId"]].doc["meta"] = {
                    "name": recMap[childParentMap[parentId][_i]["masterId"]].doc.name,
                    "theme": ""
                    // put parentid = pid , pid here is passed parent id of currentitem
                };recMap[childParentMap[parentId][_i]["masterId"]].doc.parentid = pid;
                // put _id = masterId ,//for terms only
                recMap[childParentMap[parentId][_i]["masterId"]].doc["_id"] = recMap[childParentMap[parentId][_i]["masterId"]].doc.masterId;
                //delete duplicate parentId
                delete recMap[childParentMap[parentId][_i]["masterId"]].doc.parentId;
                // call getchildren again for current term childs with updated parameters.
                getChildren(recMap[childParentMap[parentId][_i]["masterId"]].tags, childParentMap[parentId][_i]["id"], childParentMap[parentId][_i]["masterId"]);
            }
        }
    }
    return recMap;
}

module.exports = { getCategoryMap: getCategoryMap };