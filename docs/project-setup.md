# ZAMM Implementation Project Setup

Each implementation of ZAMM will have the following common operations defined for the given stack:

- A command to format all the code
- A command to lint the code
- A command to build the code (if implemented in a compiled language)
- A command to run all tests
- A command to run the code

These commands should be documented inside of a build system or task runner (e.g. a Makefile, Justfile, Taskfile, or even just a Markdown file for coding agents).

## Git hooks

Git hooks should be set up by tooling (e.g. `pre-commit`, `husky`, or `lefthook`).

On commit, the above lint, format, and build commands should be run. (The build command can be skipped if inapplicable for the given stack.)

On push, the tests should be run as well.
