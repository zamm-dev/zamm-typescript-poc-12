import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import {
  featStart,
  FeatStartOptions,
  setIdProvider,
  resetIdProvider,
  IdProvider,
} from '../../core/index';
import {
  TestEnvironment,
  cleanupTestEnvironment,
  expectFileMatches,
} from '../shared/test-utils';
import {
  AnthropicService,
  setAnthropicService,
  resetAnthropicService,
} from '../../core/shared/anthropic-service';

class TestIdProvider implements IdProvider {
  generateId(): string {
    return 'TST123';
  }
}

class MockAnthropicService implements AnthropicService {
  constructor(
    private branchName: string,
    private alternativeBranchName: string,
    private specTitle: string
  ) {}

  async suggestBranchName(_description: string): Promise<string> {
    return Promise.resolve(this.branchName);
  }

  async suggestAlternativeBranchName(
    _description: string,
    _conflictingBranchName: string
  ): Promise<string> {
    return Promise.resolve(this.alternativeBranchName);
  }

  async suggestSpecTitle(_description: string): Promise<string> {
    return Promise.resolve(this.specTitle);
  }
}

describe('ZAMM CLI Feat Command', () => {
  let testEnv: TestEnvironment;
  let testBaseDir: string;

  beforeAll(() => {
    // Create a base directory for all feat tests
    testBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zamm-feat-tests-'));
  });

  afterAll(() => {
    // Clean up the entire test directory
    fs.rmSync(testBaseDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Clean up any leftover directories from previous tests
    const entries = fs.readdirSync(testBaseDir);
    for (const entry of entries) {
      const fullPath = path.join(testBaseDir, entry);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    // Set up test environment within our controlled directory
    const testSubDir = path.join(testBaseDir, 'repo');
    fs.mkdirSync(testSubDir, { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(testSubDir);

    execSync('git init', { stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });

    // Create initial commit so we can create branches
    fs.writeFileSync(path.join(testSubDir, 'README.md'), '# Test Repo');
    execSync('git add README.md', { stdio: 'pipe' });
    execSync('git commit -m "Initial commit"', { stdio: 'pipe' });

    testEnv = {
      tempDir: testSubDir,
      originalCwd,
      fixtureDir: 'src/__tests__/fixtures/feat',
    };

    setIdProvider(new TestIdProvider());
    setAnthropicService(
      new MockAnthropicService(
        'user-authentication',
        'user-authentication-feature',
        'Add User Authentication'
      )
    );
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
    resetAnthropicService();
  });

  describe('featStart', () => {
    it('should create worktree, branch, and spec file successfully', async () => {
      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await featStart(options);

      // Verify worktree directory was created
      const siblingDirs = fs.readdirSync(path.dirname(testEnv.tempDir));
      expect(siblingDirs).toContain('user-authentication');

      // Verify branch was created with zamm/ prefix
      const worktreePath = path.join(
        path.dirname(testEnv.tempDir),
        'user-authentication'
      );
      const branches = execSync('git branch --show-current', {
        stdio: 'pipe',
        cwd: worktreePath,
        encoding: 'utf-8',
      }).trim();
      expect(branches).toBe('zamm/user-authentication');

      // Verify base directory .zamm/.gitignore matches fixture
      expectFileMatches(testEnv, '.zamm/.gitignore');

      // Verify base state content using expectFileMatches with path replacement
      expectFileMatches(testEnv, '.zamm/base-state.json', undefined, {
        [fs.realpathSync(worktreePath)]: '/path/to/worktree',
      });

      // Create a worktree test environment to verify worktree .zamm files
      const worktreeTestEnv = {
        ...testEnv,
        tempDir: worktreePath,
      };

      // Verify spec file was created in the worktree with exact expected content
      expectFileMatches(
        worktreeTestEnv,
        'docs/spec-history/user-authentication.md'
      );

      // Verify worktree .zamm files match fixtures
      expectFileMatches(worktreeTestEnv, '.zamm/.gitignore', 'worktree');
      expectFileMatches(
        worktreeTestEnv,
        '.zamm/current-workflow-state.json',
        'worktree'
      );
    });

    it('should handle branch name conflicts proactively', async () => {
      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      // First, create a branch that will conflict
      execSync('git branch zamm/user-authentication', {
        cwd: testEnv.tempDir,
        stdio: 'pipe',
      });

      await featStart(options);

      // Verify that a different branch name was used (not the original conflicting one)
      const siblingDirs = fs.readdirSync(path.dirname(testEnv.tempDir));
      expect(siblingDirs).toContain('user-authentication-feature');
      expect(siblingDirs).not.toContain('user-authentication');

      // Verify the branch was created with alternative name
      const worktreePath = path.join(
        path.dirname(testEnv.tempDir),
        'user-authentication-feature'
      );
      const branches = execSync('git branch --show-current', {
        stdio: 'pipe',
        cwd: worktreePath,
        encoding: 'utf-8',
      }).trim();
      expect(branches).toBe('zamm/user-authentication-feature');

      // Verify spec file was created in the alternative worktree
      const worktreeTestEnv = {
        ...testEnv,
        tempDir: worktreePath,
      };
      expectFileMatches(
        worktreeTestEnv,
        'docs/spec-history/user-authentication-feature.md',
        'conflict-resolution'
      );
    });
  });
});
