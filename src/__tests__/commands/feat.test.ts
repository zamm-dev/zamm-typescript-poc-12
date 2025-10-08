import * as fs from 'fs';
import * as path from 'path';
import { featStart, FeatStartOptions } from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  expectFileMatches,
  copyTestFile,
} from '../shared/test-utils';

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
});
