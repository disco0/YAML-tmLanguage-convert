#!node
"use strict";
//#region Imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const util_1 = require("./util");
const expand_grammar_variables_1 = require("./expand-grammar-variables");
const options_1 = __importDefault(require("./options"));
const log_1 = require("./log");
const ansi_1 = require("./util/ansi");
//#endregion Imports
//#region Config
// Used to validate schema (@TODO: actually nvm figure out how to load this as a schema)
const tmLanguageSchemaURL = 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json';
const onWarning = (yamlException) => {
    const { name: errorName, message, stack = '', mark } = yamlException;
    // Can't remember why I did a beginning newline here—try to move to log module functions
    log_1.log.err([
        chalk_1.default.red.bold `YAML Load Error:`,
        ...mark?.name ? [
            chalk_1.default.red `Path: ${chalk_1.default.red.bold.underline.italic([
                util_1.cwdRelative(mark.name),
                // Fix off by one for line
                ...mark.line ? [[(mark.line + 1), mark.column ?? 0].join(':')] : []
            ].join(":"))}`,
        ] : [],
        chalk_1.default.red `    ${message}`
    ].join('\n'));
};
const EventTypeColor = {
    open: chalk_1.default.green,
    close: chalk_1.default.red.dim
};
const traceLoadEvent = function (eventType, state) {
    // Ignore termination chars or weird positions
    if (state.position > state.input.length - 1 || state.input[state.position] === `\u0000`)
        return;
    (lines => {
        const lineMeta = `${EventTypeColor[eventType](eventType)}${' '.repeat(Math.max(0, 6 - eventType.length))} <${chalk_1.default.red.italic(JSON.stringify(state.input[state.position]).replace(/^["]|["]$/gm, ''))
        // c.red.italic(JSON.stringify(state.input[state.position]).slice(1, -1))
        }>`;
        log_1.log.trace(`${lineMeta}${' '.repeat(Math.max(0, 16 - util_1.visibleLength(lineMeta)))}${state.line < lines.length
            ? " " + chalk_1.default.bgAnsi256(253)(lines[state.line - 1])
            : ""}`);
    })(state.input.split(/\r?\n/gm));
};
function convertYamlToJsonFile(path, outputPath) {
    const result = buildJsonGrammar(path);
    // Already printed error, just duck out
    // @TODO: Move error logging out of main conversion function
    if (result instanceof Error)
        return;
    if (!result) {
        log_1.log.warn(chalk_1.default.yellow.italic `No result.`);
        return;
    }
    if (typeof result === 'object' && 'repository' in result) {
        const newJsonTargetSrc = JSON.stringify(result, null, 4);
        if (options_1.default['dry-run']) {
            log_1.log(chalk_1.default.gray `[Dry Run] ` + chalk_1.default.green `Updated: ${chalk_1.default.underline.green `${ansi_1.embedLink(util_1.cwdRelative(outputPath), `file:///${outputPath}`)}`}`);
        }
        else {
            fs_1.default.writeFileSync(outputPath, newJsonTargetSrc);
            log_1.log(chalk_1.default.green `Updated: ${chalk_1.default.underline.green `${ansi_1.embedLink(util_1.cwdRelative(outputPath), `file:///${outputPath}`)}`}`);
        }
        return;
    }
}
//#endregion js-yaml
/**
 * Attempt to convert input to JSON object and expand variables if defined. Returns resulting object
 * or error value on exception.
 */
function buildJsonGrammar(yamlFilePath) {
    const yamlContent = fs_1.default.readFileSync(yamlFilePath, 'utf8');
    try {
        const loaded = js_yaml_1.default.load(yamlContent, {
            filename: yamlFilePath,
            onWarning,
            ...options_1.default.trace ? {
                listener: traceLoadEvent
            } : {}
        });
        if (!!loaded && typeof loaded === 'object')
            return expand_grammar_variables_1.processGrammar(loaded);
        else
            throw new Error('Loaded YAML content is not an object.');
    }
    catch (yamlException) {
        if (!!yamlException)
            onWarning(yamlException);
        return yamlException;
    }
}
function replaceExtension(inputBasename) {
    if (inputBasename.match(/\.tmlanguage\.yaml$/i))
        return inputBasename.replace(/\.tmlanguage\.yaml$/i, '.tmLanguage.json');
    else if (inputBasename.match(/\.yaml.tmlanguage$/i))
        return inputBasename.replace(/\.yaml(.)tmlanguage$/i, 'json$1tmLanguage');
    else
        throw new Error('Failed to match file extension for renaming: ' + inputBasename.split('.', 1)[0]);
}
function startProcessingFile(inputPath, config = {}) {
    inputPath = path_1.default.resolve(inputPath);
    if (!(fs_1.default.existsSync(inputPath))) {
        log_1.log.err(chalk_1.default.red `Incorrect yaml grammar path: ${chalk_1.default.underline.red `${ansi_1.embedLink(util_1.cwdRelative(inputPath), `file:///${inputPath}`)}`}`);
        return;
    }
    const outputBaseName = replaceExtension(path_1.default.basename(inputPath)); //  + '.json-tmLanguage'
    let outputPath = path_1.default.resolve(path_1.default.dirname(inputPath), outputBaseName);
    // Resolve output path
    if ('outputDir' in config && typeof config.outputDir === 'string') {
        outputPath = path_1.default.resolve(config.outputDir, outputBaseName);
    }
    else if ('outputPath' in config && typeof config.outputPath === 'string') {
        outputPath = config.outputPath;
    }
    // If --once passed run and exit
    if (options_1.default.once) {
        log_1.log(' ' + chalk_1.default.ansi256(32) `Running once.`);
        convertYamlToJsonFile(inputPath, outputPath);
        return;
    }
    const watcher = chokidar_1.default.watch(inputPath, {
        disableGlobbing: true,
        persistent: true
    });
    const listeners = {};
    const onChange = function (path, stats) {
        log_1.log(chalk_1.default.ansi256(32) `Changed: ${chalk_1.default.underline `${util_1.cwdRelative(path)}`}`);
        convertYamlToJsonFile(path, outputPath);
    };
    listeners.change = watcher.on('change', onChange);
    if (!options_1.default.wait)
        onChange(inputPath);
}
exports.init = startProcessingFile;
// Run if script invoked directly
if (require.main === module) {
    // If explicit output path given -> one file in and out
    if ('out-file' in options_1.default && typeof options_1.default['out-file'] === 'string') {
        startProcessingFile(options_1.default['input-file'][0], { outputPath: options_1.default['out-file'] });
    }
    // If explicit output dir given, or not -> multiple files
    else {
        const config = { outputDir: options_1.default['out-dir'] };
        for (const inputPath of options_1.default['input-file']) {
            startProcessingFile(inputPath, config);
        }
    }
}
//# sourceMappingURL=index.js.map