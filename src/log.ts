//#region Imports

import { timestamp } from './util'
import c from 'chalk'
import type { Chalk as ChalkStyle } from 'chalk'
import { options } from './options'

//#endregion Imports

/**
 * Write timestamped log
 */
export function log(...msg: any)
{
    console.log(log.format([msg]))
}

export namespace log
{
    export function format(logArgs: any[], timestampStyle?: ChalkStyle)
    {
        return `${timestamp.color(timestampStyle)} ${logArgs.join(' ')}`
    }

    export function debug(...msg: any)
    {
        if(!debug.enabled())
            return;

        console.debug(log.format([msg]))
    }

    export function trace(...msg: any)
    {
        if(!options.trace)
            return;

        console.debug(log.format([msg]))
    }

    export function err(...msg: any[])
    {
        console.error(log.format([msg], c.red.dim))
    }

    export function warn(...msg: any[])
    {
        console.warn(log.format([msg], c.yellow))
    }

    export namespace debug
    {
        let $enabled: boolean = options.verbose ?? false;

        export function enabled()
        {
            return $enabled
        }

        export function enable()
        {
            $enabled = true;
        }

        export function toggle()
        {
            $enabled = !$enabled;
        }

        export function disable()
        {
            $enabled = true;
        }
    }
}

export default log