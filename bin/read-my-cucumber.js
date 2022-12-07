#! /usr/bin/env node

const args = process.argv.slice(2);
const path = args[0];

var fs = require('fs').promises
const gherkinParser = require('../src/gherkinParser.js')
const pug = require('pug');

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

async function pathExists(path) {
    try {
        await fs.access(path, fs.F_OK)
        return true
    } catch {
        return false
    }
}


// run an async inline function
(async () => {
    try {
        const files = await getFeatureFiles(path)
        const featureFiles = await Promise.all(files.map((file) => parseFeatureFile(file)))
        const features = featureFiles.reduce((acc, val) => acc.concat(val), [])
        console.log(JSON.stringify(features, null, 2))
        
        if (await pathExists('dist')) {
            await fs.rm('dist', { recursive: true })
        }
        await fs.mkdir('dist')
        const html = pug.compileFile(__dirname + '/../src/index.pug', { pretty: true })({ features: features })
        await fs.writeFile('dist/index.html', html)
        console.log(`Wrote ${features.length} features to dist/index.html`)

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
})();