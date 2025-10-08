---
id: IJZ668
type: spec
---

# `feat`

The `feat` command deals with ZAMM behavior during a feature lifecycle.

## Workflow Lifecycle

ZAMM tracks the progression of the current feature workflow through its various stages through the use of a `.zamm/` directory that is entirely Git-ignored via a `.zamm/.gitignore` file:

```gitignore
*
```

There should be a `.zamm/current-workflow-state.json` file that keeps track of the current state of the workflow (`INITIAL`, `SPEC-UPDATED`, `SPEC-IMPLEMENTED`) in a JSON object that looks like this:

```json
{
  "state": "INITIAL"
}
```

## `feat start`

`feat start` takes in an arbitrary number of commandline arguments that will all be concatenated into a single string. It will then perform the following actions:

1. Run `dev/start-worktree.sh` to run the user-defined feature-starting script on that single string.
2. Initialize `.zamm/` structure if it doesn't already exist. Set the current workflow state to be `INITIAL`.

> [!NOTE]
> ZAMM itself assumes the project resides in a single folder, but the user's custom workflow scripts can do fancy things like creating Git worktrees. In such a case, the user's workflow-starting script should emit a `ZAMM_INIT_DIR_OVERRIDE` environment variable on stdout to direct ZAMM to initialize `.zamm/` in a different directory than the original base directory.
