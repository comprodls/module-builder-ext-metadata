'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/*********************************Global Variables******************************************************************/
// let externalMetadataConfig = null;


/*********************************Functions************************************************************************/

/**
 * returns  categoryMap/docs fetched from MMA endpoints .
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @returns { Promise } Promise which gives category map / docs when resolved.
 * 
 */
var getMetadata = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(options, externalMetadataConfig) {
        var response;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;

                        syslog.info('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_METADATA, getMetadata ' + 'received request to fetch metadata ');
                        //if config is empty reject with Library not Initialized Error

                        if (externalMetadataConfig) {
                            _context.next = 5;
                            break;
                        }

                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_METADATA, getMetadata ' + 'Library is not initialized i.e configuration missing ');
                        return _context.abrupt('return', _promise2.default.reject({ success: false, err: new Error("Library is not initialized ") }));

                    case 5:
                        if (!(!options || !options.taxonomy || options.taxonomy.length == 0)) {
                            _context.next = 8;
                            break;
                        }

                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_METADATA, getMetadata ' + 'Taxonomy List is Empty or Not Present');
                        return _context.abrupt('return', _promise2.default.reject({ success: false, err: "Taxonomy List is Empty or Not Present" }));

                    case 8:
                        response = void 0;
                        // if docs flag is true fetch all docs and convert into builder format and return 

                        if (!(options.docs && options.docs == true)) {
                            _context.next = 15;
                            break;
                        }

                        _context.next = 12;
                        return docsMethod.getAllDocs(options, externalMetadataConfig);

                    case 12:
                        response = _context.sent;
                        _context.next = 18;
                        break;

                    case 15:
                        _context.next = 17;
                        return categoryMap.getCategoryMap(options, externalMetadataConfig);

                    case 17:
                        response = _context.sent;

                    case 18:
                        return _context.abrupt('return', _promise2.default.resolve({ success: true, data: response }));

                    case 21:
                        _context.prev = 21;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', _promise2.default.reject({ success: false, err: _context.t0 }));

                    case 24:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 21]]);
    }));

    return function getMetadata(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

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


var getTagDetails = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(id, externalMetadataConfig) {
        var results;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;

                        syslog.info('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_TAG, getTagDetails ' + 'received request to fetch tag details for  ' + id);
                        //if config is empty reject with Library not Initialized Error

                        if (externalMetadataConfig) {
                            _context2.next = 5;
                            break;
                        }

                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_TAG, getTagDetails ' + 'Library is not initialized i.e configuration missing ');
                        return _context2.abrupt('return', _promise2.default.reject({ success: false, err: new Error("Library is not initialized ") }));

                    case 5:
                        if (id) {
                            _context2.next = 8;
                            break;
                        }

                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=GET_TAG, getTagDetails ' + 'proxyId is empty');
                        return _context2.abrupt('return', _promise2.default.reject(new Error("Please provide a valid proxy id")));

                    case 8:
                        _context2.next = 10;
                        return communicate.getProxyById(externalMetadataConfig, id);

                    case 10:
                        results = _context2.sent;
                        return _context2.abrupt('return', _promise2.default.resolve(results));

                    case 14:
                        _context2.prev = 14;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', _promise2.default.reject(_context2.t0));

                    case 17:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 14]]);
    }));

    return function getTagDetails(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*********************************Library References****************************************************************/
var _require = require('./lib/helper'),
    validateConfig = _require.validateConfig;

var communicate = require('./lib/communicate');
var categoryMap = require('./lib/category-map');
var docsMethod = require('./lib/docs-method');

module.exports = { getMetadata: getMetadata, getTagDetails: getTagDetails };