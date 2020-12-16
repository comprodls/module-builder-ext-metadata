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
 * returns all of taxonomy and its term docs.
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns { Promise } Promise which gets resolved with all taxonomy and its term docs.
 */
var getAllDocs = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(options, config) {
        var docs, response;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return fetchAllDocs(options, config);

                    case 3:
                        docs = _context.sent;

                        // transform all taxonomies and terms into builder format doc
                        response = transform(docs.data, docs.colorMap);
                        return _context.abrupt('return', _promise2.default.resolve(response));

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', _promise2.default.reject(_context.t0));

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 8]]);
    }));

    return function getAllDocs(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * Fetch all taxonomies and their corresponding color in  respective flatMaps.
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns {Promise} Promise which gets resolved with taxonomy flatmap and corresponding color flatmap.
 */


var fetchAllDocs = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(options, config) {
        var taxonomies, promiseArray, colorMap, taxonomyId, response, results, i;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        taxonomies = options.taxonomy || {};
                        promiseArray = [];
                        colorMap = [];
                        //loop for each taxonomy in taxonomies array

                        for (taxonomyId in taxonomies) {
                            // put a color in colormap corresponding to each taxonomyId.
                            colorMap[taxonomyId] = taxonomies[taxonomyId].theme;
                            // push each latest call into promiseArray.
                            promiseArray.push(communicate.getLatestTaxonomyById(config, taxonomyId));
                        }
                        response = [];
                        //resolve all taxonomies call

                        _context2.next = 8;
                        return _promise2.default.all(promiseArray);

                    case 8:
                        results = _context2.sent;

                        // push each taxonomy results against their taxonomy id in the response map.
                        for (i = 0; i < results.length; i++) {
                            if (results[i].data && results[i].data.id) {
                                response.push(results[i].data);
                            }
                        }
                        return _context2.abrupt('return', _promise2.default.resolve({ data: response, colorMap: colorMap }));

                    case 13:
                        _context2.prev = 13;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', _promise2.default.reject(_context2.t0));

                    case 16:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 13]]);
    }));

    return function fetchAllDocs(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

/**
 * transforms all the taxonimies data into builder docs format
 * @param { Object } collection - collection of taxonomies data
 * @param { Object } colorMap - colorMap of taxonomyid vs their theme color
 * @returns {Object} A flatmap of docs (including taxonomy , terms , child terms) in builder format.
 */


function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*********************************Library References****************************************************************/
var communicate = require('./communicate');function transform(collection, colorMap) {
    var response = [];
    var termProxyMap = {};
    // loop for each taxonomy data 
    for (var i = 0; i < collection.length; i++) {
        // store terms of a taxonomy 
        var terms = collection[i].terms;
        // convert taxonomy data into builder doc format
        response.push(convertToBuilderFormat(collection[i], '0', {}, colorMap));
        // check if current taxonomy has terms
        if (terms.length > 0) {
            // loop for terms inside a taxonomy
            for (var j = 0; j < terms.length; j++) {
                // store termid vs their proxyid in a termProxyMap.
                termProxyMap[terms[j].id] = terms[j].masterId;
                // convert each term into builder doc format.
                response.push(convertToBuilderFormat(terms[j], collection[i].id, termProxyMap, colorMap));
            }
        }
    }
    // return final flatmap ( including taxonomies , terms and child terms ....) in builder format
    return response;
}

/**
 * converts passed data into builder doc format.
 * @param { Object } item - data to convert into builder format
 * @param { String } parentId - parent id of the item.
 * @param { Object } termProxyMap - termProxyMap to find parent proxy of a term.
 * @param { Object } colorMap - colorMap to insert color into builder doc against taxonomy id.
 * @returns { Object } - data in builder format.
 */
function convertToBuilderFormat(item, taxonomyId, termProxyMap, colorMap) {
    var format = {
        "last-modified": { by: "", time: Date.now() },
        meta: { name: "" },
        parentid: null,
        _id: null

        /* 
        if taxonomy put parentid = 0
        if parentTerm put parentid = taxonomyId 
        if childterm  put parentid = proxyid of parent term 
        */
    };format.parentid = item.label == 'taxonomy' ? "0" : item.parentId == "" ? taxonomyId : termProxyMap[item.parentId];
    /* 
    if taxonomy put _id = id of taxonomy
    if term put _id = proxy id of that term 
    */
    format._id = item.label == 'taxonomy' ? item.id : item.masterId;
    // put rest of data into meta node
    format.meta = item;
    format.meta.name = item.name;

    // if taxonomy put theme into its meta node and delete terms node as it is not needed.
    if (item.label == 'taxonomy') {
        format.meta.theme = colorMap[item.id] || 'black';
        delete format.meta.terms;
    }
    // delete unused parentId to avoid confusion
    delete format.meta.parentId;
    return format;
}

module.exports = { getAllDocs: getAllDocs };