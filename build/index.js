'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getExternalMetadata = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(config, docs) {
        var externalMetadataModule, parameters, results;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;

                        syslog.info('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_EXTERNAL_METADATA, getExternalMetadata ' + 'received request to feth metadata for ' + config.id);
                        _context.next = 4;
                        return getClientInstance(config.id);

                    case 4:
                        externalMetadataModule = _context.sent;

                        // // configure the external module
                        // await externalMetadataModule.configure(config.source); 
                        // fetch parameters for external Metadata function.
                        parameters = fetchGetMetadataParameters(config, docs);

                        if (parameters) {
                            _context.next = 8;
                            break;
                        }

                        throw new Error('parameters for organization not found with id ' + config.id);

                    case 8:
                        _context.next = 10;
                        return externalMetadataModule.getMetadata.apply(externalMetadataModule, (0, _toConsumableArray3.default)(parameters).concat([config.source]));

                    case 10:
                        results = _context.sent;
                        return _context.abrupt('return', _promise2.default.resolve(results));

                    case 14:
                        _context.prev = 14;
                        _context.t0 = _context['catch'](0);

                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_EXTERNAL_METADATA, getExternalMetadata ' + (0, _stringify2.default)(_context.t0));
                        return _context.abrupt('return', _promise2.default.reject(_context.t0));

                    case 18:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 14]]);
    }));

    return function getExternalMetadata(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * returns instance of module corresponding to clientId.
 * @param {String} orgId  client id corresponding to the external module.
 * @returns {Object} instance of module corresponding to clientId.
 */


var getClientInstance = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(clientId) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!organizationMap[clientId]) {
                            _context2.next = 4;
                            break;
                        }

                        return _context2.abrupt('return', _promise2.default.resolve(organizationMap[clientId]));

                    case 4:
                        return _context2.abrupt('return', _promise2.default.reject("Organization External Metadata Module not found with id " + clientId));

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getClientInstance(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

/**
 * return parameters needed to call getMetadata corresponfing to a specific clientId.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {Boolean} docs whether to fetch docs or categoryMap. Fallback is categoryMap.
 * @returns {Object} parameters needed to call getMetadata 
 */


/**
 * return tag details for a id.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {String} id - tag id to fetch details for .
 * @returns {Object} tag details for a id.
 */
var getTagDetails = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(config, id) {
        var externalMetadataModule, result;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;

                        syslog.info('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_TAG_DETAILS, getTagDetails ' + 'received request to fetch tag for ' + id);
                        // get clientInstance
                        _context3.next = 4;
                        return getClientInstance(config.id);

                    case 4:
                        externalMetadataModule = _context3.sent;
                        _context3.next = 7;
                        return externalMetadataModule.getTagDetails(id, config.source);

                    case 7:
                        result = _context3.sent;
                        return _context3.abrupt('return', _promise2.default.resolve(result));

                    case 11:
                        _context3.prev = 11;
                        _context3.t0 = _context3['catch'](0);

                        syslog.error('SOURCE=EXTERNAL_METADATA_MODULE, TYPE=GET_TAG_DETAILS, getExternalMetadata ' + (0, _stringify2.default)(_context3.t0));
                        return _context3.abrupt('return', _promise2.default.reject(_context3.t0));

                    case 15:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 11]]);
    }));

    return function getTagDetails(_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*********************************Org References****************************************************************/
var cup = require('./metadata/cup/index');

/*********************************Global Variables******************************************************************/

var organizationMap = {
    'cup': cup

    /*********************************Functions************************************************************************/
    /**
     * return docs collection or categoryMap when resolved corresponding to clientId.
     * @param {Object} config configuration options for the external module.
     * @property config.id --> client id corresponding to the external module.
     * @property  config.source --> Urls and secrets needed by the external module.
     * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
     * @param {Boolean} docs whether to fetch docs or categoryMap. Fallback is categoryMap.
     * @returns {Promise} docs collection or categoryMap when resolved
     */
};function fetchGetMetadataParameters(config, docs) {
    switch (config.id) {
        case 'cup':
            return [{ taxonomy: config['builder-mapping'].category[config['builder-mapping'].category.id], docs: docs || false }];
        default:
            return null;
    }
}

module.exports = { getExternalMetadata: getExternalMetadata, getTagDetails: getTagDetails };