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
        Application: delimitedIndent({ closing: ")", align: false }),
      }),
      foldNodeProp.add({
        Application: foldInside,
      }),
      hclHighlight,
    ],
  }),
  languageData: {
    commentTokens: { line: ";" },
  },
});

export function hcl() {
  return new LanguageSupport(hclLanguage);
}
