---
id: RPL227
type: spec
commits:
  - sha: d99e0afa842667aef4c3cd510cc476e99f7aa1a7
    message: 'docs: specify that build must copy hidden directories in init scripts'
---

# Fix `ENOENT` Error when Running `zamm init scripts`

Fix the error `Error: ENOENT: no such file or directory, scandir '.../ZAMM-12/base/dist/resources/init-scripts/.claude/commands'` when running `zamm init scripts` on another project
