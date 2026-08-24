import { styleTags, tags as t } from "@lezer/highlight";

export const hclHighlight = styleTags({
  "for in if else endfor endif": t.controlKeyword,

  "Attribute/Identifier": t.definition(t.propertyName),
  "ForIntro/Identifier TemplateForStart/Identifier": t.definition(
    t.variableName,
  ),

  "Block/Identifier": t.definitionKeyword,

  "FunctionCall/Identifier": t.function(t.variableName),

  "VariableExpr/Identifier": t.variableName,
  "GetAttr/Identifier": t.propertyName,
  Identifier: t.name,

  "QuotedTemplateStart QuotedTemplateEnd TemplateLiteral": t.string,
  NumericLit: t.number,
  "true false": t.bool,
  null: t.null,

  LineComment: t.lineComment,
  BlockComment: t.blockComment,

  "( )": t.paren,
  "{ }": t.brace,
  "[ ]": t.squareBracket,

  ArithOp: t.arithmeticOperator,
  LogicOp: t.logicOperator,
  CompareOp: t.compareOperator,
  ControlOp: t.controlOperator,

  HeredocIdentifier: t.special(t.controlKeyword),
  HeredocStart: t.operator,
  "TemplateInterpolationStart TemplateInterpolationEnd": t.special(t.brace),
  "TemplateDirectiveStart TemplateDirectiveEnd": t.special(t.brace),
  StripMarker: t.special(t.brace),

  "AttrSplat FullSplat": t.derefOperator,
  Ellipsis: t.punctuation,
  NamespaceSeparator: t.separator,
});
