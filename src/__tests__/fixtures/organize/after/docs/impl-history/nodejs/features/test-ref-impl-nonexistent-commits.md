---
id: REF004
type: ref-impl
specs:
  - id: AUTH001
    path: /docs/specs/features/authentication.md
impl:
  id: IMPL001
  path: /docs/impls/test-nodejs.md
commits:
  - sha: nonexistent1234567890abcdef1234567890abcdef123456
  - sha: alsonotreal7890abcdef1234567890abcdef1234567890a
---

# Test Reference Implementation with Nonexistent Commits

This is a test reference implementation with commit hashes that don't exist in the git repository. The organize command should remove the message fields for these commits.
