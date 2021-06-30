"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = __importDefault(require("./options"));
console.log(`Parsed options:`);
console.dir(Object.fromEntries(Object.entries(options_1.default)), { depth: 5, showHidden: true, colors: true, getters: true });
//# sourceMappingURL=options-spec.js.map