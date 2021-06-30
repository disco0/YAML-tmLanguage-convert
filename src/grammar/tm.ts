/**
 * Implements loading/compiling/expanding of defined variables in tmlanguage grammar—based on
 * TypeScript Grammar build.ts
 */

//#region Imports

import console from '../log'

//#endregion Imports


const { assign, entries, fromEntries, is, keys, values } = Object

//#region Declarations

declare interface MapLike<T>
{
    [s: string]: T;
}

export namespace tm
{
    export namespace Grammar
    {
        export interface Rule
        {
            name?: string;
        }

        export interface RuleName
        {
            name: string;
        }

        export interface MatchRule extends Rule
        {
            match:    string;
            captures: MapLike<RuleName>;
        }

        export interface BeginEndRule extends Rule
        {
            contentName?:   string;
            begin:          string;
            end:            string;
            beginCaptures?: MapLike<RuleName>;
            endCaptures?:   MapLike<RuleName>;
            patterns:       AnyRule[];
        }

        export interface IncludeRule extends Rule
        {
            include: string;
        }

        export type AnyRule =
            | MatchRule
            | BeginEndRule
            | IncludeRule

        export interface RepositoryPatterns
        {
            patterns: AnyRule[];
        }
    }

    export interface Grammar
    {
        name:       string;
        scopeName:  string;
        fileTypes:  string[];
        uuid:       string;
        variables?: MapLike<string>;
        patterns?:  tm.Grammar.AnyRule[];
        repository: MapLike<RepositoryRule>;
    }

    export type RepositoryRule =
        | Grammar.AnyRule
        | Grammar.RepositoryPatterns;

    export namespace Theme
    {
        export interface Setting
        {
            scope:    string;
            settings: { vsclassificationtype: string; };
        }
    }

    export interface Theme
    {
        name:     string;
        uuid:     string;
        settings: Theme.Setting[];
    }

    //#region Transforms

    export namespace transforms
    {
        export type PropTransform = (ruleProperty: string) => string;
        export type ReplacerTuple = [RegExp, string];

        export namespace variableExpansion
        {
            export function inRule(rule: MapLike<any>, propertyNames: string[], propertyTransformer: PropTransform)
            {
                for(const propertyName of propertyNames)
                {
                    const value = rule[propertyName];
                    if (typeof value === 'string')
                    {
                        rule[propertyName] = propertyTransformer(value);
                    }
                }

                for(const propertyName in rule)
                {
                    const value = rule[propertyName];
                    if (typeof value === 'object')
                    {
                        inRule(value, propertyNames, propertyTransformer);
                    }
                }
            }

            export function inRepository(grammar: tm.Grammar, propertyNames: string[], propertyTransformer: (ruleProperty: string) => string)
            {
                const repository = grammar.repository;
                for(const key in repository)
                {
                    inRule(repository[key], propertyNames, propertyTransformer);
                }
            }

            export function inValue(pattern: string, variableReplacers: ReplacerTuple[])
            {
                let result = pattern;
                for(const [variableName, value] of variableReplacers)
                {
                    result = result.replace(variableName, value);
                }
                return result;
            }

            function replacePatternVariables(pattern: string, variableReplacers: ReplacerTuple[])
            {
                let result = pattern;
                for(const [variableName, value] of variableReplacers)
                {
                    result = result.replace(variableName, value);
                }
                return result;
            }

            /**
             * Takes in a json grammar object `grammar` and replaces all defined pattern variables.
             * Original object is directly modified, but can also be received in return value.
             */
            export function processGrammar<G extends Grammar>(
                grammar:             G,
                additionalVariables: MapLike<string> = {}
              ): Omit<G, 'patterns'>
            {
                // Exit early if no variables defined
                if(!('variables' in grammar) || typeof grammar.variables !== 'object')
                    return grammar;

                /**
                 * Shadow grammar definitions with any additional variables passed
                 */
                const variables = {
                    ...fromEntries(entries(grammar.variables).flatMap(([k, v]) => entries(v))),
                    ...additionalVariables
                }
                delete grammar.variables;

                const variableReplacers: ReplacerTuple[] = [];
                console(`Loaded ${variables.length} variables for processing.`)
                for(const variableName of keys(variables))
                {
                    // Replace the pattern with earlier variables
                    const pattern = replacePatternVariables(variables[variableName], variableReplacers);
                    const regex = new RegExp(String.raw`(?<var>[{]{2}${ variableName }[}]{2})`, "gim")
                    console.debug(`Pattern Replacer: ${regex.source}`)
                    variableReplacers.push([regex, pattern]);
                }

                console.debug(`Read in %i variables for expansion.`, variableReplacers.length)

                inRepository(
                    grammar,
                    ["begin", "end", "match"],
                    pattern => replacePatternVariables(pattern, variableReplacers)
                );

                return grammar;
            }
        }

        /**
         * Can't use for now, won't properly handle nested variables without some kind of context with
         * previously defined variables (maybe a static builder function?)
         */
        class VariableExpansion
        {
            readonly replacement: string;
            readonly name:        string;
            readonly matcher:     RegExp

            constructor(name: string, pattern: string | RegExp)
            {
                this.name = name
                this.replacement = typeof pattern === 'string'
                    ? pattern
                    : JSON.stringify(pattern.source).slice(1,-1)
                this.matcher = new RegExp(`{{${name}}}`, 'gim')
            }
        }
    }
}

//#endregion Declarations


//#endregion Transforms

export import  processGrammar = tm.transforms.variableExpansion.processGrammar
export default tm.transforms.variableExpansion.processGrammar