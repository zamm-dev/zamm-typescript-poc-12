# ZAMM CLI

This section documents all the CLI commands that the ZAMM implementation should handle.

## `organize`

## Single argument

When given a single file as argument, `organize` or `o` should ensure it has proper YAML frontmatter.

The frontmatter should consist at a minimum of:

- `id` is a string of three capital letters followed by three numbers. All should be random.
- `type` is either:
  - `project` if it's the root `docs/README.md` file
  - `implementation` if it's in the `docs/impls/` folder
  - `implementation-note` if it's inside an `impl-history/` parent folder
  - `test` if it's inside a `tests/` parent folder
  - `spec` for all other files

If frontmatter already exists, ensure that no data from existing keys is lost.

The root is determined relative to the `.git` directory. If none exists, the command should error out.

## No arguments

When given no files as argument, `organize` or `o` should organize all files under the `docs/` directory.
