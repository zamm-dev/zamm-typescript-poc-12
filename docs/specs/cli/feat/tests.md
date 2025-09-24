---
id: DRU942
type: test
---

# Test cases for feat command

These tests should be run inside a temp test directory with proper Git repository setup and isolated environments to prevent conflicts.

> [!NOTE]
> See [Spec MTW997](/docs/specs/test-file-resources.md) on testing with test resource files.

> [!NOTE]
> The exact API calls to Anthropic should be recorded and replayed for tests, with API keys filtered out. API-keys are of the format `sk-*`, where `*` represents an unbroken string of alphanumeric characters, hyphens, and underscores. Make sure to do a general regex string replace of all instances of this before writing out to disk, not just in specific areas like request headers.

## Feature Start Without API Key

Given a Git repository with no `ANTHROPIC_API_KEY` environment variable set, then the command:

```bash
zamm feat start Add user authentication
```

should fail with error message: `ANTHROPIC_API_KEY environment variable is required`

## Feature Start Success

Given a Git repository and `ANTHROPIC_API_KEY` environment variable set, then the command:

```bash
zamm feat start Add user authentication
```

should:

- Create a Git worktree in sibling directory `../user-authentication/`
- Create a new Git branch `zamm/user-authentication`
- Create a spec file `docs/spec-history/user-authentication.md` with:

```md
---
id: TST123
type: spec
---

# Add User Authentication

Add user authentication
```
