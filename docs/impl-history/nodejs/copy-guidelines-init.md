---
id: QHI706
type: ref-impl
specs:
  - id: ISG292
    path: /spec-history/copy-guidelines-zamm.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 1abcfe7e2c36b842e8900d7161fc55b60c206176
    message: Add software-dev-guidelines.md installation to init scripts
---

# Copy Software Development Guidelines to Init Scripts

## Implementation Summary

Added installation of `.claude/software-dev-guidelines.md` to the `zamm init scripts` command.

## Implementation Details

### Files Modified

1. **src/resources/init-scripts/.claude/software-dev-guidelines.md** (new)
   - Copied the guidelines file from project root to template bundle

2. **src/core/commands/init.ts**
   - Refactored `installClaudeCommands()` to accept `sourceDir` parameter instead of using hardcoded `CLAUDE_TEMPLATE_DIR`
   - Made `implPathForTemplate` parameter optional to support files without placeholders
   - Added `CLAUDE_ROOT_TEMPLATE_DIR` constant for `.claude/` root files
   - Added second call to `installClaudeCommands()` to install root-level `.claude/` files

3. **src/**tests**/commands/init.test.ts**
   - Added verification that `software-dev-guidelines.md` is installed
   - Checks both file existence and content (headers)

### Code Refactoring

The initial approach would have duplicated the file installation logic. Instead, generalized `installClaudeCommands()` to:

- Accept source directory as parameter
- Make placeholder replacement conditional (only when `implPathForTemplate` is provided)
- Reuse the same function for both command templates and root files

This eliminated code duplication and made the function more maintainable.

### Testing Approach

- Added assertions to existing test to verify guidelines file installation
- Verified file content contains expected headers
- All 119 tests pass after implementation

## Notes for Future Implementers

- The `.claude/` directory in the template bundle can contain both a `commands/` subdirectory and root-level files
- Files in `.claude/` root are copied as-is without placeholder replacement
- Files in `.claude/commands/` have `{{IMPL_PATH}}` replaced with the implementation file path
- The `copyfiles -a` flag in the build process is critical for copying hidden directories like `.claude/`
