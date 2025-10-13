---
id: JUW440
type: ref-impl
specs:
  - id: XEY874
    path: /spec-history/zamm-init-scripts.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 0addd4a1d42e41a85bd9b39ef59f16063113e582
    message: Document resources directory
  - sha: 8de969f0bd69a0f8f69d138584e63a35d2a6a497
    message: 'docs: add fixture-safety reminder'
  - sha: 28c0e8f9db0eddafed36f426dbe792a0d67992f1
    message: 'test: add fixtures for worktree command prompts'
  - sha: 38ff8d54f787b2cb929418c62679226cb0ad5e22
    message: 'feat: add init scripts installation command'
---

# Implementation: `zamm init scripts` bootstrapper

## Context

Implement the `zamm init scripts --impl <IMPL>` command so NodeJS users can install ZAMM's dev workflows and Claude command templates into another repository. The command personalises template placeholders, fetches worktree setup/build steps from Claude, and ships template resources inside the compiled CLI.

## Steps Performed

1. **Template bundle** – Added `src/resources/init-scripts/` containing the `dev/` scripts and `.claude/commands/*.md` templates with explicit placeholders (`{{WORKTREE_SETUP_COMMANDS}}`, `{{WORKTREE_BUILD_COMMANDS}}`, `{{IMPL_PATH}}`).
2. **Resource packaging** – Updated the build pipeline to copy resources into `dist/resources/` via `copyfiles`, ensuring the packaged CLI can access templates at runtime.
3. **Command implementation** – Created `installInitScripts` that resolves the implementation document, invokes Anthropic to derive setup/post-worktree commands, replaces placeholders, and writes personalised scripts/Claude files while keeping scripts executable.
4. **CLI wiring** – Registered the `init scripts` subcommand in `src/zamm.ts` with friendly success messaging and standard error handling.
5. **Testing** – Added Jest coverage that mocks `AnthropicService`, validates placeholder substitution, enforces executable permissions, and confirms guard rails (invalid impl, docs redirect support, fallback messaging).

## Key Decisions & Lessons

- **Fixture discipline**: Do not alter shared fixtures (e.g., recorded Anthropic responses) merely to quiet local tests—coordinate before regenerating them.
- **Prompt reuse**: Feed a single implementation fixture into both Anthropic prompts so setup and post-worktree instructions stay consistent and easy to refresh.
- **Executable scripts**: Explicit `chmod` calls are required; relying on default permissions caused flaky behaviour on fresh worktrees.

## Follow-up Ideas

- Add more Claude templates in `src/resources/init-scripts/.claude/commands/` as new workflows appear—the installer already iterates directory contents, so only the bundle needs updates.
