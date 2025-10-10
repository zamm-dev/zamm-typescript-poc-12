# Make new changes to spec

You are in a fresh Git worktree directory. You are here to update the spec with the new desired changes as defined by the new changelog entry in `spec-history/`. Follow these steps:

1. Run `git diff main` to understand the spec changes that are being requested by a new changelog file in `spec-history/`
2. Make the relevant changes in @docs/specs/ . Correct existing documentation as needed. Do not modify the code or files in any other part of the project.
3. Commit only the spec changes in docs/specs/ - do not commit any files in docs/spec-history/ or other directories in this step.
4. Run `zamm spec record <ID> --last-n-commits 1` to record the last commit you just made to the spec. Use the spec ID from the changelog file's frontmatter, not the file path, since the current directory may differ from the ZAMM root.
5. Commit the spec-history file that was just updated with the recorded commit information.

## Important Notes

- Avoid running linting, type-checking, or verification commands - committed changes should already conform to spec
- `zamm` is already in `PATH` - there is no need to build it first before using it
- When specs reference external tools or CLI commands, verify they actually exist through documentation research before including them in the spec. Don't assume commands exist based on intuitive naming patterns.
- Before updating specs, thoroughly understand existing behavior by reading related implementation files and documentation. Don't make assumptions about how commands work or what they return.
