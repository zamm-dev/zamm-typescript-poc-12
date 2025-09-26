---
id: GBG455
type: spec
commits:
  - sha: 62dafadecbdcda54f347b543fd2b1286009b9c98
    message: Add redirect command specification
---

# Add a `redirect <dir>` command to use a custom base directory

Add a `redirect <dir>` command that allows zamm to use another directory instead of `docs/` as the base of operations. The specified redirect directory should be stored in `.zamm/base-state.json` . All ZAMM operations should continue exactly the same as if the data were still in `docs/`
