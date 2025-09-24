---
id: PWQ070
type: spec
---

# `spec`

The `spec` command provides subcommands for managing specification records in the spec-history directory.

## `spec record`

When given the `--last-n-commits <N>` parameter and a positional argument for the spec ID or file path, `spec record` should add the commit hashes from the last N commits to the specified file's frontmatter under a `commits` field. The commits should be recorded as an array of objects with `sha` and `message` properties.

The command should validate that the target file exists in the `docs/spec-history/` directory and has `type: spec` in its frontmatter before recording commits. If the file is not in the spec-history directory or the file type is not `spec`, the command should exit with an error.

If the `commits` field already exists, the new commits should be prepended to the existing list, maintaining chronological order with the most recent commits first.

This command should only apply to specs in the `docs/spec-history/` directory. Regular specs in the `docs/specs/` directory are not eligible for this sort of changelog tracking.

> [!NOTE]
> The `spec record` command is meant to do almost the exact same thing as the `impl record` command. As such, when editing this spec, consider editing [Spec GVN809](/docs/specs/cli/impl/README.md) as well.
