# Make new changes to spec

You are in a fresh Git worktree directory. You are here to update the spec with the new desired changes as defined by the new changelog entry in `spec-history/`. Follow these steps:

1. Run `git diff main` to understand the spec changes that are being requested by a new changelog file in `spec-history/`
2. Make the relevant changes in @docs/specs/ . Correct existing documentation as needed. Do not modify the code or files in any other part of the project.
3. Commit only the spec changes in docs/specs/ - do not commit any files in docs/spec-history/ or other directories in this step.
4. Run `zamm spec record spec-history/<file-path> --last-n-commits 1` to record the last commit you just made to the spec. The file path should be to the changelog file in `spec-history/`
5. Set up this worktree according to the instructions in @docs/impls/nodejs.md so that the next implementation agent can come in and start work immediately.
