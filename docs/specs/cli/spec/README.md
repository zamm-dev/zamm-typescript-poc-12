---
id: PWQ070
type: spec
---

# `spec`

The `spec` command provides subcommands for managing specification records in the spec-history directory.

## `spec changelog <filepath>`

The `spec changelog <filepath>` command creates a new spec file at the specified path. If the path does not start with `spec-history/`, it will be automatically prepended to ensure the file is created in the correct directory.

The command should:
- Create a new markdown file with proper YAML frontmatter including an auto-generated ID and `type: spec`
- If the filepath doesn't start with `spec-history/`, prepend `spec-history/` to the path
- Ensure the target directory exists, creating it if necessary
- Initialize the file with a basic template structure

## `spec record`

When given the `--last-n-commits <N>` parameter and a positional argument for the spec ID or file path, `spec record` should add the commit hashes from the last N commits to the specified file's frontmatter under a `commits` field. The commits should be recorded as an array of objects with `sha` and `message` properties.

The command should validate that the target file exists in the `docs/spec-history/` directory and has `type: spec` in its frontmatter before recording commits. If the file is not in the spec-history directory or the file type is not `spec`, the command should exit with an error.

If the `commits` field already exists, the new commits should be prepended to the existing list, maintaining chronological order with the most recent commits first.

The command must also validate that the current directory is within a git repository before attempting to retrieve commit information. If not in a git repository, the command should exit with an appropriate error message.

This command should only apply to specs in the `docs/spec-history/` directory. Regular specs in the `docs/specs/` directory are not eligible for this sort of changelog tracking.

> [!NOTE]
> The `spec record` command is meant to do almost the exact same thing as the `impl record` command. As such, when editing this spec, consider editing [Spec GVN809](/docs/specs/cli/impl/README.md) as well.
