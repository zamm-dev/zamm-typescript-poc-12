---
id: IEU463
type: implementation
---

# NodeJS Implementation of ZAMM

This is an implementation of the ZAMM CLI using NodeJS with TypeScript.

## Project Structure

```
src/
├── __tests__/              # Jest test files
│   ├── commands/           # Command-specific test files
│   │   ├── organize.test.ts  # Organize command tests
│   │   ├── info.test.ts      # Info command tests
│   │   ├── implement.test.ts # Implement command tests
│   │   ├── spec.test.ts      # Spec command tests
│   │   └── feat.test.ts      # Feature lifecycle command tests
│   ├── shared/             # Shared test utilities
│   │   ├── test-utils.ts     # Test utilities with directory copying
│   │   ├── git-test-utils.ts # Git repository setup for deterministic testing
│   │   ├── file-utils.test.ts # Tests for file utilities and title extraction
│   │   └── nock-utils.ts     # HTTP mocking utilities for API testing
│   ├── nock-recordings/    # Recorded HTTP responses for deterministic testing
│   │   └── feat-recordings.json # Anthropic API response recordings
│   └── fixtures/           # Test fixture files with preserved directory structure
│       ├── info/           # Info command test fixtures
│       ├── organize/       # Organize command test fixtures
│       ├── implement/      # Implement command test fixtures
│       ├── spec/           # Spec command test fixtures with before/after structure
│       └── feat/           # Feat command test fixtures
├── core/                   # Core business logic
│   ├── commands/           # Command-specific implementations
│   │   ├── organize.ts       # Organize command logic
│   │   ├── info.ts           # Info command logic
│   │   ├── implement.ts      # Implement command logic
│   │   ├── spec.ts           # Spec command logic
│   │   └── feat.ts           # Feature lifecycle command logic
│   ├── shared/             # Shared utilities and types
│   │   ├── types.ts          # Type definitions
│   │   ├── id-provider.ts    # ID generation logic
│   │   ├── file-utils.ts     # File system utilities and markdown title extraction
│   │   ├── frontmatter.ts    # YAML frontmatter parsing and manipulation
│   │   ├── file-resolver.ts  # File detection and resolution
│   │   ├── git-utils.ts      # Git repository operations
│   │   ├── file-types.ts     # File type utilities for consistent error messages
│   │   ├── commit-recorder.ts # Shared commit recording logic for impl/spec commands
│   │   ├── anthropic-service.ts # Anthropic LLM API integration
│   │   └── workflow-service.ts  # ZAMM workflow lifecycle tracking services
│   └── index.ts            # Core module exports
├── scripts/                # Development and maintenance scripts
│   └── record-api-calls.ts # Script to record Anthropic API responses for testing
├── zamm.ts                 # Main CLI entry point with Commander.js
└── index.ts                # Library exports
```

All TypeScript source files must be in the `src/` directory to maintain proper type checking. Place scripts and utilities in `src/scripts/` rather than bypassing TypeScript compilation. Build artifacts (`.js`, `.d.ts`, `.map` files) are generated in `dist/` and should not be modified directly.

## Commands

- **Format**: `npm run format` - Format code with Prettier
- **Lint**: `npm run lint` - Lint code with ESLint
- **Build**: `npm run build` - Compile TypeScript and create executable at `dist/zamm`
- **Test**: `npm test` - Run Jest tests
- **Run**: `npm start` - Execute the compiled CLI (`dist/zamm`)

## CLI Commands

- **organize/o**: Add proper YAML frontmatter to markdown files
- **info**: Display structured information about a file by ID or path
- **split**: Split content from a main file into new separate files with proper frontmatter
- **impl/i**: Implementation management commands
  - **impl create**: Generate reference implementation file for a spec and implementation
  - **impl record**: Record commit hashes and messages in implementation file frontmatter
- **spec**: Specification management commands
  - **spec record**: Record commit hashes and messages in spec-history file frontmatter
- **feat**: Feature lifecycle management commands
  - **feat start**: Start a new feature with Git worktree, spec file, and workflow state tracking using LLM suggestions

## ZAMM Workflow Tracking

The implementation includes workflow lifecycle tracking through `.zamm/` directories:

### Base Directory (Git Repository Root)

- **`.zamm/base-state.json`**: Tracks all active worktrees, their branches, paths, and current states
- **`.zamm/.gitignore`**: Ignores all `.zamm/` contents from Git tracking

### Worktree Directories

- **`.zamm/current-workflow-state.json`**: Tracks the current workflow state (`INITIAL`, `SPEC-UPDATED`, `SPEC-IMPLEMENTED`, `COMPLETED`)
- **`.zamm/.gitignore`**: Ignores all `.zamm/` contents from Git tracking

### Workflow Services

- **BaseWorkflowService**: Manages base directory workflow state
- **WorktreeWorkflowService**: Manages individual worktree workflow state

## Development

- **Dev mode**: `npm run dev` - Build and run in development
- **Type check**: `npm run typecheck` - TypeScript type checking only
- **Watch build**: `npm run build:watch` - Compile with file watching

## Git Hooks

Git hooks are configured via Husky in the `prepare` script that is triggered via `npm install`:

- **Pre-commit**: Automatically runs linting, formatting on staged files, and builds the project
- **Pre-push**: Runs full test suite before push

### Setup on Fresh Clone/Worktree

After cloning the repository, run:

```bash
npm install
```

## Testing Guidelines

### Test Resource Files

Following the test-file-resources specification (see [Spec MTW997](docs/specs/test-file-resources.md)), test assertions that verify file content use exact matching against expected output files stored in `src/__tests__/fixtures/`. This ensures reliable testing of generated content by comparing against known-good reference files rather than partial string matching.

Test setup avoids runtime string replacement (e.g., `content.replace()`) and instead uses dedicated fixture files for different test scenarios. This ensures tests verify exactly what they're supposed to test without modification.

### Test Utilities

Use `copyTestFile` to copy test fixtures into the same corresponding path in a temporary test directory.

Use `expectFileMatches(testEnv, relativePath, fixtureSubDir?, replacements?)` to verify that a file in the temporary test directory matches a fixture file at the same relative path. The optional `fixtureSubDir` parameter specifies a subdirectory within the fixture directory (similar to `copyDirectoryFromFixture`). The optional `replacements` parameter allows for dynamic content replacement (e.g., replacing dynamic paths with fixed placeholders for testing).

- **Do not** use `toContain()` to validate partial file content.
- **Use expectFileMatches consistently** -- when updating test behavior, prefer modifying TestEnvironment over writing manual file verification

All network-related functionality should be recorded and replayed with `nock`. Make sure to filter out sensitive data such as API keys when you do so.

## Known Issues

### Jest CLI Options

When running specific test files, use `--testPathPatterns` instead of the deprecated `--testPathPattern`. For example:

```bash
# Correct
npm test -- --testPathPatterns=implement.test.ts

# Deprecated (will show error)
npm test -- --testPathPattern=implement.test.ts
```

This change affects Jest CLI usage and may impact development workflows that rely on running individual test files. See https://jestjs.io/docs/cli for more information.

### Jest Test Discovery and Command Files

When adding new command files to `src/core/commands/`, ensure they don't match Jest's test patterns or they will be executed as tests. The current Jest configuration excludes `src/core/` and `src/scripts/` directories via `testPathIgnorePatterns`.

If Jest tries to run a command file as a test, update the `testPathIgnorePatterns` in `jest.config.js`.

## Development Guidelines for LLM Agents

### Code Reuse Patterns

When implementing commands that share similar logic (like commit recording), extract shared functionality into `src/core/shared/` utilities:

- Use dependency injection patterns with callback functions for command-specific validation
- Extract common error messaging utilities to ensure consistency
- Follow the established pattern of `shared/commit-recorder.ts` for reusable business logic

### Test Fixture Organization

For commands that modify files, use before/after fixture structure:

- `fixtures/{command}/before/` - initial state files
- `fixtures/{command}/after/` - expected output files
- `fixtures/{command}/before-with-{scenario}/` - scenario-specific initial states
- Avoid `fs.writeFileSync` in tests; use fixture files for exact matching

### CLI Integration

New commands follow this pattern:

1. Command logic in `src/core/commands/{command}.ts`
2. Export from `src/core/index.ts`
3. Add CLI integration in `src/zamm.ts` with error handling wrapper
4. Update this documentation with command descriptions
