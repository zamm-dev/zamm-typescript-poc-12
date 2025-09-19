# ZAMM CLI

This section documents all the CLI commands that the ZAMM implementation should handle.

## `organize`

`organize` or `o` should take in a single file and ensure it has proper YAML frontmatter.

where:

- `id` is a string of three capital letters followed by three numbers. All should be random.
- `type` is either:
  - `project` if it's the root `docs/README.md` file
  - `implementation` if it's in the `docs/impls/` folder
  - `implementation-note` if it's inside an `impl-history/` parent folder
  - `test` if it's inside a `tests/` parent folder
  - `spec` for all other files

The root is determined relative to the `.git` directory. If none exists, the command should error out.
