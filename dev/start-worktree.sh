#!/usr/bin/env bash
set -euo pipefail

##### Prerequisite Checks

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <feature description>" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: must run inside a git repository" >&2
  exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
  echo "Error: run from main or master (current: $current_branch)" >&2
  exit 1
fi

description="$*"
git_root=$(git rev-parse --show-toplevel)

if [[ "$PWD" != "$git_root" ]]; then
  echo "Error: run from the git root ($git_root)" >&2
  exit 1
fi

##### Create new worktree branch
branch_slug=$(aichat "Suggest a concise git branch name (lowercase, words separated by hyphens) for this feature description: '${description}'. Respond with just the branch name, no explanation. The branch name should be 3 words or less.")
if [[ -z "$branch_slug" ]]; then
  echo "Error: generated branch name is empty" >&2
  exit 1
fi
branch_name="zamm/$branch_slug"

worktree_dir="$branch_slug"
worktree_path="../$worktree_dir"
git worktree add "$worktree_path" -b "$branch_name"

##### Create Spec Changelog File
spec_title=$(aichat "Create a concise H1 markdown title for a specification about: '${description}'. Respond with just the title text without the # symbol.")
cd "../$worktree_dir"
spec_path="$branch_slug.md"
zamm spec changelog "$spec_path"
printf "# $spec_title\n\n$description\n" >> "docs/spec-history/$spec_path"

##### Run post-setup steps
echo "ZAMM_INIT_DIR_OVERRIDE=$worktree_path"
echo "Workflow initialized! Next steps:"
echo "cd '$worktree_path' && claude \"/change-spec\""
