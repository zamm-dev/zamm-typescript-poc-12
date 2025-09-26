# Documenting Implementation Steps

1. **Documentation Generation**: Run `zamm impl create --spec <new-spec-file> --for docs/impls/nodejs.md`
2. **Implementation Documentation**: Update the generated plan file with any surprises, errors, and user guidance encountered during your implementation. The goal of this step is to warn future readers about anything they should take into account when re-implementing this spec.
3. **Commit Recording**: Run `zamm impl record <ref-impl> --last-n-commits <N>`, where `<N>` is the total number of commits you've made and `<ref-impl>` is the file path or ID of the plan file you just edited.
4. **Development Documentation**: Update `docs/impls/` with concise _implementation-specific_ development guidance for future agents (e.g. changes to project structure, dev commands, or anything else of note to future LLM agents working on this specific project). You should **never** duplicate feature documentation in this step -- that information belongs in the specs in `docs/`.
5. **Spec Updates**: Update the main spec (NOT spec-history) with learned requirements that apply to all implementations. Keep spec-history files concise as changelog entries. Write specs as present-tense directives for future implementers.
6. **Documentation Commit**: Make a commit with all the documentation updates. This commit does not need to be recorded in any spec files.
7. **Collaboration Improvements**: Update `.claude/commands/implement-spec.md` with improvements to future collaboration with the user, based on what happened in this interaction.
