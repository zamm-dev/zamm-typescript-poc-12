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
  - `ref-impl` if it's inside an `impl-history/` parent folder
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
  - `ref-impl` → "Reference Implementation"
  - `test` → "Test"
  - `spec` → "Specification"
- **File Path**: The absolute path to the file, relative to the project root

#### Additional information for project files:

- **Implementations**: A list of all implementation files associated with this project, showing:
  - Implementation ID and title (from the level 1 Markdown heading)

#### Additional information for reference implementation files:

- **Specifications Implemented**: A list of all specification files referenced in the `specs` frontmatter field, showing:
  - Specification ID and title (from the level 1 Markdown heading)
- **Implementation**: The single implementation file referenced in the `impl` frontmatter field, showing:
  - Implementation ID and title (from the level 1 Markdown heading)
- **Commits**: Display the commits of the reference implementation, showing:
  - First 7 characters of the commit SHA
  - First line of the commit message

> [!NOTE]
> **Title Fallback Behavior**: Whenever displaying file references (implementations, specifications, etc.), always prefer showing the title from the level 1 Markdown heading. Only if no title is available should the system fall back to displaying the file path.

### Error handling

The command should error out if:

- No file is found matching the given ID or path
- The specified file does not have proper YAML frontmatter with an `id` field
- The `.git` directory cannot be found (to determine the project root)

## `impl`

The `impl` or `i` command provides subcommands for managing implementation records and creating new reference implementations.

### `impl create`

When given a spec ID/file path and implementation ID/file path as arguments, `impl create` should generate a new reference implementation file in the `docs/impl-history/<implementation>/` directory corresponding to the implementation. For example, if we are to reuse the [Test Spec SOB239](./tests/info-command.md) test data, then running the command

```bash
zamm impl create --spec XYZ789 --for IMP002
```

should generate a new reference implementation at `docs/impl-history/python/features/new-XYZ789-impl.md` with the contents

```md
---
id: NOT123
type: ref-impl
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

### `impl record`

When given the `--last-n-commits <N>` parameter and a positional argument for the implementation ID or file path, `impl record` should add the commit hashes from the last N commits to the specified file's frontmatter under a `commits` field. The commits should be recorded as an array of objects with `sha` and `message` properties.

For example, running:

```bash
zamm impl record --last-n-commits 3 NOT123
```

or

```bash
zamm impl record --last-n-commits 3 docs/specs/features/impl-history/initial-auth.md
```

on the existing test file `initial-auth.md` with ID NOT123 (from [Test Spec SOB239](./tests/info-command.md)) that currently has frontmatter like:

```md
---
id: NOT123
type: ref-impl
specs:
  - id: XYZ789
    path: /docs/specs/features/authentication.md
impl:
  id: IMP002
  path: /docs/impls/python.md
---
```

should update the frontmatter to include the commit hashes:

```md
---
id: NOT123
type: ref-impl
specs:
  - id: XYZ789
    path: /docs/specs/features/authentication.md
impl:
  id: IMP002
  path: /docs/impls/python.md
commits:
  - sha: a1b2c3d4e5f6789012345678901234567890abcd
    message: Add initial authentication scaffolding
  - sha: b2c3d4e5f6789012345678901234567890abcdef1
    message: Implement user login endpoint
  - sha: c3d4e5f6789012345678901234567890abcdef12
    message: Add password validation and hashing
---
```

If the `commits` field already exists, the new commits should be prepended to the existing list, maintaining chronological order with the most recent commits first.

> [!NOTE]
> To ensure reproducible testing with deterministic commit hashes, test commits should be created with consistent metadata (author, email, date, etc.). This allows the use of simple file comparison for verifying the exact output format, as the same input will always produce the same commit hashes.
>
> **Do not** mock Git output in your tests. We want to ensure that this works with real Git operations.
