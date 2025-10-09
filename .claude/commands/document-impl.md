# Documenting Implementation Steps

1. **Documentation Generation**: Run `zamm impl create --spec <new-spec-file> --for docs/impls/nodejs.md`. If you have no context on what `<new-spec-file>` is, run `git diff main` to find out about the newly added spec file.
2. **Implementation Documentation**: Update the generated plan file with any surprises, errors, and user guidance encountered during your implementation. The goal of this step is to warn future readers about anything they should take into account when re-implementing this spec.
3. **Commit Recording**: Run `zamm impl record <ref-impl> --last-n-commits <N>`, where `<N>` is the total number of commits you've made and `<ref-impl>` is the file path or ID of the plan file you just edited.
4. **Development Documentation**: Update `docs/impls/` with concise _implementation-specific_ development guidance for future agents (e.g. changes to project structure, dev commands, or anything else of note to future LLM agents working on this specific project). You should **never** duplicate feature documentation in this step -- that information belongs in the specs in `docs/`.
5. **Spec Updates**: Update the main spec (NOT spec-history) with learned requirements that apply to all implementations. Keep spec-history files concise as changelog entries. Write specs as present-tense directives for future implementers.
6. **Documentation Commit**: Make a commit with all the documentation updates. This commit does not need to be recorded in any spec files.

## Critical Documentation Patterns

When your conversational context has been compacted, be extra wary of the following things:

- **Don't make assumptions about command patterns** - verify actual implementation syntax rather than assuming subcommand structures exist
- **Check what actually changed** - use `git diff` to understand real implementation impact on specs rather than guessing what changed
- **Be systematic about spec updates** - check ALL related specs when implementation changes affect output formats or behavior patterns
- **Verify field names and formats** - don't assume spec field names match what was actually implemented; grep the codebase to confirm
- **Test the actual output** - run non-destructive commands to see current behavior rather than assuming what the output format should be
