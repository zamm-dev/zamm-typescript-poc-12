---
id: INF001
type: implementation-note
---

# Implementation of Info Command

This document tracks the implementation of the `info` command for the ZAMM CLI as specified in `docs/cli/README.md`.

## Requirements Summary

The `info` command should:

- Accept either a file ID or file path as argument
- Display structured information about the file:
  - ID, Type (in proper English), File Path (relative to project root)
  - For project files: list all associated implementations with ID and name
- Handle error cases (file not found, missing frontmatter, no git repo)

## Implementation Plan

### 1. Core Functions in `src/organizer.ts`

- `findFileById(id: string)` - Search docs/ directory for file with matching ID
- `getFileInfo(filePath: string)` - Extract file information from frontmatter
- `getProjectImplementations(gitRoot: string)` - Find all implementation files
- `formatFileInfo(fileInfo, implementations?)` - Format output according to spec

### 2. CLI Integration in `src/cli.ts`

- Add `info` command using Commander.js
- Handle both ID and file path arguments
- Implement proper error handling and output formatting

### 3. Test Coverage

- Test info by ID lookup
- Test info by file path lookup
- Test project files with implementations
- Test error scenarios
- Create appropriate test fixtures

## Implementation Notes

Will reuse existing utilities:

- `findGitRoot()` for project root detection
- `parseFrontmatter()` for reading file metadata
- `findMarkdownFiles()` for searching docs directory
- Error handling patterns from organize command
