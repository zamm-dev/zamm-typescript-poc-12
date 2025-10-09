---
id: DQN314
type: ref-impl
specs:
  - id: YAH054
    path: /spec-history/zamm-changelog-args.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: bbfcb0bb55e78975aa17720aabc39fb6b9262ee5
    message: Add --description and --title options to spec changelog command
---

# Implementation: Optional --description and --title Arguments for spec changelog Command

## Implementation Approach

Extended the `createSpecChangelog` function to accept an options object with optional `description` and `title` fields while maintaining backward compatibility with the legacy string API.

### Key Implementation Details

1. **Function Signature Update**: Modified `createSpecChangelog` to accept `CreateSpecChangelogOptions | string`, using type checking to determine which API is being used
2. **Anthropic Integration**: Reused existing `AnthropicService.suggestSpecTitle()` method for title generation
3. **Body Building Logic**: Constructed body with title (H1 heading) and description, with `serializeFrontmatter` handling the trailing newline
4. **CLI Options Handling**: Used conditional assignment to avoid TypeScript `exactOptionalPropertyTypes` issues - only assign properties when they're defined

## Challenges & Solutions

### TypeScript exactOptionalPropertyTypes Error

**Issue**: Direct assignment of potentially undefined optional properties failed compilation:

```typescript
const createOptions: CreateSpecChangelogOptions = {
  filepath,
  description: options.description, // Error: undefined not assignable to string
  title: options.title,
};
```

**Solution**: Only assign properties when they're defined:

```typescript
const createOptions: CreateSpecChangelogOptions = { filepath };
if (options.description !== undefined) {
  createOptions.description = options.description;
}
if (options.title !== undefined) {
  createOptions.title = options.title;
}
```

### Trailing Newline Handling

**Issue**: Initial implementation added an extra newline, causing test failures.

**Solution**: The `serializeFrontmatter` function already adds a trailing newline to non-empty bodies. Build the body without a trailing newline on the description to avoid duplication.

## Testing Strategy

Used Jest mocks for `AnthropicService` to verify:

- Service is NOT called when both title and description are provided
- Service IS called with the correct description argument when only description is provided
- Service is NOT called for the legacy string API
- All three test scenarios verify correct file content via fixture matching

## Files Modified

- `src/core/commands/spec.ts`: Core implementation
- `src/zamm.ts`: CLI integration with new options
- `src/core/index.ts`: Export AnthropicService for testing
- `src/__tests__/commands/spec.test.ts`: Test coverage with mocks
- Test fixtures: Added `changelog-with-both` and `changelog-with-description` directories
