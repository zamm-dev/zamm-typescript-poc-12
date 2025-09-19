# Test cases for organizing a single file

These tests should be run inside a temp test directory with a Git repo already initialized.

## Organize Spec

Given a Markdown file `docs/foo.md`:

```md
# Some feature

Feature requirements
```

then the command

```bash
zamm organize docs/foo.md
```

should rewrite `docs/foo.md` as

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

## Organize Implementation Note

Given a Markdown file `docs/impl-history/setup-notes.md`:

```md
# Setup Notes

Notes from the implementation process.
```

then the command

```bash
zamm organize docs/impl-history/setup-notes.md
```

should rewrite `docs/impl-history/setup-notes.md` as

```md
---
id: XXX000
type: implementation-note
---

# Setup Notes

Notes from the implementation process.
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
