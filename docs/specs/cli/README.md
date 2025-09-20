---
id: FYR697
type: spec
---

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

## `info`

The `info` command displays structured information about a given file. The file can be specified by either its ID or file path.

### Single argument

When given a file identifier (ID or path), `info` should output the following information:

#### General information (for all files):

- **ID**: The unique identifier from the file's frontmatter
- **Type**: The file type in proper English format:
  - `project` → "Project"
  - `implementation` → "Implementation"
  - `implementation-note` → "Implementation Note"
  - `test` → "Test"
  - `spec` → "Specification"
- **File Path**: The absolute path to the file, relative to the project root

#### Additional information for project files:

- **Implementations**: A list of all implementation files associated with this project, showing:
  - Implementation ID
  - Implementation name (as defined by the level 1 Markdown heading)

### Error handling

The command should error out if:

- No file is found matching the given ID or path
- The specified file does not have proper YAML frontmatter with an `id` field
- The `.git` directory cannot be found (to determine the project root)
