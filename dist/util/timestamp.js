"use strict";
//#region Imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestamp = void 0;
const chalk_1 = __importDefault(require("chalk"));
//#endregion Imports
/**
 * Had fun overthinking this lol
 */
const { entries, fromEntries } = Object;
//#region Intl Implementation
function IntlDateComponentExtractor() {
    const $ = IntlDateComponentExtractor;
    return (formatter => (date = new Date()) => (parts => $.partsToEntries(parts))(formatter.formatToParts(date)))($.DateFormatter());
}
(function (IntlDateComponentExtractor) {
    var $ = IntlDateComponentExtractor;
    let TargetPartTypes;
    (function (TargetPartTypes) {
        TargetPartTypes["month"] = "month";
        TargetPartTypes["day"] = "day";
        TargetPartTypes["year"] = "year";
        TargetPartTypes["hour"] = "hour";
        TargetPartTypes["minute"] = "min";
        TargetPartTypes["second"] = "sec";
        TargetPartTypes["fractionalSecond"] = "ms";
    })(TargetPartTypes = IntlDateComponentExtractor.TargetPartTypes || (IntlDateComponentExtractor.TargetPartTypes = {}));
    function filterMapPart(part) {
        // Return empty array if undesired
        if (!(part.type in TargetPartTypes)) {
            return [];
        }
        else
            return [[
                    TargetPartTypes[part.type],
                    part.value
                    // hoo boy
                ]];
    }
    IntlDateComponentExtractor.filterMapPart = filterMapPart;
    function partsToEntries(parts) {
        return fromEntries(parts.flatMap($.filterMapPart));
    }
    IntlDateComponentExtractor.partsToEntries = partsToEntries;
    function DateFormatter() {
        return Intl.DateTimeFormat('en-us', {
            ...fromEntries(['day', 'minute', 'hour', 'month'].map(_ => ([_, '2-digit']))),
            hour12: false,
            second: 'numeric',
            fractionalSecondDigits: 3,
            hourCycle: 'h24',
            year: 'numeric',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }
    IntlDateComponentExtractor.DateFormatter = DateFormatter;
})(IntlDateComponentExtractor || (IntlDateComponentExtractor = {}));
//#endregion Intl Implementation
//#region ISO String Implementation
/**
 * Extract time components of a Date instance via ISOString
 */
const ISODateComponentExtractor = function (dateInstance = new Date()) {
    if (!(dateInstance instanceof Date))
        throw new Error(`\`dateInstance\` parameter must be a \`Date\` instance.`);
    const isoString = dateInstance.toISOString(), [date, time] = isoString.split(/(?<=\d)T(?=\d)/), [year, month, day] = date.split(/-/), [hour, min, sec, ms] = time.replace(/(?<=\d)Z$/, '')
        .replace(/(?<=\d)\.(?=\d)/gm, ':')
        .split(/(?<=\d):(?=\d)/gm);
    return {
        year, month, day,
        hour, min, sec, ms
    };
};
//#endregion ISO String Implementation
//#endregion DateTimeComponent Extraction
const dateComponentExtractor = IntlDateComponentExtractor();
const componentsToTimestamp = ({ year, month, day, hour, min, sec, ms }) => `[${year}.${month}.${day} ${hour}:${min}:${sec}.${ms}]`;
function timestamp(date = new Date()) {
    return (componentsToTimestamp)(dateComponentExtractor(date));
}
exports.timestamp = timestamp;
(function (timestamp) {
    function color(style = chalk_1.default.gray, date = new Date()) {
        return style.bind(chalk_1.default)(timestamp(date));
    }
    timestamp.color = color;
})(timestamp = exports.timestamp || (exports.timestamp = {}));
exports.default = { timestamp };
//# sourceMappingURL=timestamp.js.map