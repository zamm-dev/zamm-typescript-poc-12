---
id: SOB239
type: test
---

# Test cases for info command

These tests should be run inside a temp test directory with a Git repo already initialized.

> [!NOTE]
> See [Spec MTW997](/docs/test-file-resources.md) on testing with test resource files.

## Info for Spec File

Given a Markdown file `docs/features/authentication.md`:

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
zamm info docs/features/authentication.md
```

should output:

```
ID: XYZ789
Type: Specification
File Path: /docs/features/authentication.md
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
File Path: /docs/README.md
Implementations:
  - IMP001: Node.js Implementation
  - IMP002: Python Implementation
```
