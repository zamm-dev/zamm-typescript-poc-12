---
id: KYT921
type: test
---

# Test Spec: Implement Command

This specification defines test cases for the `impl` command and its subcommands.

> [!NOTE]
> To ensure reproducible testing with deterministic commit hashes, test commits should be created with consistent metadata (author, email, date, etc.). This allows the use of simple file comparison for verifying the exact output format, as the same input will always produce the same commit hashes.
>
> **Do not** mock Git output in your tests. We want to ensure that this works with real Git operations.

## `impl record`

## Record latest commits for valid reference implementation file

Running:

```bash
zamm impl record --last-n-commits 3 NOT123
```

or

```bash
zamm impl record --last-n-commits 3 docs/specs/features/impl-history/initial-auth.md
```

on the existing test file `initial-auth.md` with ID NOT123 (from [Test Spec SOB239](./info-command.md)) that currently has frontmatter like:

```md
---
id: NOT123
type: ref-impl
specs:
  - id: XYZ789
    path: /specs/features/authentication.md
impl:
  id: IMP002
  path: /impls/python.md
---
```

should update the frontmatter to include the commit hashes:

```md
---
id: NOT123
type: ref-impl
specs:
  - id: XYZ789
    path: /specs/features/authentication.md
impl:
  id: IMP002
  path: /impls/python.md
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

## Test Case: `impl record` type validation

When attempting to record commits to a file that is not a reference implementation (e.g., a spec file), the command should validate the file type and exit with an error.

For example, running:

```bash
zamm impl record --last-n-commits 3 XYZ789
```

on the Markdown file `docs/specs/features/authentication.md` (as mentioned in [Test Spec SOB239](/docs/specs/cli/tests/info-command.md)):

```md
---
id: XYZ789
type: spec
---

# Authentication Feature

User authentication requirements and specifications.
```

should exit with an error message such as:

```
Error: Implementation commits have to be added to implementation files. The file you entered, Spec XYZ789 at docs/specs/features/authentication.md, is a specification file.
```
