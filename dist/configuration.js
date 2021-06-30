"use strict";
//#region Imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTargets = exports.paths = void 0;
const path_1 = __importDefault(require("path"));
//#endregion Imports
var paths;
(function (paths) {
    paths.project = path_1.default.resolve(__dirname, '../../');
    paths.syntaxes = path_1.default.resolve(paths.project, 'syntaxes');
})(paths = exports.paths || (exports.paths = {}));
var defaultTargets;
(function (defaultTargets) {
    defaultTargets.source = path_1.default.resolve(paths.syntaxes, 'fennel.tmLanguage.yaml');
    defaultTargets.output = path_1.default.resolve(paths.syntaxes, 'fennel.tmLanguage.json');
})(defaultTargets = exports.defaultTargets || (exports.defaultTargets = {}));
exports.default = { paths, targets: defaultTargets };
//# sourceMappingURL=configuration.js.map