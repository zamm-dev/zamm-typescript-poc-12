import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { featStart, FeatStartOptions } from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  expectFileMatches,
  copyTestFile,
} from '../shared/test-utils';
import { setupGitConfig } from '../shared/git-test-utils';
import { resetIdProvider, CurrentWorkflowState } from '../../core/index';
import { parseFrontmatter } from '../../core/shared/frontmatter';
import { extractTitleFromMarkdown } from '../../core/shared/file-utils';

describe('ZAMM CLI Feat Command', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;
  let originalScriptEnv: string | undefined;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/feat');
    process.chdir(testEnv.tempDir);
    originalScriptEnv = process.env.ZAMM_FEAT_START_SCRIPT;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);

    if (originalScriptEnv) {
      process.env.ZAMM_FEAT_START_SCRIPT = originalScriptEnv;
    } else {
      delete process.env.ZAMM_FEAT_START_SCRIPT;
    }
    resetIdProvider();
  });

  describe('featStart script wrapper', () => {
    let mockScriptPath: string;

    beforeEach(() => {
      mockScriptPath = copyTestFile(testEnv, 'scripts/mock-start-worktree.sh');
      fs.chmodSync(mockScriptPath, 0o755);
      process.env.ZAMM_FEAT_START_SCRIPT = mockScriptPath;
    });

    afterEach(() => {
      delete process.env.ZAMM_FEAT_START_SCRIPT;
    });

    it('initializes workflow state in the repository root when no override is provided', async () => {
      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await featStart(options);

      const scriptCwd = fs.readFileSync(
        path.join(testEnv.tempDir, '.feat-script-cwd'),
        'utf-8'
      );
      expect(scriptCwd).toBe(fs.realpathSync(testEnv.tempDir));

      const scriptArg = fs.readFileSync(
        path.join(testEnv.tempDir, '.feat-script-arg'),
        'utf-8'
      );
      expect(scriptArg).toBe('Add user authentication');

      expectFileMatches(testEnv, '.zamm/.gitignore');
      expectFileMatches(testEnv, '.zamm/current-workflow-state.json');
    });

    it('initializes workflow state at the override path when provided', async () => {
      const worktreeDir = path.join(testEnv.tempDir, 'override-worktree');
      fs.mkdirSync(worktreeDir, { recursive: true });

      const overrideScriptPath = copyTestFile(
        testEnv,
        'scripts/mock-start-worktree-override.sh'
      );
      fs.chmodSync(overrideScriptPath, 0o755);
      process.env.ZAMM_FEAT_START_SCRIPT = overrideScriptPath;

      const options: FeatStartOptions = {
        description: 'Use override directory',
      };

      await featStart(options);

      const worktreeTestEnv: TestEnvironment = {
        ...testEnv,
        tempDir: worktreeDir,
      };
      expectFileMatches(worktreeTestEnv, '.zamm/.gitignore');
      expectFileMatches(worktreeTestEnv, '.zamm/current-workflow-state.json');
    });

    it('throws when the feature start script is missing', async () => {
      process.env.ZAMM_FEAT_START_SCRIPT = path.join(
        testEnv.tempDir,
        'does-not-exist.sh'
      );

      const options: FeatStartOptions = {
        description: 'Missing script scenario',
      };

      await expect(featStart(options)).rejects.toThrow(
        'Missing feature start script'
      );
    });
  });

  describe('end-to-end test', () => {
    // Only run with explicit opt-in flag, not in CI/hooks
    const testShouldRun = process.env.RUN_E2E_TESTS === 'true';

    (testShouldRun ? it : it.skip)(
      'creates worktree, branch, and spec file with LLM suggestions',
      async () => {
        const projectRoot = path.resolve(__dirname, '../../..');
        const originalPath = process.env.PATH;
        const savedCwd = process.cwd();

        try {
          // Create a parent temp directory that will contain both the main repo and worktree
          const parentTempDir = testEnv.tempDir;
          const mainRepoDir = path.join(parentTempDir, 'main-repo');
          fs.mkdirSync(mainRepoDir, { recursive: true });

          // Set up a real git repository with initial commit
          execSync('git init', { cwd: mainRepoDir });
          setupGitConfig(mainRepoDir);

          // Create docs directory structure
          const docsDir = path.join(mainRepoDir, 'docs');
          const initialSpecHistoryDir = path.join(docsDir, 'spec-history');
          fs.mkdirSync(initialSpecHistoryDir, { recursive: true });

          // Create initial commit on main branch
          fs.writeFileSync(
            path.join(mainRepoDir, 'README.md'),
            '# Test Project\n'
          );
          fs.writeFileSync(
            path.join(docsDir, 'README.md'),
            '# Documentation\n'
          );
          execSync('git add .', { cwd: mainRepoDir });
          execSync('git commit -m "Initial commit"', { cwd: mainRepoDir });

          // Copy the real start-worktree.sh script to the main repo
          const realScriptPath = path.join(
            projectRoot,
            'dev',
            'start-worktree.sh'
          );
          const devDir = path.join(mainRepoDir, 'dev');
          fs.mkdirSync(devDir, { recursive: true });
          const testScriptPath = path.join(devDir, 'start-worktree.sh');
          fs.copyFileSync(realScriptPath, testScriptPath);
          fs.chmodSync(testScriptPath, 0o755);

          // Ensure zamm is in PATH by adding dist directory
          const distDir = path.join(projectRoot, 'dist');
          process.env.PATH = `${distDir}:${originalPath}`;

          // Change to main repo directory before running feat start
          process.chdir(mainRepoDir);

          const options: FeatStartOptions = {
            description: 'Add user authentication',
          };

          // Run the actual feat start command (no script override)
          await featStart(options);

          // Verify worktree was created in sibling directory within parent temp
          const worktrees = fs.readdirSync(parentTempDir).filter(name => {
            const fullPath = path.join(parentTempDir, name);
            return (
              fs.statSync(fullPath).isDirectory() &&
              name !== 'main-repo' &&
              fs.existsSync(path.join(fullPath, '.git'))
            );
          });

          expect(worktrees.length).toBeGreaterThan(0);
          const worktreeDir = worktrees[0];
          if (!worktreeDir) {
            throw new Error('No worktree directory found');
          }
          const worktreePath = path.join(parentTempDir, worktreeDir);

          // Verify workflow state file in worktree
          const workflowStatePath = path.join(
            worktreePath,
            '.zamm',
            'current-workflow-state.json'
          );
          expect(fs.existsSync(workflowStatePath)).toBe(true);
          const workflowState = JSON.parse(
            fs.readFileSync(workflowStatePath, 'utf-8')
          ) as CurrentWorkflowState;
          expect(workflowState).toEqual({ state: 'INITIAL' });

          // Verify new branch starts with zamm/
          const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            cwd: worktreePath,
            encoding: 'utf-8',
          }).trim();
          expect(currentBranch).toMatch(/^zamm\//);

          // Verify spec file was created in spec-history
          const specHistoryDir = path.join(
            worktreePath,
            'docs',
            'spec-history'
          );
          expect(fs.existsSync(specHistoryDir)).toBe(true);

          const specFiles = fs
            .readdirSync(specHistoryDir)
            .filter(name => name.endsWith('.md'));
          expect(specFiles.length).toBe(1);

          const specFileName = specFiles[0];
          if (!specFileName) {
            throw new Error('No spec file found');
          }
          const specFilePath = path.join(specHistoryDir, specFileName);
          const specContent = fs.readFileSync(specFilePath, 'utf-8');

          // Parse and validate frontmatter
          const { frontmatter, body } = parseFrontmatter(specContent);
          expect(frontmatter.id).toBeTruthy();
          expect(frontmatter.id).toMatch(/^[A-Z]{3}\d{3}$/);
          expect(frontmatter.type).toBe('spec');

          // Validate body contains the description
          expect(body).toContain('Add user authentication');

          // Validate title is non-empty
          const title = extractTitleFromMarkdown(specContent);
          expect(title).toBeTruthy();
          expect(title!.length).toBeGreaterThan(0);

          // Clean up worktree to avoid git issues
          execSync(`git worktree remove ${worktreePath} --force`, {
            cwd: mainRepoDir,
          });
        } finally {
          // Always restore environment, even if test fails
          process.chdir(savedCwd);
          process.env.PATH = originalPath;
        }
      },
      30_000 // 30 second timeout for API calls
    );
  });
});
