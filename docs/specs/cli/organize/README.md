---
id: HJQ793
type: spec
---

# `organize`

## Single argument

When given a single file as argument, `organize` or `o` should ensure it has proper YAML frontmatter.

The frontmatter should consist at a minimum of:

- `id` is a string of three capital letters followed by three numbers. All should be random.
- `type` is either:
  - `project` if it's the root `docs/README.md` file
  - `implementation` if it's in the `docs/impls/` folder
  - `spec` if it's inside the `docs/specs/` folder
  - `ref-impl` if it's inside an `impl-history/` parent folder
  - `test` if it's inside a `tests/` parent folder
  - `spec` by default for all other files

If frontmatter already exists, ensure that no data from existing keys is lost.

The root is determined relative to the `.git` directory. If none exists, the command should error out.

## No arguments

When given no files as argument, `organize` or `o` should organize all files under the `docs/` directory.

## Metadata updates

The `organize` command should overwrite all derived metadata in reference implementation files by finding the correct resources based on their IDs. This includes:

- **File paths**: Update `specs[].path` and `impl.path` fields by locating the current file paths for the referenced spec and implementation IDs
- **Commit information**: Update the `commits` array with the first line of Git commit messages based on the commit hashes

If the derived metadata cannot be retrieved (for example, if the commit with the given hash or the file with the given ID no longer exists), output a warning message and remove that field. **Do not set the field to an empty string.**

> [!NOTE]
> The logic for retrieving/setting this data should be shared and reused between this and the other commands.
