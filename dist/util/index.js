"use strict";
//#region Imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibleLength = exports.timestamp = exports.cwdRelative = exports.repoRelative = void 0;
const path_1 = __importDefault(require("path"));
const timestamp_1 = require("./timestamp");
Object.defineProperty(exports, "timestamp", { enumerable: true, get: function () { return timestamp_1.timestamp; } });
const configuration_1 = __importDefault(require("../configuration"));
//#endregion Imports
/**
 * Get length of string without ANSI escapes (expecting color codes)
 */
function visibleLength(string) {
    return string.split(/\x1B\[.+?m/).join('').length;
}
exports.visibleLength = visibleLength;
const repoRelative = (toPath) => path_1.default.relative(configuration_1.default.paths.project, toPath);
exports.repoRelative = repoRelative;
const cwdRelative = (toPath) => path_1.default.relative(process.cwd(), toPath);
exports.cwdRelative = cwdRelative;
exports.default = {
    timestamp: timestamp_1.timestamp,
    visibleLength
};
//# sourceMappingURL=index.js.map