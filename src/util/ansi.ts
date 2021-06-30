//#region Imports

//#endregion Imports

namespace $
{
    export const ESC = `\u001B`
    export const ST  = `\u0007`
    export const BEL = `\u0007`
    export const OSC = `${ESC}]`
    export const CSI = `${ESC}[`;
    export const SP  = ' '
}

//#region Embedded Link

export function embedLink(text: string, target: string, id?: string): string
{
    return `${$.OSC}8;${id ? `id=${id.replace(/[;=:]/gm,'')}` : ''};${target}${$.ST}${text}${$.OSC}8;;${$.ST}`
}

//#endregion Embedded Link

export default { embed: embedLink }