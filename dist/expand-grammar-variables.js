"use strict";
/**
 * Implements loading/compiling/expanding of defined variables in tmlanguage grammar—based on
 * TypeScript Grammar build.ts
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGrammar = exports.tm = void 0;
//#region Imports
const log_1 = __importStar(require("./log"));
//#endregion Imports
const { assign, entries, fromEntries, is, keys, values } = Object;
var tm;
(function (tm) {
    //#region Transforms
    let transforms;
    (function (transforms) {
        let variableExpansion;
        (function (variableExpansion) {
            function inRule(rule, propertyNames, propertyTransformer) {
                for (const propertyName of propertyNames) {
                    const value = rule[propertyName];
                    if (typeof value === 'string') {
                        rule[propertyName] = propertyTransformer(value);
                    }
                }
                for (const propertyName in rule) {
                    const value = rule[propertyName];
                    if (typeof value === 'object') {
                        inRule(value, propertyNames, propertyTransformer);
                    }
                }
            }
            variableExpansion.inRule = inRule;
            function inRepository(grammar, propertyNames, propertyTransformer) {
                const repository = grammar.repository;
                for (const key in repository) {
                    log_1.default.debug(`  Repository Key: ${key}`);
                    inRule(repository[key], propertyNames, propertyTransformer);
                }
                return repository;
            }
            variableExpansion.inRepository = inRepository;
            function inValue(pattern, variableReplacers) {
                let result = pattern;
                for (const [variableName, value] of variableReplacers) {
                    result = result.replace(variableName, value);
                }
                return result;
            }
            variableExpansion.inValue = inValue;
            function replacePatternVariables(pattern, variableReplacers) {
                let result = pattern;
                for (const [variableName, value] of variableReplacers) {
                    result = result.replace(variableName, value);
                }
                return result;
            }
            /**
             * Takes in a json grammar object `grammar` and replaces all defined pattern variables.
             * Original object is directly modified, but can also be received in return value.
             */
            function processGrammar(grammar, additionalVariables = {}) {
                // Exit early if no variables defined
                if (!('variables' in grammar) || typeof grammar.variables !== 'object')
                    return grammar;
                log_1.default.debug(`Variables Table:`);
                if (log_1.log.debug.enabled())
                    console.dir(grammar.variables);
                /**
                 * Shadow grammar definitions with any additional variables passed
                 */
                const variables = {
                    ...grammar.variables,
                    ...additionalVariables
                };
                delete grammar.variables;
                const variableReplacers = [];
                for (const variableName of keys(variables)) {
                    // Replace the pattern with earlier variables
                    const pattern = replacePatternVariables(variables[variableName], variableReplacers);
                    const tuple = [new RegExp(String.raw `(?<var>[{]{2}${variableName}[}]{2})`, "gim"), pattern];
                    variableReplacers.push(tuple);
                    log_1.default.debug(`  Registered ${tuple[1]}: ${tuple[0].source}`);
                }
                log_1.default.debug(`Read in ${variableReplacers.length} variables for expansion. (variableReplacers: ${typeof variableReplacers}`);
                inRepository(grammar, ["begin", "end", "match"], pattern => replacePatternVariables(pattern, variableReplacers));
                return grammar;
            }
            variableExpansion.processGrammar = processGrammar;
        })(variableExpansion = transforms.variableExpansion || (transforms.variableExpansion = {}));
        /**
         * Can't use for now, won't properly handle nested variables without some kind of context with
         * previously defined variables (maybe a static builder function?)
         */
        class VariableExpansion {
            constructor(name, pattern) {
                this.name = name;
                this.replacement = typeof pattern === 'string'
                    ? pattern
                    : JSON.stringify(pattern.source).slice(1, -1);
                this.matcher = new RegExp(`{{${name}}}`, 'gim');
            }
        }
    })(transforms = tm.transforms || (tm.transforms = {}));
})(tm = exports.tm || (exports.tm = {}));
//#endregion Declarations
//#endregion Transforms
exports.processGrammar = tm.transforms.variableExpansion.processGrammar;
exports.default = tm.transforms.variableExpansion.processGrammar;
//# sourceMappingURL=expand-grammar-variables.js.map