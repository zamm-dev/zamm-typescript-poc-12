---
id: YSI785
type: spec
commits:
  - sha: b387a86543b55a193a6a74d866f55569f3c94f84
---

Rename the existing `implement` command to `impl`. Then move the `impl` command to an `impl create` subcommand. Add a new `impl record` subcommand that takes in `--last-n-commits <N>` and a positional argument for the reference implementation ID or file path to edit, then adds the commit hashes to that file, like how [Ref Impl LVH754](/docs/impl-history/nodejs/nodejs-project-init.md) does it.
