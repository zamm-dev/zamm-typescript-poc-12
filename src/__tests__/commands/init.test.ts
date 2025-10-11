import * as fs from 'fs';
import * as path from 'path';
import {
  installInitScripts,
  setAnthropicService,
  resetAnthropicService,
  AnthropicService,
} from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  copyTestFile,
} from '../shared/test-utils';

describe('init scripts command', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;
  let mockAnthropicService: jest.Mocked<AnthropicService>;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/init');
    process.chdir(testEnv.tempDir);

    mockAnthropicService = {
      suggestBranchName: jest.fn().mockResolvedValue('branch'),
      suggestAlternativeBranchName: jest.fn().mockResolvedValue('alt-branch'),
      suggestSpecTitle: jest.fn().mockResolvedValue('title'),
      generateWorktreeSetupCommands: jest
        .fn()
        .mockResolvedValue('npm install\nnpm run lint'),
      generateWorktreeBuildCommands: jest
        .fn()
        .mockResolvedValue('npm run build'),
    };

    setAnthropicService(mockAnthropicService);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
    resetAnthropicService();
  });

  function copyImplementationFixture(): string {
    return copyTestFile(testEnv, 'docs/impls/sample-impl.md');
  }

  it('installs scripts and replaces placeholders using implementation ID resolution', async () => {
    copyImplementationFixture();

    const result = await installInitScripts({ implIdOrPath: 'IMPL900' });

    const startScriptPath = path.join(testEnv.tempDir, 'dev/start-worktree.sh');
    const endScriptPath = path.join(testEnv.tempDir, 'dev/end-worktree.sh');
    const implementSpecPath = path.join(
      testEnv.tempDir,
      '.claude/commands/implement-spec.md'
    );
    const guidelinesPath = path.join(
      testEnv.tempDir,
      '.claude/software-dev-guidelines.md'
    );

    expect(fs.existsSync(startScriptPath)).toBe(true);
    expect(fs.existsSync(endScriptPath)).toBe(true);
    expect(fs.existsSync(implementSpecPath)).toBe(true);
    expect(fs.existsSync(guidelinesPath)).toBe(true);

    const startScript = fs.readFileSync(startScriptPath, 'utf8');
    expect(startScript).toContain('##### Setup worktree environment');
    expect(startScript).toContain('npm install');
    expect(startScript).toContain('npm run lint');
    expect(startScript).not.toContain('{{WORKTREE_SETUP_COMMANDS}}');

    const startMode = fs.statSync(startScriptPath).mode;
    const endMode = fs.statSync(endScriptPath).mode;
    expect(startMode & 0o111).not.toBe(0);
    expect(endMode & 0o111).not.toBe(0);

    const implementCommand = fs.readFileSync(implementSpecPath, 'utf8');
    expect(implementCommand).toContain('@docs/impls/sample-impl.md');
    expect(implementCommand).not.toContain('{{IMPL_PATH}}');

    const guidelines = fs.readFileSync(guidelinesPath, 'utf8');
    expect(guidelines).toContain('# Software Development Guidelines');
    expect(guidelines).toContain('## Architecture and Code Quality');

    expect(
      mockAnthropicService.generateWorktreeSetupCommands
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAnthropicService.generateWorktreeBuildCommands
    ).toHaveBeenCalledTimes(1);

    expect(fs.realpathSync(result.devDir)).toBe(
      fs.realpathSync(path.join(testEnv.tempDir, 'dev'))
    );
    expect(fs.realpathSync(result.claudeCommandsDir)).toBe(
      fs.realpathSync(path.join(testEnv.tempDir, '.claude/commands'))
    );

    const endScript = fs.readFileSync(endScriptPath, 'utf8');
    expect(endScript).toContain('npm run build');
    expect(endScript).not.toContain('{{WORKTREE_BUILD_COMMANDS}}');
  });

  it('falls back to default comment when no setup commands provided', async () => {
    copyImplementationFixture();
    mockAnthropicService.generateWorktreeSetupCommands.mockResolvedValueOnce(
      '   '
    );
    mockAnthropicService.generateWorktreeBuildCommands.mockResolvedValueOnce(
      '  '
    );

    await installInitScripts({ implIdOrPath: 'docs/impls/sample-impl.md' });

    const startScriptPath = path.join(testEnv.tempDir, 'dev/start-worktree.sh');
    const startScript = fs.readFileSync(startScriptPath, 'utf8');
    expect(startScript).toContain(
      '# No implementation-specific setup required'
    );
    expect(startScript).not.toContain('{{WORKTREE_SETUP_COMMANDS}}');

    const endScriptPath = path.join(testEnv.tempDir, 'dev/end-worktree.sh');
    const endScript = fs.readFileSync(endScriptPath, 'utf8');
    expect(endScript).toContain(
      '# No implementation-specific post-worktree steps required'
    );
    expect(endScript).not.toContain('{{WORKTREE_BUILD_COMMANDS}}');
  });

  it('throws when implementation file lies outside docs directory', async () => {
    const implPath = copyImplementationFixture();
    const outsidePath = path.join(testEnv.tempDir, 'impl-outside.md');
    const content = fs.readFileSync(implPath, 'utf8');
    fs.writeFileSync(outsidePath, content, 'utf8');

    await expect(
      installInitScripts({ implIdOrPath: outsidePath })
    ).rejects.toThrow(
      'Implementation file must reside within the docs directory'
    );
  });
});
