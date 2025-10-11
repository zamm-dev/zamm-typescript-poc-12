---
id: DVB657
type: spec
---

# `init scripts`

The `zamm init scripts --impl <IMPL_ID_OR_PATH>` command installs the standard ZAMM workflow assets (development scripts and Claude command files) into the current project's repository. It personalizes those assets so that they reference the implementation specified by `--impl`.

## Arguments

- `--impl <IMPL_ID_OR_PATH>` (required) — Identifies the implementation doc that describes the target project. The value may be either:
  - A concrete file path (absolute or relative to the repo root)
  - An implementation ID that can be resolved to a file path using existing spec-searching logic

The command must error if `--impl` is omitted, refers to a non-existent implementation, or resolves to something outside of the base documentation directory (`docs/` by default, but may be [redirected](../redirect/README.md)).

## General Behavior

1. Validate that the command is being run inside a git repository and operate relative to the repository root.
2. Ensure the `dev/` directory and `.claude/commands/` directory exist, creating them when missing.
3. Load template resources for `dev/start-worktree.sh`, `dev/end-worktree.sh`, and each Claude command from the packaged resource bundle that ships with the ZAMM executable.
4. Replace template placeholders with project-specific values (see below) and write the personalized files to the target project, overwriting any existing copies.
5. Mark the installed development scripts as executable.
6. Print a short success message that confirms where the assets were written.

## Template Placeholders

All template files shipped with ZAMM must expose explicit substitution markers so that it is obvious which sections are updated by `zamm init scripts`.

- `.claude/commands/*.md` templates must include a `{{IMPL_PATH}}` token anywhere the ZAMM repo would have referenced `docs/impls/nodejs.md`. During installation, the command must replace every occurrence of `{{IMPL_PATH}}` with the resolved implementation path (e.g. `docs/impls/python.md`). The command must not leave placeholder tokens behind in the generated files.
- The `dev/start-worktree.sh` template must retain the existing `##### Setup worktree environment` heading followed by a single line containing the literal token `{{WORKTREE_SETUP_COMMANDS}}`. The install command is responsible for replacing that token with implementation-specific setup commands as described below.
- The `dev/end-worktree.sh` template must contain a single `{{WORKTREE_BUILD_COMMANDS}}` line beneath the "Step 5" heading so the installer can inject implementation-specific build, deploy, and/or verification commands. The install command is responsible for replacing that token with implementation-specific build commands as described below.
- Any additional dynamic data that might be needed in the future must follow the same `{{TOKEN_NAME}}` convention so it remains obvious that the value is populated at install time.

## Claude-Assisted Setup Extraction

For `{{WORKTREE_SETUP_COMMANDS}}` and `{{WORKTREE_BUILD_COMMANDS}}`, follow the following steps:

1. Feed the contents of the target implementation doc (the one located at `{{IMPL_PATH}}`) to Claude and ask Claude to extract bash commands that prepare a freshly cloned repo for development (in the case of `{{WORKTREE_SETUP_COMMANDS}}`) or that updates the main build or deployment artifact (in the case of `{{WORKTREE_BUILD_COMMANDS}}`).
2. If the Claude response is empty or invalid, replace the token with a single comment line `# No implementation-specific steps required` so the script remains valid.
3. If commands are returned, insert them verbatim, preserving indentation and ensuring the token is fully removed.
4. The generated scripts must remain executable and pass `bash -n` validation.

## Other Installed Assets

- Every Claude command template shipped with ZAMM (`change-spec.md`, `document-impl.md`, `implement-spec.md`, `recursive-self-improvement.md`, `refactor.md`, `update-docs.md`, and any future commands placed in the template bundle) must be installed. The install routine should iterate over the template directory so new files are picked up automatically without code changes.
- The `.claude/software-dev-guidelines.md` file must be copied from the template bundle to the target project's `.claude/` directory. This file provides software development best practices and should be installed alongside the command templates.

## Error Handling

- Fail with a clear message if the command is run outside of a git repository.
- Fail if the resolved implementation file cannot be found or read.
- Fail if the Claude interaction returns an error; do not install partial assets in that case.
- If writing any file fails, surface the error and stop without claiming success.

## Packaging Requirements

- The template resources live inside the ZAMM codebase (e.g. `resources/init-scripts/`) and must be embedded in the built CLI so `zamm init scripts` works without depending on repository-relative paths.
- When copying template resources during the build process, the build tool must include hidden files and directories (files/directories beginning with a dot, such as `.claude`). For example, when using `copyfiles`, the `-a` flag ensures all files including dotfiles are copied correctly.
