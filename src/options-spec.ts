import options from './options'

console.log(`Parsed options:`)
console.dir(Object.fromEntries(Object.entries(options)), {depth: 5, showHidden: true, colors: true, getters: true  })