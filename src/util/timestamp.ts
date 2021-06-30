//#region Imports

import c from 'chalk'

//#endregion Imports

/**
 * Had fun overthinking this lol
 */

const {entries, fromEntries} = Object;

//#region DateTimeComponent Extraction

interface DateComponents
{
    year: string;
    month: string;
    day: string;
    hour: string;
    min: string;
    sec: string;
    ms: string;
}


interface DateComponentExtractor
{
    (date?: Date): DateComponents;
}

//#region Intl Implementation

function IntlDateComponentExtractor(): DateComponentExtractor
{
    const $ = IntlDateComponentExtractor;

    return (formatter => (date: Date = new Date()) => (parts => $.partsToEntries(parts))(formatter.formatToParts(date))
    )($.DateFormatter());
}

namespace IntlDateComponentExtractor
{
    import $ = IntlDateComponentExtractor;

    export enum TargetPartTypes
    {
        "month" = "month",
        "day" = "day",
        "year" = "year",
        "hour" = "hour",
        "minute" = "min",
        "second" = "sec",
        "fractionalSecond" = "ms"
    }
    type TargetPartType = keyof typeof TargetPartTypes;
    type IntlPartType = Intl.DateTimeFormatPart['type'];
    type IntlPartEnumed<T = TargetPartType> = {
        [Type in TargetPartType]: Type extends IntlPartType ? Type : never;
    }[TargetPartType];

    export function filterMapPart<P extends Intl.DateTimeFormatPart>(part: P)
    {
        // Return empty array if undesired
        if (!(part.type in TargetPartTypes))
        {
            return [];
        }

        else
            return [[
                TargetPartTypes[part.type as IntlPartEnumed],
                part.value
                // hoo boy
            ]] as readonly [[Key: typeof TargetPartTypes[IntlPartEnumed], Value: P['value']]];
    }

    export function partsToEntries(parts: Intl.DateTimeFormatPart[])
    {
        return fromEntries(parts.flatMap($.filterMapPart)) as {
            [Key in keyof DateComponents]: string;
        };
    }

    export function DateFormatter()
    {
        return Intl.DateTimeFormat('en-us',
            {
                ...fromEntries(['day', 'minute', 'hour', 'month'].map(_ => ([_, '2-digit']))),
                hour12: false,
                second: 'numeric',
                fractionalSecondDigits: 3,
                hourCycle: 'h24',
                year: 'numeric',

                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
    }
}

//#endregion Intl Implementation

//#region ISO String Implementation

/**
 * Extract time components of a Date instance via ISOString
 */
const ISODateComponentExtractor: DateComponentExtractor = function(dateInstance = new Date())
{
    if (!(dateInstance instanceof Date))
        throw new Error(`\`dateInstance\` parameter must be a \`Date\` instance.`);

    const isoString = dateInstance.toISOString(), [date, time] = isoString.split(/(?<=\d)T(?=\d)/), [
        year, month, day
    ] = date.split(/-/), [
        hour, min, sec, ms
    ] = time.replace(/(?<=\d)Z$/, '')
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
const componentsToTimestamp = ({year, month, day, hour, min, sec, ms}: DateComponents) => `[${ year }.${ month }.${ day } ${ hour }:${ min }:${ sec }.${ ms }]`;

export function timestamp(date: Date = new Date()): string
{
    return (componentsToTimestamp)(dateComponentExtractor(date))
}

export namespace timestamp
{
    export function color(style: c.Chalk = c.gray, date: Date = new Date()): string
    {
        return style.bind(c)(timestamp(date))
    }
}

export default { timestamp }