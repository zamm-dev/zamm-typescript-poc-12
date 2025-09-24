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
│       └── feat/           # Feat command test fixtures
├── core/                   # Core business logic
│   ├── commands/           # Command-specific implementations
│   │   ├── organize.ts       # Organize command logic
│   │   ├── info.ts           # Info command logic
│   │   ├── implement.ts      # Implement command logic
│   │   └── feat.ts           # Feature lifecycle command logic
│   ├── shared/             # Shared utilities and types
│   │   ├── types.ts          # Type definitions
│   │   ├── id-provider.ts    # ID generation logic
│   │   ├── file-utils.ts     # File system utilities and markdown title extraction
│   │   ├── frontmatter.ts    # YAML frontmatter parsing and manipulation
│   │   ├── file-resolver.ts  # File detection and resolution
│   │   ├── git-utils.ts      # Git repository operations
│   │   └── anthropic-service.ts # Anthropic LLM API integration
│   └── index.ts            # Core module exports
├── scripts/                # Development and maintenance scripts
│   └── record-api-calls.ts # Script to record Anthropic API responses for testing
├── zamm.ts                 # Main CLI entry point with Commander.js
└── index.ts                # Library exports
```

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
- **feat**: Feature lifecycle management commands
  - **feat start**: Start a new feature with Git worktree and spec file using LLM suggestions

## Development

- **Dev mode**: `npm run dev` - Build and run in development
- **Type check**: `npm run typecheck` - TypeScript type checking only
- **Watch build**: `npm run build:watch` - Compile with file watching

## Git Hooks

- **Pre-commit**: Automatically runs linting, formatting on staged files, and builds the project
- **Pre-push**: Runs full test suite before push

### Setup on Fresh Clone

After cloning the repository, run:

```bash
npm install
```

The `prepare` script will automatically set up git hooks via Husky.

## Testing Guidelines

### Test Resource Files

Following the test-file-resources specification (see [Spec MTW997](docs/specs/test-file-resources.md)), test assertions that verify file content use exact matching against expected output files stored in `src/__tests__/fixtures/`. This ensures reliable testing of generated content by comparing against known-good reference files rather than partial string matching.

Test setup avoids runtime string replacement (e.g., `content.replace()`) and instead uses dedicated fixture files for different test scenarios. This ensures tests verify exactly what they're supposed to test without modification.

### Test Utilities

Use `copyTestFile` to copy test fixtures into the same corresponding path in a temporary test directory.

Use `expectFileMatches(testEnv, relativePath, fixtureSubDir?)` to verify that a file in the temporary test directory matches a fixture file at the same relative path. The optional `fixtureSubDir` parameter specifies a subdirectory within the fixture directory (similar to `copyDirectoryFromFixture`).

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

## Development Guidance for Future Agents

### Key Development Feedback and Lessons Learned

1. **Respect TypeScript Configuration**
   - **Lesson**: Always work within the existing `src/` directory structure rather than trying to bypass TypeScript compilation
   - **Context**: When adding new scripts or utilities, place them in `src/scripts/` to maintain proper type checking
   - **Anti-pattern**: Excluding directories from TypeScript config to avoid compilation issues

2. **Don't Remove Working Code Without Understanding Context**
   - **Lesson**: When cleaning up "useless files", verify what they actually are before deletion
   - **Context**: Build artifacts (`.js`, `.d.ts`, `.map` files) vs source code (`.ts` files)
   - **Best Practice**: Use `ls -la` to understand file types before removal

3. **Mock Verification in Testing**
   - **Lesson**: Always verify that mocks are actually being used in tests
   - **Implementation**: Add usage counters and verification methods to confirm API interception
   - **Why**: Ensures tests are hitting actual endpoints, not just passing without real validation

4. **API Security in Testing**
   - **Lesson**: Filter sensitive data (API keys) but match on actual test headers for proper validation
   - **Pattern**: Record with filtered keys (`sk-FILTERED`), but match tests against actual test values
   - **Implementation**: Use regex replacement in recordings while maintaining functional header matching

5. **Commit Hygiene**
   - **Lesson**: Don't include development/IDE files (like `.claude/` changes) in commits
   - **Command**: Use `git restore --staged .claude/` to exclude development environment state
   - **Focus**: Commits should contain only actual implementation changes

6. **Testing with Real API Responses**
   - **Lesson**: Use actual API recordings (nock) rather than mocked responses for more realistic testing
   - **Benefits**: Better coverage of real API behavior, proper response format validation
   - **Tools**: Nock with proper header matching and API key filtering

### Established Best Practices

- **Type Safety**: All code must pass TypeScript strict mode compilation
- **Test Isolation**: Create controlled test environments rather than relying on excessive mocking
- **Security**: Always filter sensitive data in recordings but maintain functional header matching
- **Documentation**: Record both successful patterns and failed approaches for future reference
- **Incremental Development**: Commit working code frequently, but keep commits focused and clean
