---
id: TGO258
type: test
---

# Test cases for split command

These tests should be run inside a temp test directory.

> [!NOTE]
> See [Spec MTW997](/docs/specs/test-file-resources.md) on testing with test resource files.

## Split Regular File into Single New File

Given a Markdown file `docs/specs/features.md`:

```md
---
id: ABC123
type: spec
---

# Features

This is the main features file.

## Authentication

Content about authentication.

## User Management

Content about user management.
```

then the command

```bash
zamm split docs/specs/features.md --into authentication.md
```

should:

- Move `docs/specs/features.md` to `docs/specs/features/README.md` with the same content:

```md
---
id: ABC123
type: spec
---

# Features

This is the main features file.

## Authentication

Content about authentication.

## User Management

Content about user management.
```

- Create the new file at `docs/specs/features/authentication.md` with proper frontmatter:

```md
---
id: DEF456
type: spec
---
```

## Split Regular File into Multiple New Files

Given the same Markdown file `docs/specs/features.md` as above, then the command

```bash
zamm split docs/specs/features.md --into authentication.md user-management.md
```

should:

- Move `docs/specs/features.md` to `docs/specs/features/README.md` with the same content as above
- Create the new file at `docs/specs/features/authentication.md`:

```md
---
id: DEF456
type: spec
---
```

- Create the new file at `docs/specs/features/user-management.md`:

```md
---
id: GHI789
type: spec
---
```

## Split Existing README.md File

Given an existing README file `docs/specs/features/README.md`:

```md
---
id: ABC123
type: spec
---

# Features

This is the main features file.

## Authentication

Content about authentication.

## User Management

Content about user management.
```

then the command

```bash
zamm split docs/specs/features/README.md --into authentication.md
```

should:

- Leave `docs/specs/features/README.md` untouched with the same content
- Create the new file at `docs/specs/features/authentication.md`:

```md
---
id: DEF456
type: spec
---
```
