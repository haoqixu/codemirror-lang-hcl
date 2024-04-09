import { hclHighlight } from "./highlight";
import { parser } from "./syntax.grammar";
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
} from "@codemirror/language";

export const hclLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Block: delimitedIndent({ closing: "}", align: false }),
      }),
      foldNodeProp.add({
        "Object Tuple TemplateFor TemplateIf": foldInside,
        BlockComment: (tree) => {
          return { from: tree.from + 2, to: tree.to - 2 };
        },
        HeredocTemplate(tree) {
          const start = tree.getChild("HeredocIdentifier");
          if (!start) {
            return null;
          }
          return {
            from: start.to,
            to: tree.to,
          };
        },
        FunctionCall(tree) {
          const start = tree.getChild("(");
          const end = tree.getChild(")");
          if (!start || !end) {
            return null;
          }
          return {
            from: start.from + 1,
            to: end.to - 1,
          };
        },
        Block(tree) {
          const start = tree.getChild("{");
          const end = tree.getChild("}");
          if (!start || !end) {
            return null;
          }
          return {
            from: start.from + 1,
            to: end.to - 1,
          };
        },
      }),
      hclHighlight,
    ],
  }),
  languageData: {
    commentTokens: { line: "#", block: { open: "/*", close: "*/" } },
  },
});

export function hcl() {
  return new LanguageSupport(hclLanguage);
}
