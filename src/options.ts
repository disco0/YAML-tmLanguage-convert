//#region Imports

import { MaybePromisedType } from 'tsdef'
import yargs from 'yargs/yargs'

import { paths, defaultTargets } from './configuration'

//#endregion Imports

const optionParser = yargs(process.argv.slice(2))
    .options({
        trace:
        {
            boolean: true,
            description: "Trace yaml parsing to stdout",
            alias: ['T']
        },
        verbose:
        {
            boolean: true,
            description: "Enable verbose output",
            alias: ['v']
        },
        ['dry-run']:
        {
            boolean:true,
            description: "Transpile source, but don't update output file.",
            // conflicts: ['input-file'],
            alias: ['t']
        },
        ['wait']:
        {
            description: "Wait for first change to transpile input.",
            boolean: true,
            alias: ['w'],
        },
        ['once']:
        {
            description: "Transpile immediately and exit.",
            boolean: true,
            conflicts: ['wait'],
            alias: ['O']
        },
        ['out-dir']:
        {
            description: "Output directory for transpiled json grammars, defaults to directory of input files.",
            requiresArg: true,
            string: true,
            alias: ['d'],
            normalize: true,
            conflicts: ['out-file'],
        },
        ['out-file']:
        {
            string: true,
            description: "Output file path for transpiled json grammar.",
            // default: defaultTargets.output,
            requiresArg: true,
            normalize: true,
            alias: ['o'],
            conflicts: ['out-dir'],
        },
        ['input-file']:
        {
            // string: true,
            type: "array",
            description: "Path of input YAML grammar. Accepts multiple values and repeat passes.",
            // default: defaultTargets.source,
            requiresArg: true,
            normalize: true,
            array: true,
            alias: ['i'],
            default: ([ ] as string[])
        }
    })
    .parserConfiguration({
        "greedy-arrays": true,
        // 'set-placeholder-key': true,
        'strip-aliased': true,
        "parse-numbers": false,
        "camel-case-expansion": false,
        "flatten-duplicate-arrays": true,
        "parse-positional-numbers": false
        // 'halt-at-non-option': true
    })

// Fix for broken yargs types
export const options = (<T>(poorlyTyped: T): MaybePromisedType<T> =>
    (poorlyTyped as MaybePromisedType<T>)
)(optionParser.argv)

// Push in remaining args, if needed
if(options._.length > 0)
{
    if(options._.indexOf('--') !== -1)
    {
        options['input-file'].push(...(options._ as string[]).slice(options._.indexOf('--')))
        options._.length = options._.indexOf('--') - 1;
    }
    else
    {
        options['input-file'].push(...(options._ as string[]).slice(options._.indexOf('--')))
        options._.length = 0
    }
}

// Exit with help if no input files (not done in main chain due to above shifting of args)
if(!(options['input-file'].length > 0))
{
    console.error(`Requires at least one input file.`)
    optionParser.showHelp()
    process.exit(4)
}

export default options