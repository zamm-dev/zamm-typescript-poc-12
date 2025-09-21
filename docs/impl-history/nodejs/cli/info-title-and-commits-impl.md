---
id: ZWB094
type: ref-impl
specs:
  - id: NXA068
    path: /docs/spec-history/cli/info-title-and-commits.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
---

# Info Title and Commits Implementation

This implementation adds support for displaying titles instead of file paths and showing commit information in the `info` command, as specified in NXA068.

## Implementation Plan

### Phase 1: Update Core Types and Utilities

**Commit 1: Enhance commit tracking with message support**

- Update `Commit` interface in `src/core/shared/types.ts` to include `message` field
- Update `getLastNCommits()` in `src/core/shared/git-utils.ts` to fetch commit messages using `--pretty=format:"%H%x09%s"`
- Update `addCommitsToFrontmatter()` in `src/core/shared/frontmatter.ts` to handle message field
- Add tests for git utilities with commit messages

### Phase 2: Add Title Resolution Functionality

**Commit 2: Add markdown title extraction utilities**

- Add `extractTitleFromMarkdown()` function to `src/core/shared/file-utils.ts` to extract level 1 headings
- Add `resolveTitleFromFile()` function that reads a file and extracts its title, with fallback to file path
- Add comprehensive tests for title extraction

### Phase 3: Update Info Command Display

**Commit 3: Update info command to show titles and commits**

- Update `formatFileInfo()` in `src/core/commands/info.ts` to:
  - Show titles instead of file paths for specifications and implementations
  - Display commits section for reference implementations with shortened SHA and message
- Update existing tests to match new output format
- Add new test cases for title resolution and commits display

## Expected Changes

### Files Modified

- `src/core/shared/types.ts` - Add message field to Commit interface
- `src/core/shared/git-utils.ts` - Update to fetch commit messages
- `src/core/shared/frontmatter.ts` - Update commit frontmatter handling
- `src/core/shared/file-utils.ts` - Add title extraction functions
- `src/core/commands/info.ts` - Update display logic for titles and commits
- Test files: Update existing tests and add new ones

### Behavior Changes

- `info` command will show "ID: Title" instead of "ID: /path/to/file.md"
- Reference implementations will display a "Commits:" section showing recent commits
- `impl record` will store commit messages along with SHA hashes
- All file references fallback to file paths only when titles are unavailable

This implementation maintains backward compatibility while enhancing the user experience with more meaningful information display.
