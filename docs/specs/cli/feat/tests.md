---
id: DRU942
type: test
---

# Test cases for feat command

These tests should be run inside a temp test directory with proper Git repository setup and isolated environments to prevent conflicts.

> [!NOTE]
> See [Spec MTW997](/docs/test-file-resources.md) on testing with test resource files.

## Feature Start

### Base case

Given a Git repository, then the command:

```bash
zamm feat start Add user authentication
```

should

- Ensure that a dummy script gets successfully executed
- Check that the file `.zamm/current-workflow-state.json` looks exactly like:

  ```json
  {
    "state": "INITIAL"
  }
  ```

### End-to-end test

> [!NOTE]
> This test requires a system with the `ANTHROPIC_API_KEY` environment variable set, and should therefore be skipped by default.

Given a Git repository and `ANTHROPIC_API_KEY` environment variable set, then the command:

```bash
zamm feat start Add user authentication
```

should:

- Create a Git worktree in a sibling directory
- Create the file `../<worktree-dir>/.zamm/current-workflow-state.json` with the exact contents:

  ```json
  {
    "state": "INITIAL"
  }
  ```

- Create a new Git branch starting with `zamm/`
- Create a new spec file under `docs/spec-history/` that looks like:

  ```md
  ---
  id: TST123
  type: spec
  ---

  # Adding User Authentication

  Add user authentication
  ```

  Read it back in to ensure that:
  - The frontmatter is an exact match (you can use the test ID provider to clamp ID randomness)
  - The body is an exact match
  - The title is non-empty (it is unclear what exact title the LLM will actually generate)
