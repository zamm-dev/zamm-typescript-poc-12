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

> [!NOTE]
> Make sure to document how to install these Git hooks in your project setup steps for users that are cloning it for the first time.

## Git ignore

Make sure that `.gitignore` ignores all appropriate files and folders for this tech stack. Avoid placing trailing slashes after ignored folder names in order to prevent VS Code from highlighting them as a new folder.

## Implementation Notes

In order to verify the correct implementation of this spec, perform the following checks:

1. Check the output of `git status` to verify that the right files are being ignored
2. Make a commit and check that the pre-commit hook ran successfully. If files were formatted, try committing again until it succeeds.
