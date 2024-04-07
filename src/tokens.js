import { ExternalTokenizer, ContextTracker } from "@lezer/lr";
import {
  QuotedTemplateStart,
  QuotedTemplateEnd,
  templateLiteralChunk,
  TemplateInterpolationStart,
  TemplateInterpolationEnd,
  TemplateDirectiveStart,
  TemplateDirectiveEnd,
  HeredocIdentifier,
} from "./syntax.grammar.terms";

const ContextType = {
  QUOTED_TEMPLATE: 1,
  TEMPLATE_INTERPOLATION: 2,
  TEMPLATE_DIRECTIVE: 4,
  HEREDOC_TEMPLATE: 8,
};

const hashStr = function (str) {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

class Context {
  constructor(parent, type, heredoc_identifier) {
    this.parent = parent;
    this.type = type;
    this.heredoc_identifier = heredoc_identifier;
    this.hash =
      (parent ? (parent.hash + parent.hash) << 8 : 0) +
      (type << 4) +
      (this.heredoc_identifier === "" ? 0 : hashStr(this.heredoc_identifier));
  }
}

const topCtx = new Context(null, "", "");

export const trackTemplate = new ContextTracker({
  start: topCtx,
  shift(context, term, stack, input) {
    if (term === QuotedTemplateStart) {
      return new Context(context, ContextType.QUOTED_TEMPLATE, "");
    }
    if (term === TemplateInterpolationStart) {
      return new Context(context, ContextType.TEMPLATE_INTERPOLATION, "");
    }
    if (term === TemplateDirectiveStart) {
      return new Context(context, ContextType.TEMPLATE_DIRECTIVE, "");
    }
    if (
      term === HeredocIdentifier &&
      context.type !== ContextType.HEREDOC_TEMPLATE
    ) {
      return new Context(
        context,
        ContextType.HEREDOC_TEMPLATE,
        input.read(input.pos, stack.pos)
      );
    }

    if (
      term === HeredocIdentifier &&
      context.type === ContextType.HEREDOC_TEMPLATE
    ) {
      return context.parent;
    }
    switch (term) {
      case QuotedTemplateEnd:
      case TemplateInterpolationEnd:
      case TemplateDirectiveEnd:
        return context.parent;
    }

    return context;
  },
  hash(context) {
    return context.hash;
  },
});

// export const insertSemicolon = new ExternalTokenizer(
//   (input, stack) => {
//     let { next } = input;
//     if (next == braceR || next == -1 || stack.context)
//       input.acceptToken(insertSemi);
//   },
//   { contextual: true, fallback: true }
// );

export const scanQuotedTemplateStart = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(QuotedTemplateStart) &&
      !(stack.context && stack.context.type === ContextType.QUOTED_TEMPLATE) &&
      String.fromCharCode(input.next) === '"'
    ) {
      input.advance();
      return input.acceptToken(QuotedTemplateStart);
    }
  },
  { contextual: true, fallback: true }
);
export const scanQuotedTemplateEnd = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(QuotedTemplateEnd) &&
      stack.context &&
      stack.context.type === ContextType.QUOTED_TEMPLATE &&
      String.fromCharCode(input.next) === '"'
    ) {
      input.advance();
      return input.acceptToken(QuotedTemplateEnd);
    }
  },
  { contextual: true, fallback: true }
);

export const scanTemplateLiteralChunk = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(templateLiteralChunk) &&
      stack.context &&
      stack.context.type === ContextType.QUOTED_TEMPLATE
    ) {
      switch (String.fromCharCode(input.next)) {
        case "\\":
          input.advance();
          switch (String.fromCharCode(input.next)) {
            case '"':
            case "n":
            case "r":
            case "t":
            case "\\":
              input.advance();
              return input.acceptToken(templateLiteralChunk);
            case "u":
              for (let i = 0; i < 4; i++) {
                input.advance();
                if (!/0-9a-fA-F/.test(String.fromCharCode(input.next))) {
                  return;
                }
              }
              input.advance();
              return input.acceptToken(templateLiteralChunk);
            case "U":
              for (let i = 0; i < 8; i++) {
                input.advance();
                if (!/0-9a-fA-F/.test(String.fromCharCode(input.next))) {
                  return;
                }
              }
              input.advance();
              return input.acceptToken(templateLiteralChunk);
            default:
              return;
          }
      }
    }

    if (
      stack.canShift(templateLiteralChunk) &&
      stack.context &&
      (stack.context.type === ContextType.QUOTED_TEMPLATE ||
        stack.context.type === ContextType.HEREDOC_TEMPLATE)
    ) {
      input.advance();
      return input.acceptToken(templateLiteralChunk);
    }
  },
  { contextual: true, fallback: true }
);
export const scanTemplateInterpolationStart = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(TemplateInterpolationStart) &&
      stack.canShift(templateLiteralChunk) &&
      !(
        stack.context &&
        stack.context.type === ContextType.TEMPLATE_INTERPOLATION
      ) &&
      String.fromCharCode(input.next) === "$"
    ) {
      input.advance();
      if (String.fromCharCode(input.next) === "{") {
        input.advance();
        return input.acceptToken(TemplateInterpolationStart);
      }

      // escape sequence
      if (String.fromCharCode(input.next) === "$") {
        input.advance();
        if (String.fromCharCode(input.next) === "{") {
          // $${
          input.advance();
          return input.acceptToken(templateLiteralChunk);
        }
      }

      return input.acceptToken(templateLiteralChunk);
    }
  },
  { contextual: true, fallback: true }
);
export const scanTemplateInterpolationEnd = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(TemplateInterpolationEnd) &&
      stack.context &&
      stack.context.type === ContextType.TEMPLATE_INTERPOLATION &&
      String.fromCharCode(input.next) === "}"
    ) {
      input.advance();
      return input.acceptToken(TemplateInterpolationEnd);
    }
  },
  { contextual: true, fallback: true }
);
export const scanTemplateDirectiveStart = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(TemplateDirectiveStart) &&
      stack.canShift(templateLiteralChunk) &&
      !(
        stack.context && stack.context.type === ContextType.TEMPLATE_DIRECTIVE
      ) &&
      String.fromCharCode(input.next) === "%"
    ) {
      input.advance();
      if (String.fromCharCode(input.next) === "{") {
        input.advance();
        return input.acceptToken(TemplateDirectiveStart);
      }

      // escape sequence
      if (String.fromCharCode(input.next) === "%") {
        input.advance();
        if (String.fromCharCode(input.next) === "{") {
          // $${
          input.advance();
          return input.acceptToken(templateLiteralChunk);
        }
      }

      return input.acceptToken(templateLiteralChunk);
    }
  },
  { contextual: true, fallback: true }
);
export const scanTemplateDirectiveEnd = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(TemplateDirectiveEnd) &&
      stack.context &&
      stack.context.type === ContextType.TEMPLATE_DIRECTIVE &&
      String.fromCharCode(input.next) === "}"
    ) {
      input.advance();
      return input.acceptToken(TemplateDirectiveEnd);
    }
  },
  { contextual: true, fallback: true }
);

// TODO: leading whitespace with newline
export const scanHeredocIdentifier = new ExternalTokenizer(
  (input, stack) => {
    if (
      stack.canShift(HeredocIdentifier) &&
      !(stack.context && stack.context.type === ContextType.HEREDOC_TEMPLATE)
    ) {
      while (
        /0-9a-zA-Z/.test(String.fromCharCode(input.next)) ||
        String.fromCharCode(input.next) === "_" ||
        String.fromCharCode(input.next) === "-"
      ) {
        input.advance();
      }
      return input.acceptToken(HeredocIdentifier);
    }
    if (
      stack.canShift(HeredocIdentifier) &&
      stack.canShift(templateLiteralChunk) &&
      stack.context &&
      stack.context.type === ContextType.HEREDOC_TEMPLATE
    ) {
      const expected = stack.context.heredoc_identifier;
      for (let i = 0; i < expected.length; i++) {
        if (String.fromCharCode(input.next) === expected[i]) {
          input.advance();
        } else {
          return input.acceptToken(templateLiteralChunk);
        }

        // TODO
        input.acceptToken(HeredocIdentifier);
      }
    }
  },
  { contextual: true, fallback: true }
);
