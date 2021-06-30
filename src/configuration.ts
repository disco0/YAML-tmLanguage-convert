//#region Imports

import path from 'path'

//#endregion Imports

export namespace paths
{
    export const project  = path.resolve(__dirname, '../../')
    export const syntaxes = path.resolve(project, 'syntaxes')
}

export namespace defaultTargets
{
    export const source = path.resolve(paths.syntaxes, 'fennel.tmLanguage.yaml')
    export const output = path.resolve(paths.syntaxes, 'fennel.tmLanguage.json')
}

export default { paths, targets: defaultTargets }