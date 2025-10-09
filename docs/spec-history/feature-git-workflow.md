---
id: RQY572
type: spec
commits:
  - sha: 6952465949cc181d26a57a93a63296b4bd3ec854
    message: Prevent end-to-end test from running in hooks/CI
  - sha: 1b58cd0532f74fb09d65204ac55a45d9f069a51c
    message: Implement end-to-end test for feat start command
  - sha: 2553a31a81a6bb72ae1adb88b22f6f6c3699aae3
    message: Initial implementation of externalized Git workflow
  - sha: b3195716c6d268416cdcd9d64b4611b4056d08b6
    message: Clarify new philosophy behind development workflow scripting
  - sha: 3dbe0f98873cadd13257be65c4b29032a46994d0
    message: Update feat command spec to use Bash script for git worktree branching
---

# Use Bash Script for Git Worktree Branching in `zamm feat start`

Use a Bash script in dev/ that intermixes [`aichat`](https://github.com/sigoden/aichat) and Bash commands to do the git worktree branching logic that `zamm feat start` does. Then have `zamm feat start` run that command instead of doing its own Anthropic calls and Git ops.

- zamm shouldn't worry about creating base-state.json anymore
- zamm should still create current-workflow-state.json for itself in the worktree location
