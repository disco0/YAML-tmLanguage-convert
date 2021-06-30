"use strict";
//#region Imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const util_1 = require("./util");
const chalk_1 = __importDefault(require("chalk"));
const options_1 = require("./options");
//#endregion Imports
/**
 * Write timestamped log
 */
function log(...msg) {
    console.log(log.format([msg]));
}
exports.log = log;
(function (log) {
    function format(logArgs, timestampStyle) {
        return `${util_1.timestamp.color(timestampStyle)} ${logArgs.join(' ')}`;
    }
    log.format = format;
    function debug(...msg) {
        if (!debug.enabled())
            return;
        console.debug(log.format([msg]));
    }
    log.debug = debug;
    function trace(...msg) {
        if (!options_1.options.trace)
            return;
        console.debug(log.format([msg]));
    }
    log.trace = trace;
    function err(...msg) {
        console.error(log.format([msg], chalk_1.default.red.dim));
    }
    log.err = err;
    function warn(...msg) {
        console.warn(log.format([msg], chalk_1.default.yellow));
    }
    log.warn = warn;
    (function (debug) {
        let $enabled = options_1.options.verbose ?? false;
        function enabled() {
            return $enabled;
        }
        debug.enabled = enabled;
        function enable() {
            $enabled = true;
        }
        debug.enable = enable;
        function toggle() {
            $enabled = !$enabled;
        }
        debug.toggle = toggle;
        function disable() {
            $enabled = true;
        }
        debug.disable = disable;
    })(debug = log.debug || (log.debug = {}));
})(log = exports.log || (exports.log = {}));
exports.default = log;
//# sourceMappingURL=log.js.map