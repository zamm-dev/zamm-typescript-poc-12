---
id: GVN809
type: spec
---

# `impl`

The `impl` or `i` command provides subcommands for managing implementation records and creating new reference implementations.

## `impl create`

When given a spec ID/file path and implementation ID/file path as arguments, `impl create` should generate a new reference implementation file in the `docs/impl-history/<implementation>/` directory corresponding to the implementation. For example, if we are to reuse the [Test Spec SOB239](./tests/info-command.md) test data, then running the command

```bash
zamm impl create --spec XYZ789 --for IMP002
```

should generate a new reference implementation at `docs/impl-history/python/features/new-XYZ789-impl.md` with the contents

```md
---
id: NOT123
type: ref-impl
specs:
  - id: XYZ789
    path: /specs/features/authentication.md
impl:
  id: IMP002
  path: /impls/python.md
---

TODO: LLM agent, please put implementation plan details here and rename this file as appropriate.
```

### Optional `--filename` Argument

The `impl create` command accepts an optional `--filename` argument that allows the user to specify a custom filename for the generated reference implementation file. When provided, this filename will be used instead of the default `new-<spec-id>-impl.md` pattern.

For example, this command:

```bash
zamm impl create --spec XYZ789 --for IMP002 --filename custom-implementation.md
```

would generate the reference implementation at `docs/impl-history/python/features/custom-implementation.md` instead.

> [!NOTE]
> When testing `impl create`, you should reuse the test resources defined by [Test Spec SOB239](./tests/info-command.md) instead of creating duplicate test resource files.

## `impl record`

When given the `--last-n-commits <N>` parameter and a positional argument for the implementation ID or file path, `impl record` should add the commit hashes from the last N commits to the specified file's frontmatter under a `commits` field. The commits should be recorded as an array of objects with `sha` and `message` properties.

The command should validate that the target file has `type: ref-impl` in its frontmatter before recording commits. If the file type is not `ref-impl`, the command should exit with an error.

If the `commits` field already exists, the new commits should be prepended to the existing list, maintaining chronological order with the most recent commits first.

The command must also validate that the current directory is within a git repository before attempting to retrieve commit information. If not in a git repository, the command should exit with an appropriate error message.

> [!NOTE]
> For detailed examples and test cases, see [Test Spec KYT921](./tests/implement-command.md).

> [!NOTE]
> The `impl record` command is meant to do almost the exact same thing as the `spec record` command. As such, when editing this spec, consider editing [Spec PWQ070](/docs/specs/cli/spec/README.md) as well.
