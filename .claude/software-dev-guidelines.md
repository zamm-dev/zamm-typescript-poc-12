# Software Development Guidelines

## Architecture and Code Quality

- Extract service layers for external integrations (e.g., API clients)
- Separate concerns with distinct service classes (e.g., BaseService vs WorktreeService)
- Use proper error types instead of throwing generic errors
- Use type assertions and proper error handling for JSON parsing

## Testing Strategy

- Create comprehensive test suites that verify the complete workflow
- Use exact file content matching with fixtures rather than partial string matching (see @docs/specs/test-file-resources.md)
- Use test framework's built-in mocks instead of custom mock classes to enable assertions on calls made
- Use `git add -f` for test fixtures that would be ignored by `.gitignore` files
- Consolidate related test cases into single comprehensive tests
- Set up isolated test environments rather than relying on extensive mocking
- For API integrations, record real responses and filter sensitive data appropriately
- Always verify that mocks are actually used in tests
- Confirm with the user before modifying test fixtures to get local tests to pass
- Treat recorded outputs as immutable snapshots unless we intentionally re-record them. Do not manually edit such automatically generated files just to get tests to pass.

## Service Dependency Injection

- Don't put "I" in front of interfaces. Name the interface as usual, and name the implementations to be more specific instantiations of the interface. For examples, see AnthropicService and IdProvider
- Use singleton patterns for external services with getter/setter functions following the IdProvider pattern
- Mock implementations should accept constructor parameters instead of hardcoded return values
- Test fixture files should remain unchanged during a refactor - update tests to match expected responses, not the other way around
- Command option interfaces should match the actual commandline arguments provided by the user. Commands should not accept service dependencies - they should use global singletons.
- Mock service definitions belong in test files, not in the main codebase
- API validation (like missing keys) should happen in real implementations, not in commands
- **Use `echo >>` to add trailing newlines to files** - the editing tools don't handle trailing newlines properly

## User Collaboration

- **Explain initial approaches** if the user wants to know why you did things a certain way
- **Ask for clarification** when user feedback seems to contradict the spec
- **Keep spec documentation concise** - and do not put implementation details into specs, only newly learned requirements!

## Committing Guidelines

- Don't mention removing code that you added during the same commit - only describe changes to the existing codebase.
- **Commit regularly** but don't include development environment files (`.claude/` changes)
- **Make sure to actually commit first** before recording the implementation commit - don't be distracted by user guidance on the proper implementation steps and forget to commit
- **ALWAYS run `git add -A` before committing** - forgetting to stage changes is a recurring issue. Run this command immediately before every `git commit`, **especially after making user-requested changes during implementation**
- **Clean up ALL debugging files and code before committing** - this includes temporary files, console.log statements, commented code, and unused imports

## Common Patterns to Avoid

- Don't override build configuration to avoid compilation issues - work within established project structure
- Don't remove working code without understanding what it is (build artifacts vs source)
- Don't duplicate logic across functions - extract common functionality into helper functions
- Don't include generic examples in test documentation - use exact values from actual tests

## Key Success Factors

- **Comprehensive testing**: Tests should verify the complete user workflow, not just individual functions
- **Documentation accuracy**: Implementation docs should reflect what was actually built, not what was originally planned
