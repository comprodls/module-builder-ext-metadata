'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * calls an external url with a authentication key.
 * @param {String} url - url to request.
 * @param {String} key - API key for authentication of endpoint.
 * @returns {Promise}  Promise which gets resolve with requested url response.
 */
var get = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url, key) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', new _promise2.default(function (resolve, reject) {
                            try {
                                var options = {
                                    url: url,
                                    method: 'get',
                                    headers: {
                                        'x-api-key': key
                                    }
                                };
                                syslog.info('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=HTTP_GET_REQUEST, get ' + ' fetch data for url = ' + url);
                                request(options, function (err, res, body) {
                                    if (err) {
                                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=HTTP_GET_REQUEST, get ' + 'error for url = ' + url + (0, _stringify2.default)(err));
                                        return resolve({});
                                    }
                                    if (res.statusCode == 404) {
                                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE_CUP, TYPE=HTTP_GET_REQUEST, get ' + 'data not found for  url = ' + url);
                                        return resolve({});
                                    }
                                    return resolve(JSON.parse(body));
                                });
                            } catch (err) {
                                return reject(err);
                            }
                        }));

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function get(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*********************************Library References****************************************************************/
var request = require('request');

/*********************************Global Variables******************************************************************/

/*********************************Functions************************************************************************/

/**
 * returns latest taxonomy data corresponding to taxonomy's id.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @param { String }  id - Taxonomy Id.
 * @returns { Promise } Promise which gets resolved with latest taxonomy data.
 */
function getLatestTaxonomyById(config, id) {
    // generate url from base url for Latest Taxonomy
    var taxonomyUrl = config.url + '/taxonomies/' + id + '/latest';
    return get(taxonomyUrl, config.apiKey);
}

/**
 * returns Proxy data corresponding to term's proxy id.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @param { String }  id - Proxy Id.
 * @returns { Promise } Promise which gets resolved with term's proxy data.
 */
function getProxyById(config, id) {
    // generate url from base url for proxy
    var proxyUrl = config.url + '/proxies/' + id;
    return get(proxyUrl, config.apiKey);
}

module.exports = { getLatestTaxonomyById: getLatestTaxonomyById, getProxyById: getProxyById };