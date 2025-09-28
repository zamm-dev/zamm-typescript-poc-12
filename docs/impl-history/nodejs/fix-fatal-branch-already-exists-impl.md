---
id: IML545
type: ref-impl
specs:
  - id: SJC776
    path: /spec-history/fix-fatal-branch-already-exists-in-feat-start.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 4bc6b623ebb8ad0297853dfb1eb1697573768be7
    message: Implement proactive conflict checking in feat start
---

# Fix Fatal Branch Already Exists in Feat Start - Implementation

This implementation addresses the Git branch conflict error in the `feat start` command by implementing proactive conflict checking instead of reactive error handling.

## Implementation Approach

### Core Changes

1. **New Utility Function**: Added `branchExists()` function in `src/core/shared/git-utils.ts` to check for existing Git branches using `git show-ref --verify --quiet refs/heads/${branchName}`.

2. **Proactive Conflict Detection**: Modified `src/core/commands/feat.ts` to check for both branch and directory conflicts BEFORE attempting to create the Git worktree, rather than waiting for Git errors.

3. **Preserved Retry Logic**: Maintained the existing 3-retry mechanism with LLM alternative name suggestions, but now triggered by proactive checks rather than error catching.

### Key Implementation Details

- **Branch Detection**: Uses Git's `show-ref` command which is reliable and doesn't produce output for non-existent branches
- **Directory Detection**: Uses Node.js `fs.existsSync()` to check for existing worktree directories
- **Error Handling**: Clear error messages that specify which conflicts were found (branch, directory, or both)

## Testing Challenges and Solutions

### Nock/API Mocking Issues

**Problem**: The Anthropic SDK was swallowing nock "no match" errors and throwing timeout errors instead, making debugging impossible.

**Root Cause**: The SDK's error handling code was catching the real nock error and throwing a generic `APIConnectionTimeoutError`.

**Solution**: The issue was identified and resolved by the user who found that the SDK was masking the real error. This highlighted the importance of proper error handling in test debugging.

**Test Implementation**: Added comprehensive test for conflict resolution that:

- Creates a conflicting Git branch before running feat start
- Verifies alternative branch name is used
- Confirms spec file is created in the correct alternative directory
- Uses proper fixture files for exact content matching

#### User findings

You look at node_modules/@anthropic-ai/sdk/client.js (not the `.ts` file because that one gets transpiled to this and changes to that won't get reflected at runtime), at line 270, they got:

```js
if (isTimeout) {
  throw new Errors.APIConnectionTimeoutError();
}
```

But that's wrong. Replace that with `throw response;`, and we can finally see the real error:

```
Nock: No match for request {
  "method": "POST",
  "url": "https://api.anthropic.com/v1/messages",
  "headers": {
    "accept": "application/json",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
    "user-agent": "Anthropic/JS 0.63.1",
    "x-api-key": "test-api-key",
    "x-stainless-arch": "arm64",
    "x-stainless-lang": "js",
    "x-stainless-os": "MacOS",
    "x-stainless-package-version": "0.63.1",
    "x-stainless-retry-count": "2",
    "x-stainless-runtime": "node",
    "x-stainless-runtime-version": "v24.3.0",
    "x-stainless-timeout": "600"
  },
  "body": "{\"model\":\"claude-3-haiku-20240307\",\"max_tokens\":100,\"messages\":[{\"role\":\"user\",\"content\":\"The branch name \\\"zamm/user-authentication\\\" conflicts. Suggest a different git branch name (lowercase, words separated by hyphens) for: \\\"Add user authentication\\\". Respond with just the branch name, no explanation.\"}]}"
}
```

The LLM was completely wrong about the Anthropic SDK using an HTTP client that nock cannot intercept. Its conclusions were wrong even based on the available data, let alone after debugging dove down to the core of the issue. The LLM should stop being overconfident in its analyses because it has a history of making incorrect assumptions that makes it a really poor debugger.

### API Recording Script Documentation

**Issue**: The `src/scripts/record-api-calls.ts` script was undocumented, making it hard for future developers to update test recordings.

**Solution**: Added documentation in `docs/impls/nodejs.md` explaining how to use the script to record new API responses for testing.

## Gotchas for Future Implementers

1. **Always Test Error Conditions**: The original reactive approach worked for some cases but failed silently in others. Proactive checking is more reliable.

2. **Nock Debugging**: When nock isn't working, the real error might be masked by the HTTP client. Consider temporary debugging modifications to expose actual nock errors.

3. **API Recording**: When adding new test scenarios, ensure the `record-api-calls.ts` script captures all necessary API call sequences, including alternative name suggestions.

4. **File Content Matching**: Tests use exact fixture file matching - ensure fixture files have proper trailing newlines (use `echo >>` command to add them).

5. **Clean Up Debugging Code**: Always remove temporary debugging files, console.log statements, and unused imports before committing.

## Files Modified

- `src/core/shared/git-utils.ts` - Added `branchExists()` function
- `src/core/commands/feat.ts` - Replaced reactive error handling with proactive checking
- `src/__tests__/commands/feat.test.ts` - Added conflict resolution test
- `src/__tests__/fixtures/feat/conflict-resolution/docs/spec-history/user-authentication-feature.md` - Test fixture for alternative branch scenario
- `src/__tests__/shared/nock-utils.ts` - Cleaned up debugging code
- `docs/impls/nodejs.md` - Documented API recording script usage
