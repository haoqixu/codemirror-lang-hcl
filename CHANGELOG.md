# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-08-26

### Added

- Support namespaced HCL function calls, including multi-level namespaces and calls inside template interpolations.
- Add semantic syntax nodes for block types and labels, object keys, function names and namespaces, and operators and separators.

### Changed

- Improve highlighting for block types and labels, function namespaces and names, variables, properties, delimiters, and operators.
- Highlight bare and quoted static object keys as property definitions while preserving expression highlighting for dynamic keys.
- Expand parser and highlighting coverage for functions, objects, templates, and `for` expressions.

### Compatibility note

The semantic grammar nodes change parts of the syntax tree exposed by `hclLanguage.parser`. Consumers that match syntax node names may need to update their selectors for `BlockType`, `BlockLabel`, `ObjectKey`, `FunctionNamespace`, and `FunctionName`.

[0.2.0]: https://github.com/haoqixu/codemirror-lang-hcl/compare/v0.1.0...v0.2.0
