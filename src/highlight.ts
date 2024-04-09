import { styleTags, tags as t } from "@lezer/highlight";

export const hclHighlight = styleTags({
  "for in if else endfor endif": t.controlKeyword,

  "Attribute/Identifier": t.definition(t.propertyName),
  "ForIntro/Identifier": t.definition(t.propertyName),

  "Block/Identifier": t.definitionKeyword,

  "FunctionCall/Identifier": t.function(t.variableName),

  "Attribute/Expression": t.attributeValue,
  "VariableExpr/Identifier": t.variableName,
  "GetAttr/Identifier": t.variableName,
  Identifier: t.name,

  "LiteralValue/...": t.literal,
  "StringLit/... TemplateLiteral": t.string,
  NumericLit: t.number,
  BoolLit: t.bool,
  NullLit: t.null,
  Comment: t.comment,

  LineComment: t.lineComment,
  BlockComment: t.blockComment,

  "( )": t.paren,
  "{ }": t.bracket,
  "[ ]": t.squareBracket,

  ArithOp: t.arithmeticOperator,
  LogicOp: t.logicOperator,
  CompareOp: t.compareOperator,
  ControlOp: t.controlOperator,

  HeredocIdentifier: t.special(t.controlKeyword),
  HeredocStart: t.special(t.brace),
  "TemplateInterpolationStart TemplateInterpolationEnd": t.special(t.brace),
  "TemplateDirectiveStart TemplateDirectiveEnd": t.special(t.brace),
  StripMarker: t.special(t.brace),

  Ellipsis: t.punctuation,
  ": =>": t.punctuation,
  ",": t.separator,
});
