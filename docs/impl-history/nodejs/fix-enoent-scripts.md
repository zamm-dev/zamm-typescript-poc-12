---
id: ETO753
type: ref-impl
specs:
  - id: RPL227
    path: /spec-history/fix-enoent-scripts.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: fe83fe4382d1bee75313766adeadce59db2f7b2a
    message: Add -a flag to copyfiles to include hidden directories in build
---

# Fix ENOENT Error for Hidden Directories in Init Scripts

## Problem

The `zamm init scripts` command was failing with:

```
Error: ENOENT: no such file or directory, scandir '.../dist/resources/init-scripts/.claude/commands'
```

This occurred because the build process wasn't copying hidden files and directories (files/directories starting with a dot, like `.claude`) from `src/resources/init-scripts/` to `dist/resources/init-scripts/`.

## Solution

Added the `-a` flag to the `copyfiles` command in the build script to include all files including dotfiles.

**Changed**: `package.json` line 13

```json
"build": "tsc && copyfiles -a -u 1 \"src/resources/**/*\" dist && mv dist/zamm.js dist/zamm"
```

The `-a` flag ensures that `copyfiles` copies all files including hidden ones.

## Implementation Notes

- The fix was straightforward - just adding a single flag to the build command
- Verified the fix by running `npm run build` and checking that `dist/resources/init-scripts/.claude/commands/` exists
- All existing tests passed without modification
- No code changes were needed, only the build configuration
