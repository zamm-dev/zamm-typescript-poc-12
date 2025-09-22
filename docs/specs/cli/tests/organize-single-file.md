---
id: MLM844
type: test
---

# Test cases for organizing a single file

These tests should be run inside a temp test directory with a Git repo already initialized.

> [!NOTE]
> To control for randomness, we should allow for injection of an ID provider. In production code, the injected ID provider will produce random values. In tests, the injected ID provider will produce pre-determined values in the order set by each specific test. Each test should set a different value for its mock ID provider. (You may use an alternative to dependency injection if that is more idiomatic for the programming language you're working in.)

> [!NOTE]
> See [Spec MTW997](/docs/test-file-resources.md) on testing with test resource files.

## Organize Spec

Given a Markdown file `docs/specs/foo.md`:

```md
# Some feature

Feature requirements
```

then the command

```bash
zamm organize docs/specs/foo.md
```

should rewrite `docs/specs/foo.md` as

```md
---
id: XXX000
type: spec
---

# Some feature

Feature requirements
```

## Organize Project

Given a Markdown file at the root `docs/README.md`:

```md
# Project Overview

This is the main project documentation.
```

then the command

```bash
zamm organize docs/README.md
```

should rewrite `docs/README.md` as

```md
---
id: XXX000
type: project
---

# Project Overview

This is the main project documentation.
```

## Organize Implementation

Given a Markdown file `docs/impls/nodejs.md`:

```md
# Node.js Implementation

Implementation details for Node.js version.
```

then the command

```bash
zamm organize docs/impls/nodejs.md
```

should rewrite `docs/impls/nodejs.md` as

```md
---
id: XXX000
type: implementation
---

# Node.js Implementation

Implementation details for Node.js version.
```

## Organize Reference Implementation

### Unaffiliated reference implementation

Given a Markdown file `docs/impl-history/nodejs/setup-notes.md`:

```md
# Setup Notes

Notes from the implementation process.
```

then the command

```bash
zamm organize docs/impl-history/nodejs/setup-notes.md
```

should rewrite `docs/impl-history/nodejs/setup-notes.md` as

```md
---
id: XXX000
type: ref-impl
---

# Setup Notes

Notes from the implementation process.
```

### File path updates

#### Outdated referenced file paths

Given a reference implementation file `docs/impl-history/nodejs/features/auth-impl.md` with outdated file paths:

```md
---
id: REF001
type: ref-impl
specs:
  - id: AUTH001
    path: /old/wrong/path/spec.md
impl:
  id: IMPL001
  path: /old/wrong/path/impl.md
---

# Authentication Implementation

This is a reference implementation with outdated file paths.
```

and valid files exist at:

- `docs/specs/features/authentication.md` with ID `AUTH001`
- `docs/impls/nodejs.md` with ID `IMPL001`

then the command

```bash
zamm organize docs/impl-history/nodejs/features/auth-impl.md
```

should rewrite the file with updated paths:

```md
---
id: REF001
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
---

# Authentication Implementation

This is a reference implementation with outdated file paths.
```

#### Remove Paths for Non-existent File References

Given a reference implementation file with references to files that don't exist:

```md
---
id: REF003
type: ref-impl
specs:
  - id: NONEXISTENT
    path: /old/wrong/path/spec.md
impl:
  id: ALSONOTFOUND
  path: /old/wrong/path/impl.md
---

# Implementation with Missing References
```

where no files exist with IDs `NONEXISTENT` or `ALSONOTFOUND`, then the organize command should remove the path fields and output warnings:

```md
---
id: REF003
type: ref-impl
specs:
  - id: NONEXISTENT
impl:
  id: ALSONOTFOUND
---

# Implementation with Missing References
```

The command should output warnings like:

- "Warning: Could not resolve Spec file for ID NONEXISTENT"
- "Warning: Could not resolve Implementation file for ID ALSONOTFOUND"

### Commit message updates

#### Missing commit messages

Given a reference implementation file with commit hashes but missing messages:

```md
---
id: REF002
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
commits:
  - sha: e779995e60790757d2ed7e3ff8e87a2617e8c3c6
  - sha: 4bd28bec045891fff0ccb1e549d88f17f34d6827
---

# Implementation with Missing Commit Messages
```

and the commits exist in the git repository with messages "Test commit 3" and "Test commit 2" respectively, then the organize command should fetch and update the commit messages:

```md
---
id: REF002
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
commits:
  - sha: e779995e60790757d2ed7e3ff8e87a2617e8c3c6
    message: Test commit 3
  - sha: 4bd28bec045891fff0ccb1e549d88f17f34d6827
    message: Test commit 2
---

# Implementation with Missing Commit Messages
```

#### Incorrect commit messages

Given a reference implementation file with commit hashes but incorrect messages:

```md
---
id: REF002
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
commits:
  - sha: e779995e60790757d2ed7e3ff8e87a2617e8c3c6
    message: 'incorrect 1'
  - sha: 4bd28bec045891fff0ccb1e549d88f17f34d6827
    message: 'incorrect 2'
---

# Implementation with Missing Commit Messages
```

and the commits exist in the git repository with messages "Test commit 3" and "Test commit 2" respectively, then the organize command should fetch and update the commit messages:

```md
---
id: REF002
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
commits:
  - sha: e779995e60790757d2ed7e3ff8e87a2617e8c3c6
    message: Test commit 3
  - sha: 4bd28bec045891fff0ccb1e549d88f17f34d6827
    message: Test commit 2
---

# Implementation with Missing Commit Messages
```

#### Remove Message Fields for Non-existent Commits

Given a reference implementation file with commit hashes that don't exist in the repository:

```md
---
id: REF004
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
commits:
  - sha: nonexistent1234567890abcdef1234567890abcdef123456
    message: "This commit doesn't exist"
  - sha: alsonotreal7890abcdef1234567890abcdef1234567890a
    message: 'Neither does this one'
---

# Implementation with Nonexistent Commits
```

then the organize command should remove the message fields for commits that don't exist:

```md
---
id: REF004
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/nodejs.md
commits:
  - sha: nonexistent1234567890abcdef1234567890abcdef123456
  - sha: alsonotreal7890abcdef1234567890abcdef1234567890a
---

# Implementation with Nonexistent Commits
```

## Organize Test

Given a Markdown file `docs/tests/unit-tests.md`:

```md
# Unit Tests

Test specifications and results.
```

then the command

```bash
zamm organize docs/tests/unit-tests.md
```

should rewrite `docs/tests/unit-tests.md` as

```md
---
id: XXX000
type: test
---

# Unit Tests

Test specifications and results.
```

## Organize with Existing Frontmatter

Given a Markdown file `docs/specs/example.md` with existing frontmatter:

```md
---
id: ABC123
other: value
---

# Existing Content
```

then the command

```bash
zamm organize docs/specs/example.md
```

should rewrite `docs/specs/example.md` as

```md
---
id: ABC123
type: spec
other: value
---

# Existing Content
```

with existing frontmatter properties preserved.
