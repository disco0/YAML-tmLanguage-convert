#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert = __importStar(require("./index"));
const options_1 = __importDefault(require("./options"));
// Run if script invoked directly
if (require.main === module) {
    // If explicit output path given -> one file in and out
    if ('out-file' in options_1.default && typeof options_1.default['out-file'] === 'string') {
        convert.startProcessingFile(options_1.default['input-file'][0], { outputPath: options_1.default['out-file'] });
    }
    // If explicit output dir given, or not -> multiple files
    else {
        const config = { outputDir: options_1.default['out-dir'] };
        for (const inputPath of options_1.default['input-file']) {
            convert.startProcessingFile(inputPath, config);
        }
    }
}
// Print warning if used incorrectly
else {
    console.error(`WARNING: This command script should be invoked directly.`);
}
//# sourceMappingURL=yamltm-convert.js.map