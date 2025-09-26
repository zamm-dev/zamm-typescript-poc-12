---
id: GBG455
type: spec
---

# `redirect`

The `redirect <dir>` command allows ZAMM to use another directory instead of `docs/` as the base of operations. The specified redirect directory should be stored in `.zamm/base-state.json`. All ZAMM operations should continue exactly the same as if the data were still in `docs/`.

## Command Behavior

When `zamm redirect <dir>` is executed:

1. **Validate directory**: Ensure the specified directory exists and is accessible
2. **Store redirect**: Save the redirect directory path in `.zamm/base-state.json`
3. **Update operations**: All subsequent ZAMM operations should use the specified directory as the base instead of `docs/`

## Storage Format

The redirect directory should be stored in `.zamm/base-state.json` with a new field:

```json
{
  "redirectDirectory": "/path/to/custom/directory",
  "worktrees": [...]
}
```

## Behavior Requirements

- If no redirect is configured, ZAMM should continue using `docs/` as the default base directory
- Once a redirect is configured, all ZAMM commands should operate on the redirected directory
- The redirect should persist across ZAMM command invocations
- The redirect directory path should be resolved to an absolute path at runtime for easy troubleshooting
- If the redirect directory becomes inaccessible, ZAMM should provide a clear error message

## Error Handling

- If the specified directory does not exist, show an error message and exit
- If the directory is not accessible due to permissions, show an appropriate error message
- If `.zamm/base-state.json` cannot be written, show an error about the inability to save the configuration

## Integration with Existing Commands

All other ZAMM commands (`organize`, `info`, `split`, `impl`, `spec`, `feat`) should respect the redirect configuration and operate on the redirected directory instead of `docs/` when a redirect is active.