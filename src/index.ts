import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const hclLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({closing: ")", align: false})
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Identifier: t.variableName,
        BoolLit: t.bool,
        StringLit: t.string,
        NumericLit: t.number,
        NullLit: t.null,
        Comment: t.comment,
        LineComment: t.lineComment,
        BlockComment: t.blockComment,
        "( )": t.paren,
        "{ }": t.bracket,
        "[ ]": t.squareBracket,
      })
    ]
  }),
  languageData: {
    commentTokens: {line: ";"}
  }
})

export function hcl() {
  return new LanguageSupport(hclLanguage)
}
