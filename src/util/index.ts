//#region Imports

import path from 'path';
import { timestamp } from './timestamp'
import config from '../configuration'

//#endregion Imports

/**
 * Get length of string without ANSI escapes (expecting color codes)
 */
function visibleLength(string: string)
{
    return string.split(/\x1B\[.+?m/).join('').length
}

export const repoRelative = (toPath: string) => path.relative(config.paths.project, toPath)
export const cwdRelative  = (toPath: string) => path.relative(process.cwd(), toPath)

export { timestamp, visibleLength }
export default
{
    timestamp,
    visibleLength
}