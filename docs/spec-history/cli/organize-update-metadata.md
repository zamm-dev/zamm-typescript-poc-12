---
id: LQO792
type: spec
commits:
  - sha: f71cfcfc036addcf5573c8e222a16c8de4253b06
---

# `organize` command should update derived metadata

The `organize` command should overwrite all derived metadata. For example:

- the `impl create` command sets implementation and spec file paths. `organize` should overwrite the updated file paths by finding the right impl and spec based on ID.
- the `impl record` command sets Git commit messages. `organize` should overwrite the updated commit messages based on Git command output. (Theoretically this should never change, but if such messages weren't set, or set incorrectly, by previous tooling, this would fix it.)
