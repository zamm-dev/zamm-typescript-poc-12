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
  - `spec` if it's inside the `docs/specs/` folder
  - `implementation-note` if it's inside an `impl-history/` parent folder
  - `test` if it's inside a `tests/` parent folder
  - `spec` by default for all other files

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

#### Additional information for implementation note files:

- **Specifications Implemented**: A list of all specification files referenced in the `specs` frontmatter field, showing:
  - Specification ID
  - Specification file path
- **Implementation**: The single implementation file referenced in the `impl` frontmatter field, showing:
  - Implementation ID
  - Implementation file path

### Error handling

The command should error out if:

- No file is found matching the given ID or path
- The specified file does not have proper YAML frontmatter with an `id` field
- The `.git` directory cannot be found (to determine the project root)

## `implement`

When given a spec ID/file path and implementation ID/file path as arguments, `implement` or `i` should generate a new implementation note file in the sibling `impl-history/` directory of that spec. For example, if we are to reuse the [Test Spec SOB239](./tests/info-command.md) test data, then running the command

```bash
zamm implement --spec XYZ789 --for IMP002
```

should generate a new implementation note at `docs/specs/features/impl-history/new-XYZ789-impl.md` with the contents

```md
---
id: NOT123
type: implementation-note
specs:
  - id: XYZ789
    path: /docs/specs/features/authentication.md
impl:
  id: IMP002
  path: /docs/impls/python.md
---

TODO: LLM agent, please put implementation plan details here and rename this file as appropriate.
```

> [!NOTE]
> When testing this, you should reuse the test resources defined by [Test Spec SOB239](./tests/info-command.md) instead of creating duplicate test resource files.
