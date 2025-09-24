# Implement the latest spec changes

This command follows an 8-step process for implementing specifications. Use the TodoWrite tool to track progress through these steps.

## Core Implementation Steps

1. **Project Analysis**: Run `eza . --tree --git-ignore` to understand the entire project structure
2. **Spec Analysis**: Run `git diff main` to understand the latest requested spec changes and implementation requirements
3. **Implementation**: Implement the specification following development best practices (see guidelines below)
4. **Documentation Generation**: Run `zamm impl create --spec <new-spec-file> --for docs/impls/nodejs.md`
5. **Implementation Documentation**: Update the generated plan file with surprises, errors, and implementation guidance. The goal of this step is to warn future readers about anything they should take into account when re-implementing this spec.
6. **Commit Recording**: Run `zamm impl record <ref-impl> --last-n-commits <N>`, where `<N>` is the total number of commits you've made and `<ref-impl>` is the file path or ID of the plan file you just edited.
7. **Development Documentation**: Update `docs/impls/` with concise _implementation-specific_ development guidance for future agents (e.g. changes to project structure, dev commands, or anything else of note to future LLM agents working on this specific project). You should **never** duplicate feature documentation in this step -- that information belongs in the specs in `docs/`.
8. **Spec Updates**: Update the original spec with learned requirements that apply to all implementations. This should be things that were originally left underspecified in the original spec.
9. Make another commit with all the documentation updates. This commit does not need to be recorded in any spec files.
10. **Collaboration Improvements**: Update `.claude/commands/implement-spec.md` with improvements to future collaboration with the user, based on what happened in this interaction.

## Implementation Guidelines

### Architecture and Code Quality

- Extract service layers for external integrations (e.g., API clients)
- Use proper error types instead of throwing generic errors

### Testing Strategy

- Create comprehensive test suites that verify the complete workflow
- Use exact file content matching with fixtures rather than partial string matching
- Consolidate related test cases into single comprehensive tests
- Set up isolated test environments rather than relying on extensive mocking
- For API integrations, record real responses and filter sensitive data appropriately
- Always verify that mocks are actually used in tests

### User Collaboration

- **Explain initial approaches** if the user wants to know why you did things a certain way
- **Ask for clarification** when user feedback seems to contradict the spec
- **Commit regularly** but don't include development environment files (`.claude/` changes)

### Common Patterns to Avoid

- Don't override build configuration to avoid compilation issues - work within established project structure
- Don't remove working code without understanding what it is (build artifacts vs source)
- Don't duplicate logic across functions - extract common functionality into helper functions
- Don't include generic examples in test documentation - use exact values from actual tests

## Key Success Factors

- **Comprehensive testing**: Tests should verify the complete user workflow, not just individual functions
- **Documentation accuracy**: Implementation docs should reflect what was actually built, not what was originally planned
