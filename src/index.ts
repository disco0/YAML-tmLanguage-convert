#!node

//#region Imports

import fs from 'fs';

import c from 'chalk'
import path from 'path'
import chokidar from 'chokidar'
import jsYaml from 'js-yaml'
import { YAMLException } from 'js-yaml'
import { NonUndefined as Defined } from 'tsdef'

import { timestamp, visibleLength, cwdRelative } from './util'
import { tm, processGrammar } from './expand-grammar-variables'
import { paths, defaultTargets } from './configuration'
import options from './options'
import {log as console, log as log} from './log'
import { embedLink } from './util/ansi'

//#endregion Imports

//#region Config

// Used to validate schema (@TODO: actually nvm figure out how to load this as a schema)
const tmLanguageSchemaURL = 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json'

//#endregion Config

//#region js-yaml

/** @TODO Move all js-yaml related code into `./yaml-load.ts` */

interface YAMLExceptionEx extends YAMLException
{
    reason: string;
    mark?:
    {
        name:     string
        buffer:   string
        snippet:  string
        line:     number
        column:   number
        position: number
    }
}

interface LoadOptions extends jsYaml.LoadOptions
{
    onWarning(this: void, e: YAMLException): void;
}

type LoadWarning = Exclude<LoadOptions['onWarning'], undefined>;

const onWarning: LoadWarning & ThisType<null | void> = (yamlException) =>
{
    const {
        name: errorName,
        message,
        stack = '',
        mark
    } = yamlException as YAMLExceptionEx;

    // Can't remember why I did a beginning newline here—try to move to log module functions
    console.err([
        c.red.bold`YAML Load Error:`,
        ... mark?.name ? [
            c.red`Path: ${c.red.bold.underline.italic(
                [
                    cwdRelative(mark.name),
                    // Fix off by one for line
                    ...mark.line ? [[(mark.line + 1), mark.column ?? 0].join(':')] : []
                ].join(":")
            )}`,
        ] : [ ],
        c.red`    ${message}`
    ].join('\n'))
}

const EventTypeColor: Record<jsYaml.EventType, c.Chalk> =
{
    open:  c.green,
    close: c.red.dim
}

const traceLoadEvent = (function(eventType, state)
{
    // Ignore termination chars or weird positions
    if(state.position > state.input.length - 1 || state.input[state.position] === `\u0000`)
        return;
    (lines =>
    {
        const lineMeta = `${
            EventTypeColor[eventType](eventType)
        }${
            ' '.repeat(Math.max(0, 6 - eventType.length))
        } <${
            c.red.italic(JSON.stringify(state.input[state.position]).replace(/^["]|["]$/gm, ''))
            // c.red.italic(JSON.stringify(state.input[state.position]).slice(1, -1))
        }>`
        console.trace(`${lineMeta}${' '.repeat(Math.max(0, 16 - visibleLength(lineMeta)))}${
            state.line < lines.length
                ? " " + c.bgAnsi256(253)(lines[state.line - 1])
                : ""
        }`)
    })(state.input.split(/\r?\n/gm))
} as Defined<jsYaml.LoadOptions['listener']>)

function convertYamlToJsonFile(path: string, outputPath: string)
{
    const result = buildJsonGrammar(path)

    // Already printed error, just duck out
    // @TODO: Move error logging out of main conversion function
    if(result instanceof Error)
        return;

    if(!result)
    {
        console.warn(c.yellow.italic`No result.`)
        return;
    }

    if(typeof result === 'object' && 'repository' in result)
    {
        const newJsonTargetSrc = JSON.stringify(result, null, 4)
        if(options['dry-run'])
        {
            console(c.gray`[Dry Run] ` + c.green`Updated: ${c.underline.green`${embedLink(cwdRelative(outputPath), `file:///${outputPath}`)}`}`)
        }
        else
        {
            fs.writeFileSync(outputPath, newJsonTargetSrc)
            log(c.green`Updated: ${c.underline.green`${embedLink(cwdRelative(outputPath), `file:///${outputPath}`)}`}`)
        }
        return
    }
}

//#endregion js-yaml

/**
 * Attempt to convert input to JSON object and expand variables if defined. Returns resulting object
 * or error value on exception.
 */
function buildJsonGrammar(yamlFilePath: string): ReturnType<typeof jsYaml.load> | YAMLException
{
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8')
    try
    {
        const loaded = jsYaml.load(yamlContent, {
            filename: yamlFilePath,
            onWarning,
            ...options.trace ? {
                listener: traceLoadEvent
            } : { }
        })

        if(!!loaded && typeof loaded === 'object')
            return processGrammar(loaded as tm.Grammar)
        else
            throw new Error('Loaded YAML content is not an object.')
    }
    catch(yamlException)
    {
        if(!!yamlException)
            onWarning(yamlException as YAMLException)

        return yamlException as YAMLException
    }
}

function replaceExtension(inputBasename: string)
{
    if(inputBasename.match(/\.tmlanguage\.yaml$/i))
        return inputBasename.replace(/\.tmlanguage\.yaml$/i, '.tmLanguage.json')
    else if(inputBasename.match(/\.yaml.tmlanguage$/i))
        return inputBasename.replace(/\.yaml(.)tmlanguage$/i, 'json$1tmLanguage')
    else
        throw new Error('Failed to match file extension for renaming: ' + inputBasename.split('.', 1)[0])
}

function startProcessingFile(inputPath: string, config: { outputDir?: string, outputPath?: string } = { })
{
    inputPath = path.resolve(inputPath)
    if(!(fs.existsSync(inputPath)))
    {
        log.err(c.red`Incorrect yaml grammar path: ${c.underline.red`${embedLink(cwdRelative(inputPath), `file:///${inputPath}`)}`}`)
        return;
    }

    const outputBaseName = replaceExtension(path.basename(inputPath)) //  + '.json-tmLanguage'
    let outputPath = path.resolve(path.dirname(inputPath), outputBaseName);
    // Resolve output path
    if('outputDir' in config && typeof config.outputDir === 'string')
    {
        outputPath = path.resolve(config.outputDir, outputBaseName)
    }
    else if('outputPath' in config && typeof config.outputPath === 'string')
    {
        outputPath = config.outputPath;
    }

    // If --once passed run and exit
    if(options.once)
    {
        log(' ' + c.ansi256(32)`Running once.`)
        convertYamlToJsonFile(inputPath, outputPath)
        return
    }

    const watcher = chokidar.watch(inputPath, {
        disableGlobbing: true,
        persistent: true
    });

    const listeners: Partial<Record<'change', chokidar.FSWatcher>> = { }

    const onChange = function(path: string, stats?: fs.Stats)
    {
        log(c.ansi256(32)`Changed: ${c.underline`${cwdRelative(path)}`}`)

        convertYamlToJsonFile(path, outputPath)
    }

    listeners.change = watcher.on('change', onChange)

    if(!options.wait)
        onChange(inputPath);
}

// Run if script invoked directly
if (require.main === module)
{
    // If explicit output path given -> one file in and out
    if('out-file' in options && typeof options['out-file'] === 'string')
    {
        startProcessingFile(options['input-file'][0], { outputPath:  options['out-file'] })
    }
    // If explicit output dir given, or not -> multiple files
    else
    {
        const config = { outputDir: options['out-dir']}
        for(const inputPath of options['input-file'])
        {
            startProcessingFile(inputPath, config)
        }
    }
}

export { startProcessingFile as init }