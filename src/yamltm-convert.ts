#!/usr/bin/env node

import * as convert from './index'
import options from './options'

// Run if script invoked directly
if (require.main === module)
{
    // If explicit output path given -> one file in and out
    if('out-file' in options && typeof options['out-file'] === 'string')
    {
        convert.startProcessingFile(options['input-file'][0], { outputPath:  options['out-file'] })
    }
    // If explicit output dir given, or not -> multiple files
    else
    {
        const config = { outputDir: options['out-dir']}
        for(const inputPath of options['input-file'])
        {
            convert.startProcessingFile(inputPath, config)
        }
    }
}
// Print warning if used incorrectly
else
{
    console.error(`WARNING: This command script should be invoked directly.`)
}