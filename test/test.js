import {hclLanguage} from "../dist/index.js"
import {fileTests} from "@lezer/generator/dist/test"
import {classHighlighter, highlightTree} from "@lezer/highlight"
import assert from "node:assert/strict"

import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from 'url';
let caseDir = path.dirname(fileURLToPath(import.meta.url))

for (let file of fs.readdirSync(caseDir)) {
  if (!/\.txt$/.test(file)) continue

  let name = /^[^\.]*/.exec(file)[0]
  describe(name, () => {
    for (let {name, run} of fileTests(fs.readFileSync(path.join(caseDir, file), "utf8"), file))
      it(name, () => run(hclLanguage.parser))
  })
}

describe("highlight", () => {
  it("highlights static object keys as property definitions", () => {
    let code = `value = {
  name = 1
  "display-name" = 2
  (var.dynamic) = 3
}`
    let spans = []
    highlightTree(hclLanguage.parser.parse(code), classHighlighter, (from, to, classes) => {
      spans.push({text: code.slice(from, to), classes})
    })
    let styleFor = text => spans.find(span => span.text === text)?.classes

    assert.equal(styleFor("name"), "tok-propertyName tok-definition")
    assert.equal(styleFor('"display-name"'), "tok-propertyName tok-definition")
    assert.equal(styleFor("(var.dynamic)"), undefined)
    assert.equal(styleFor("var"), "tok-variableName")
    assert.equal(styleFor("dynamic"), "tok-propertyName")
  })
})
