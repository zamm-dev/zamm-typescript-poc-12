---
id: UPA513
type: ref-impl
specs:
  - id: WAX625
    path: /spec-history/cleanup-after-push.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 553da2287592ee0743e05a36cc042c3b9868a38d
    message: Reorder end-worktree.sh steps to cleanup after successful push
---

# Cleanup After Push Implementation

This implementation reordered the steps in `dev/end-worktree.sh` to perform cleanup operations (worktree removal and branch deletion) after a successful push to the remote repository.

## Implementation Notes

### Changes Required

The implementation involved three main changes:

1. **dev/end-worktree.sh**: Reordered steps 3-6 to move the build and push operations before the cleanup operations
2. **src/scripts/refresh-init-scripts.ts**: Updated the `restoreEndWorktreePlaceholder` function to look for Step 3/4 markers instead of Step 5/6
3. **src/**tests**/scripts/refresh-init-scripts.test.ts**: Updated test expectations to match the new step numbering

### Implementation Experience

The implementation was straightforward with no unexpected issues. The key insight was recognizing that the `refresh-init-scripts.ts` script needs to be updated whenever the step numbering changes in the template scripts, as it parses these step markers to insert implementation-specific placeholders.

### Testing

All existing tests passed after updating the test expectations to match the new step numbers. No new tests were required as the functionality remained the same - only the order of operations changed.
