// JavaScript
var Gherkin = require('@cucumber/gherkin')
var Messages = require('@cucumber/messages')

var uuidFn = Messages.IdGenerator.uuid()
var builder = new Gherkin.AstBuilder(uuidFn)
var matcher = new Gherkin.GherkinClassicTokenMatcher() // or Gherkin.GherkinInMarkdownTokenMatcher()

var parser = new Gherkin.Parser(builder, matcher)

module.exports = parser