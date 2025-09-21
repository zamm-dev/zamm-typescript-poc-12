---
id: YSI785
type: spec
commits:
  - sha: ef3512c4006adbe890ab4ff427ef5af6b02a6ee0
  - sha: 949370721984831a64f724ec1fd80626af8025fc
---

Rename the existing `implement` command to `impl`. Then move the `impl` command to an `impl create` subcommand. Add a new `impl record` subcommand that takes in `--last-n-commits <N>` and a positional argument for the reference implementation ID or file path to edit, then adds the commit hashes to that file, like how [Ref Impl LVH754](/docs/impl-history/nodejs/nodejs-project-init.md) does it.
