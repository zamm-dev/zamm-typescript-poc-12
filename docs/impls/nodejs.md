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
│   │   └── implement.test.ts # Implement command tests
│   ├── shared/             # Shared test utilities
│   │   └── test-utils.ts     # Test utilities with directory copying
│   └── fixtures/           # Test fixture files with preserved directory structure
│       ├── info/           # Info command test fixtures
│       ├── organize/       # Organize command test fixtures
│       └── implement/      # Implement command test fixtures
├── core/                   # Core business logic
│   ├── commands/           # Command-specific implementations
│   │   ├── organize.ts       # Organize command logic
│   │   ├── info.ts           # Info command logic
│   │   └── implement.ts      # Implement command logic
│   ├── shared/             # Shared utilities and types
│   │   ├── types.ts          # Type definitions
│   │   ├── id-provider.ts    # ID generation logic
│   │   ├── file-utils.ts     # File system utilities
│   │   ├── frontmatter.ts    # YAML frontmatter parsing
│   │   └── file-resolver.ts  # File detection and resolution
│   └── index.ts            # Core module exports
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
- **implement/i**: Generate reference implementation file for a spec and implementation

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

Following the test-file-resources specification, test assertions that verify file content use exact matching against expected output files stored in `src/__tests__/fixtures/`. This ensures reliable testing of generated content by comparing against known-good reference files rather than partial string matching.

### Test Utilities

Use `copyTestFile` to copy test fixtures into the same corresponding path in a temporary test directory.
