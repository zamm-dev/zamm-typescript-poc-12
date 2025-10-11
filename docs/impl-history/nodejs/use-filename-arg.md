---
id: LIE719
type: ref-impl
specs:
  - id: ABV805
    path: /spec-history/use-filename-arg.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: bc32a06a10392795d224a455c92e78997fb932f7
    message: Record spec commit for use-filename-arg changelog
  - sha: edd6db0ef5136e1423ed0af373779725c6f6dce1
    message: >-
      Document Claude workflow commands and update document-impl to use
      --filename
---

# Implementation: Use --filename Argument in Workflow

This implementation updated the `.claude/commands/document-impl.md` workflow to use the existing `--filename` argument that was previously added to the `zamm impl create` command.

## What Was Implemented

The change was straightforward - updating the workflow documentation to instruct agents to use the `--filename` argument when calling `zamm impl create`. The actual implementation of the `--filename` argument was already completed in a previous feature branch (`zamm/zamm-impl-filename`).

### Workflow Changes

Updated `.claude/commands/document-impl.md` step 1 from:

```bash
zamm impl create --spec <new-spec-file> --for docs/impls/nodejs.md
```

To:

```bash
zamm impl create --spec <new-spec-file> --for docs/impls/nodejs.md --filename <descriptive-name>.md
```

This eliminates the previous instruction about renaming files after generation.

### Spec Documentation Added

Created a new spec file `docs/specs/claude-workflows.md` (LKJ392) to document the Claude Code workflow commands in `.claude/commands/`. This spec provides:

- Overview of Claude workflow command structure
- Documentation of the core development workflow cycle
- Guidelines for workflow file structure
- Best practices for updating workflow commands

## Implementation Notes

### No Code Changes Required

This was purely a documentation update. The `--filename` argument functionality was already implemented in commit `aaa9c5e` from the previous feature branch. That implementation:

- Added optional `filename` parameter to `ImplementOptions` interface
- Updated `generateImplementationNote()` to accept and use custom filename
- Modified the CLI command handler to accept `--filename` option
- Included test coverage for custom filename functionality

### Testing

No new tests were needed since:

1. The `--filename` argument was already tested in the previous implementation
2. This change only updated workflow documentation, not code behavior
3. The workflow was validated by successfully using it to generate this very documentation file

### User Experience Improvement

Before this change, agents had to:

1. Generate a file with the default `new-<spec-id>-impl.md` name
2. Think of an appropriate descriptive name
3. Rename the file

Now agents can:

1. Think of an appropriate descriptive name upfront
2. Generate the file with that name directly

This reduces cognitive overhead and potential for file naming conflicts during the generation step.

## Lessons Learned

### Workflow Documentation is Code Too

When adding new CLI features, remember to update not just the main specs but also the workflow command files that guide agents through using those features. The workflow files in `.claude/commands/` are user-facing documentation that should be kept in sync with CLI capabilities.

### Spec Organization

This implementation revealed that Claude workflow commands were not previously documented in the spec directory. Created `docs/specs/claude-workflows.md` to address this gap. Future workflow-related changes should reference this spec.
