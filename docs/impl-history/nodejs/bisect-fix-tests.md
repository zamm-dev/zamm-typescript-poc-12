---
id: TXG463
type: ref-impl
specs:
  - id: LPC593
    path: /spec-history/bisect-fix-tests.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 757d1fbf6a99dc507fded0d94ced3e702302e9d2
    message: Fix git commit SHA determinism by adding explicit timezone
---

# Git Bisect to Fix Failing Tests - Implementation Notes

## Root Cause Identification

The tests were failing because `createDeterministicCommits()` in `src/__tests__/shared/git-test-utils.ts` was creating git commits without specifying an explicit timezone. This caused commit SHAs to vary based on the system timezone, leading to test failures when the timezone changed (e.g., daylight saving time transitions).

Git includes the timezone in the commit object that gets hashed to generate the SHA, so the same commit with different timezones produces different SHAs.

## Investigation Process

1. **Initial Test Run**: Ran `npm test` and observed 7 failing tests across 3 test suites (organize.test.ts, spec.test.ts, implement.test.ts)

2. **Git Bisect Attempt**: Started `git bisect` to find when tests started failing, but discovered the issue existed across multiple recent commits, indicating it wasn't a code regression but rather an environmental change

3. **Root Cause Discovery**: Upon closer examination of `git-test-utils.ts`, discovered that the commit dates were formatted as `2024-01-0${i} 12:00:00` without a timezone specification, allowing git to use the system timezone

4. **Verification**: Created test git repos manually to verify that commit SHAs are deterministic when timezone is specified but vary when it's not

## Implementation Changes

### Modified Files

1. **src/**tests**/shared/git-test-utils.ts**
   - Changed commit date format from `2024-01-0${i} 12:00:00` to `2024-01-0${i} 12:00:00 +0000`
   - This ensures all test commits use UTC timezone regardless of system settings

2. **Test Fixture Files** (6 files updated with new deterministic SHAs)
   - `src/__tests__/fixtures/spec/after/docs/spec-history/user-authentication.md`
   - `src/__tests__/fixtures/spec/after-with-existing-commits/docs/spec-history/user-authentication.md`
   - `src/__tests__/fixtures/implement/record-commits/docs/specs/features/impl-history/initial-auth.md`
   - `src/__tests__/fixtures/implement/record-commits-prepend/docs/specs/features/impl-history/initial-auth.md`
   - `src/__tests__/fixtures/organize/before/docs/impl-history/nodejs/features/test-ref-impl-missing-commit-messages.md`
   - `src/__tests__/fixtures/organize/after/docs/impl-history/nodejs/features/test-ref-impl-missing-commit-messages.md`

### New Deterministic Commit SHAs

With the explicit `+0000` timezone:

- **For clean repos (spec tests):**
  - Commit 2: `8dbdc14b102c5c89fd948d4e544649ea16733542`
  - Commit 1: `196af48c7f1d73046ea3df11984e348d47a0d604`

- **For repos with files present (implement/organize tests):**
  - Commit 3: `cee75f6a3aa239e7c05555348e3d0743bba4551f`
  - Commit 2: `8dbdc14b102c5c89fd948d4e544649ea16733542`

## Key Learnings

1. **Git Commit Determinism**: For truly deterministic git commits in tests, you must specify:
   - Author name and email
   - Committer name and email (usually same as author)
   - Author date with timezone
   - Committer date with timezone
   - Commit message
   - Tree state (file contents)

2. **System Timezone Effects**: Any date/time parsing without explicit timezone will use system settings, which can change due to:
   - Daylight saving time transitions
   - System timezone configuration changes
   - Geographic location changes
   - OS updates affecting timezone handling

3. **Test Fixture SHAs Depend on Repository State**: The implement tests generate different commit SHAs than spec tests because files are created before commits, changing the git tree state. This is expected behavior.

## Surprises and Gotchas

- The bisect process revealed the issue wasn't a recent code change but rather a timezone change on the development machine
- Git's timezone handling is more subtle than expected - it doesn't just affect display, it affects the actual commit SHA
- All test fixtures needed to be regenerated with the new deterministic SHAs after fixing the timezone issue

## Testing

All tests pass after the fix: 113 passed, 1 skipped
