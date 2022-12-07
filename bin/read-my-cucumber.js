#! /usr/bin/env node

const args = process.argv.slice(2);
const path = args[0];

var fs = require('fs').promises
const gherkinParser = require('../src/gherkinParser.js')
const pug = require('pug');
const { table } = require('console');

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

function simplifyJson(gherkinJson) {
    return gherkinJson.map((entry) => {
        const feature = entry.feature
        return {
            name: feature.name,
            description: feature.description.trim(),
            tags: feature.tags.map((entry) => entry.name),
            scenarios: feature.children.map((entry) => {
                const scenario = entry.scenario
                return {
                    name: scenario.name,
                    tags: scenario.tags.map((entry) => entry.name),
                    description: scenario.description.trim(),
                    steps: scenario.steps.map((step) => {
                        return {
                            keyword: step.keyword,
                            text: step.text.trim()
                        }
                    }),
                    examples: scenario.examples.map((example) => {
                        return {
                            name: example.name,
                            header: example.tableHeader.cells.map((entry) => entry.value),
                            header: example.tableBody.map((row) => {
                                return row.cells.map((entry) => entry.value)
                            }),
                        }
                    })
                }
            })
        }
    })
}

// run an async inline function
(async () => {
    try {
        const files = await getFeatureFiles(path)
        const featureFiles = await Promise.all(files.map((file) => parseFeatureFile(file)))
        const features = simplifyJson(featureFiles.reduce((acc, val) => acc.concat(val), []))
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