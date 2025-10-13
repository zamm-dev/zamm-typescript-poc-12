---
id: SIR742
type: ref-impl
specs:
  - id: OIU803
    path: /spec-history/refresh-zamm-init.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: b6fbf41dede7aed957a5a6b43127d5f8dd531107
    message: Record fix and spec update commits
  - sha: 827d28ab869abbcfad2444146891f32be801b093
    message: Improve implement-spec workflow with code reuse guidance
  - sha: 67efdb6ebf2a320d69ad890c675cf54fd9b0313e
    message: 'Refactor: Extract copyDirectory to shared file-utils'
  - sha: 10dc6a2738766a2395d6d6f12193383a95976e53
    message: Add refresh-init-scripts maintenance script
---

# Refresh Init Scripts Implementation

## Implementation Approach

Created `src/scripts/refresh-init-scripts.ts` as a TypeScript maintenance script that synchronizes the `zamm init scripts` template files with current working versions.

### Script Structure

1. **Git Root Validation**: Uses `execSync` to verify execution from repository root
2. **Directory Copying**: Leverages the newly-created shared `copyDirectory` utility from `file-utils.ts`
3. **Placeholder Restoration**: Custom line-by-line processing to restore template placeholders
4. **Marker Validation**: Errors if expected section markers aren't found

### Key Implementation Details

**Placeholder Restoration Logic**:

- `{{IMPL_PATH}}`: Simple regex replacement in all `.claude/*.md` files
- `{{WORKTREE_SETUP_COMMANDS}}`: Line-based state machine that skips content between `##### Setup worktree environment` and the next `#####` heading, adds blank line after placeholder
- `{{WORKTREE_BUILD_COMMANDS}}`: Replaces everything between `# Step 5:` and `# Step 6:` with fixed two-line template (echo + placeholder), restores generic Step 5 comment

**Formatting Preservation**:

- Adds blank line after `{{WORKTREE_SETUP_COMMANDS}}`
- Ensures trailing newline in end-worktree.sh with explicit `+ '\n'`
- Preserves all other script structure

## User Guidance During Implementation

**Boolean Flag Simplification**: Initially used both `inStep5` and `skipMode` flags for end-worktree.sh placeholder restoration. User clarified that we need both: `inStep5` to detect when we enter Step 5, `skipMode` to control skipping content after the echo line.

**Generic vs Implementation-Specific Content**: User pointed out three issues with initial output:

1. `{{IMPL_PATH}}` was being replaced with `docs/impls/nodejs.md` instead of staying as placeholder
2. Step 5 comment was implementation-specific ("Run the build command for the NodeJS implementation") instead of generic ("Run implementation-specific build or verification commands")
3. Missing blank line after `{{WORKTREE_SETUP_COMMANDS}}`

**Code Reuse**: After implementation, user identified that the `copyDirectory` function duplicated `copyDirectoryRecursive` from test-utils.ts. This led to extracting the function to shared utilities.

## Potential Pitfalls

- The script uses exact string matching for markers - if the shell script structure changes (e.g., heading format), the script will error out rather than silently producing incorrect output
- The regex for `{{IMPL_PATH}}` replacement is hardcoded to `docs/impls/nodejs.md` - if the path format changes, update the regex
- The `exclude` parameter in `copyDirectory` only matches exact filenames, not patterns
