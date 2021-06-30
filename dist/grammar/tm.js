"use strict";
/**
 * Implements loading/compiling/expanding of defined variables in tmlanguage grammar—based on
 * TypeScript Grammar build.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGrammar = exports.tm = void 0;
//#region Imports
const log_1 = __importDefault(require("../log"));
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
                    inRule(repository[key], propertyNames, propertyTransformer);
                }
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
                /**
                 * Shadow grammar definitions with any additional variables passed
                 */
                const variables = {
                    ...fromEntries(entries(grammar.variables).flatMap(([k, v]) => entries(v))),
                    ...additionalVariables
                };
                delete grammar.variables;
                const variableReplacers = [];
                log_1.default(`Loaded ${variables.length} variables for processing.`);
                for (const variableName of keys(variables)) {
                    // Replace the pattern with earlier variables
                    const pattern = replacePatternVariables(variables[variableName], variableReplacers);
                    const regex = new RegExp(String.raw `(?<var>[{]{2}${variableName}[}]{2})`, "gim");
                    log_1.default.debug(`Pattern Replacer: ${regex.source}`);
                    variableReplacers.push([regex, pattern]);
                }
                log_1.default.debug(`Read in %i variables for expansion.`, variableReplacers.length);
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
//# sourceMappingURL=tm.js.map