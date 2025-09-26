---
id: IWO186
type: spec
---

# Prompts for `feat`

This document specifies the exact prompts used by the `feat` command when communicating with the Anthropic API.

## Branch Name Suggestion

For initial branch name suggestions, the prompt should be:

```
Suggest a concise git branch name (lowercase, words separated by hyphens) for this feature description: "{description}". Respond with just the branch name, no explanation. The branch name should be 3 words or less.
```

Where `{description}` is the user's feature description.

## Alternative Branch Name Suggestion

For conflict resolution when a branch name already exists, use a conversational approach with context:

**User message:**

```
Suggest a concise git branch name (lowercase, words separated by hyphens) for this feature description: "{description}". Respond with just the branch name, no explanation. The branch name should be 3 words or less.
```

**Assistant message:**

```
{conflicting_branch_name}
```

**User message:**

```
The branch "{conflicting_branch_name}" already exists. Please suggest a **different** git branch name that's 3 words or less. Remember, it MUST be different from "{conflicting_branch_name}".
```

Where:

- `{description}` is the user's feature description
- `{conflicting_branch_name}` is the previously suggested branch name that conflicts

## Spec Title Suggestion

For generating specification file titles, the prompt should be:

```
Create a concise H1 markdown title for a specification about: "{description}". Respond with just the title text without the # symbol.
```

Where `{description}` is the user's feature description.

## Implementation Notes

- Use `claude-3-haiku-20240307` model for cost efficiency
- Set `max_tokens: 100` as both branch names and titles are short
- The conversational approach for alternatives provides better context to the LLM than a single prompt, leading to more appropriate alternative suggestions
