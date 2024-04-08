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
        "for in if else endfor endif": t.controlKeyword,
        "Attribute/Identifier": t.attributeName,
        "Attribute/Expression": t.attributeValue,
        "Block/Identifier": t.typeName,
        "VariableExpr/Identifier": t.variableName,
        Identifier: t.name,
        BoolLit: t.bool,
        "StringLit/...": t.string,
        NumericLit: t.number,
        NullLit: t.null,
        Comment: t.comment,
        LineComment: t.lineComment,
        BlockComment: t.blockComment,
        "( )": t.paren,
        "{ }": t.bracket,
        "[ ]": t.squareBracket,

        TemplateInterpolationStart: t.paren,
        TemplateInterpolationEnd: t.paren,
        Ellipsis: t.punctuation,
      }),
    ]
  }),
  languageData: {
    commentTokens: {line: ";"}
  }
})

export function hcl() {
  return new LanguageSupport(hclLanguage)
}
