---
id: SOB239
type: test
---

# Test cases for info command

These tests should be run inside a temp test directory with a Git repo already initialized.

> [!NOTE]
> See [Spec MTW997](/docs/test-file-resources.md) on testing with test resource files.

## Info for Spec File

Given a Markdown file `docs/specs/features/authentication.md`:

```md
---
id: XYZ789
type: spec
---

# Authentication Feature

User authentication requirements and specifications.
```

then the command

```bash
zamm info XYZ789
```

or

```bash
zamm info docs/specs/features/authentication.md
```

should output:

```
ID: XYZ789
Type: Specification
File Path: docs/specs/features/authentication.md
```

## Info for Project File with Implementations

Given a project structure with:

`docs/README.md`:

```md
---
id: PRJ001
type: project
---

# ZAMM Project

Main project documentation.
```

`docs/impls/nodejs.md`:

```md
---
id: IMP001
type: implementation
---

# Node.js Implementation

Implementation using Node.js and TypeScript.
```

`docs/impls/python.md`:

```md
---
id: IMP002
type: implementation
---

# Python Implementation

Implementation using Python and FastAPI.
```

then the command

```bash
zamm info PRJ001
```

or

```bash
zamm info docs/README.md
```

should output:

```
ID: PRJ001
Type: Project
File Path: docs/README.md
Implementations:
  - IMP001: Node.js Implementation
  - IMP002: Python Implementation
```

## Info for Reference Implementation File

Given an reference implementation file `docs/impl-history/python/features/initial-auth.md`:

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

# Initial Authentication Implementation

Implementation plan for the authentication feature using Python.
```

then the command

```bash
zamm info NOT123
```

or

```bash
zamm info docs/impl-history/python/features/initial-auth.md
```

should output:

```
ID: NOT123
Type: Reference Implementation
File Path: docs/impl-history/python/features/initial-auth.md
Specifications Implemented:
  - XYZ789: Authentication Feature
Implementation:
  - IMP002: Python Implementation
Commits:
  - a1b2c3d: Add initial authentication scaffolding
  - b2c3d4e: Implement user login endpoint
  - c3d4e5f: Add password validation and hashing
```
