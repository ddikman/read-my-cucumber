#! /usr/bin/env node

const args = process.argv.slice(2);
const path = args[0];

var fs = require('fs').promises
const gherkinParser = require('../src/gherkinParser.js')

async function getFeatureFiles(path) {
    const isFile = (await fs.lstat(path)).isFile()
    if (isFile) {
        if (path.endsWith('.feature')) {
            return [path]
        } else {
            return []
        }
    }

    const files = await fs.readdir(path)
    const featureFiles = await Promise.all(files.map((file) => getFeatureFiles(`${path}/${file}`)))
    return featureFiles.reduce((acc, val) => acc.concat(val), [])
}

async function parseFeatureFile(path) {
    const content = await fs.readFile(path, 'utf8')
    return gherkinParser.parse(content)
}


// run an async inline function
(async () => {
    try {
        const files = await getFeatureFiles(path)
        const featureFiles = await Promise.all(files.map((file) => parseFeatureFile(file)))
        const features = featureFiles.reduce((acc, val) => acc.concat(val), [])
        console.log(JSON.stringify(features, null, 2))
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
})();