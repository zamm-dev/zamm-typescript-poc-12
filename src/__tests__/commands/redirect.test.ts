import * as fs from 'fs';
import * as path from 'path';
import { setRedirect, RedirectOptions } from '../../core/commands/redirect';
import { BaseWorkflowService } from '../../core/shared/workflow-service';
import { getDocsDirectory } from '../../core/shared/file-utils';
import {
  copyDirectoryFromFixture,
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../shared/test-utils';

describe('redirect command', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures');
    process.chdir(testEnv.tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
  });

  describe('setRedirect', () => {
    it('should set redirect directory and create .zamm/redirect.json', async () => {
      // Set up test fixture
      copyDirectoryFromFixture(testEnv, 'redirect/before');

      const customDocsDir = path.join(testEnv.tempDir, 'custom-docs');
      fs.mkdirSync(customDocsDir, { recursive: true });

      const options: RedirectOptions = {
        directory: customDocsDir,
      };

      await setRedirect(options);

      // Check that redirect.json was created
      const redirectPath = path.join(testEnv.tempDir, '.zamm', 'redirect.json');
      expect(fs.existsSync(redirectPath)).toBe(true);

      // Check that redirect directory is stored correctly
      const redirectConfig = JSON.parse(
        fs.readFileSync(redirectPath, 'utf-8')
      ) as {
        directory: string;
      };
      expect(redirectConfig.directory).toBe(path.resolve(customDocsDir));
    });

    it('should resolve relative paths to absolute paths', async () => {
      const relativeDir = 'my-docs';
      const customDocsDir = path.join(testEnv.tempDir, relativeDir);
      fs.mkdirSync(customDocsDir, { recursive: true });

      const options: RedirectOptions = {
        directory: relativeDir,
      };

      await setRedirect(options);

      const redirectPath = path.join(testEnv.tempDir, '.zamm', 'redirect.json');
      const redirectConfig = JSON.parse(
        fs.readFileSync(redirectPath, 'utf-8')
      ) as {
        directory: string;
      };

      // Use realpathSync to normalize both paths for comparison
      expect(fs.realpathSync(redirectConfig.directory)).toBe(
        fs.realpathSync(path.resolve(customDocsDir))
      );
    });

    it('should throw error if directory does not exist', async () => {
      const nonExistentDir = path.join(testEnv.tempDir, 'non-existent');

      const options: RedirectOptions = {
        directory: nonExistentDir,
      };

      await expect(setRedirect(options)).rejects.toThrow(
        `Directory does not exist: ${nonExistentDir}`
      );
    });

    it('should throw error if directory is not accessible', async () => {
      const inaccessibleDir = path.join(testEnv.tempDir, 'inaccessible');
      fs.mkdirSync(inaccessibleDir, { recursive: true });

      // Make directory inaccessible (remove write permissions)
      fs.chmodSync(inaccessibleDir, 0o444);

      const options: RedirectOptions = {
        directory: inaccessibleDir,
      };

      try {
        await expect(setRedirect(options)).rejects.toThrow(
          `Directory is not accessible: ${inaccessibleDir}`
        );
      } finally {
        // Restore permissions for cleanup
        fs.chmodSync(inaccessibleDir, 0o755);
      }
    });

    it('should throw error if not in a git repository', async () => {
      // Create a temporary directory outside the test environment
      const os = await import('os');
      const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zamm-non-git-'));
      const customDocsDir = path.join(nonGitDir, 'docs');
      fs.mkdirSync(customDocsDir, { recursive: true });

      // Change to non-git directory
      const originalCwd = process.cwd();
      process.chdir(nonGitDir);

      try {
        const options: RedirectOptions = {
          directory: customDocsDir,
        };

        await expect(setRedirect(options)).rejects.toThrow(
          'Not in a git repository'
        );
      } finally {
        process.chdir(originalCwd);
        // Clean up the temporary directory
        fs.rmSync(nonGitDir, { recursive: true, force: true });
      }
    });

    it('should create redirect.json independently of existing base-state.json', async () => {
      // First create initial base state with worktrees
      await BaseWorkflowService.initialize(testEnv.tempDir);

      // Create a real worktree path for the test
      const worktreePath = path.join(testEnv.tempDir, 'feature-worktree');
      fs.mkdirSync(worktreePath, { recursive: true });
      await BaseWorkflowService.addWorktree(
        testEnv.tempDir,
        'feature-branch',
        worktreePath
      );

      const customDocsDir = path.join(testEnv.tempDir, 'custom-docs');
      fs.mkdirSync(customDocsDir, { recursive: true });

      const options: RedirectOptions = {
        directory: customDocsDir,
      };

      await setRedirect(options);

      // Check that redirect.json was created
      const redirectPath = path.join(testEnv.tempDir, '.zamm', 'redirect.json');
      const redirectConfig = JSON.parse(
        fs.readFileSync(redirectPath, 'utf-8')
      ) as {
        directory: string;
      };

      expect(redirectConfig.directory).toBe(path.resolve(customDocsDir));

      // Verify base-state.json is unchanged and still has worktrees
      const baseStatePath = path.join(
        testEnv.tempDir,
        '.zamm',
        'base-state.json'
      );
      const baseState = JSON.parse(fs.readFileSync(baseStatePath, 'utf-8')) as {
        worktrees: Record<string, unknown>;
      };

      // Should preserve existing worktrees and not have redirectDirectory
      expect(baseState.worktrees).toHaveProperty('feature-branch');
      expect(baseState).not.toHaveProperty('redirectDirectory');
    });
  });

  describe('getDocsDirectory integration', () => {
    it('should return default docs directory when no redirect is set', async () => {
      const defaultDocsDir = path.join(testEnv.tempDir, 'docs');
      fs.mkdirSync(defaultDocsDir, { recursive: true });

      const docsDir = await getDocsDirectory();
      // Use realpathSync to normalize both paths for comparison
      expect(fs.realpathSync(docsDir)).toBe(fs.realpathSync(defaultDocsDir));
    });

    it('should return redirect directory when redirect is set', async () => {
      const customDocsDir = path.join(testEnv.tempDir, 'custom-docs');
      fs.mkdirSync(customDocsDir, { recursive: true });

      const options: RedirectOptions = {
        directory: customDocsDir,
      };

      await setRedirect(options);

      const docsDir = await getDocsDirectory();
      expect(docsDir).toBe(path.resolve(customDocsDir));
    });

    it('should throw error if redirect directory becomes inaccessible', async () => {
      const customDocsDir = path.join(testEnv.tempDir, 'custom-docs');
      fs.mkdirSync(customDocsDir, { recursive: true });

      const options: RedirectOptions = {
        directory: customDocsDir,
      };

      await setRedirect(options);

      // Remove the redirect directory
      fs.rmSync(customDocsDir, { recursive: true, force: true });

      await expect(getDocsDirectory()).rejects.toThrow(
        `Redirect directory does not exist: ${path.resolve(customDocsDir)}`
      );
    });

    it('should throw error if no docs directory and no redirect configured', async () => {
      // Ensure no docs directory exists and no redirect is set
      const docsDir = path.join(testEnv.tempDir, 'docs');
      if (fs.existsSync(docsDir)) {
        fs.rmSync(docsDir, { recursive: true, force: true });
      }

      await expect(getDocsDirectory()).rejects.toThrow(
        'docs/ directory not found and no redirect configured'
      );
    });
  });

  describe('integration with other commands', () => {
    it('should allow organizing files in redirected directory', async () => {
      // Set up test fixture with initial docs structure
      copyDirectoryFromFixture(testEnv, 'organize/before');

      const customDocsDir = path.join(testEnv.tempDir, 'my-documentation');

      // Copy docs to custom location
      fs.cpSync(path.join(testEnv.tempDir, 'docs'), customDocsDir, {
        recursive: true,
      });

      // Remove original docs directory
      fs.rmSync(path.join(testEnv.tempDir, 'docs'), {
        recursive: true,
        force: true,
      });

      // Set redirect
      await setRedirect({ directory: customDocsDir });

      // Import and test organize command
      const { organizeAllFiles } = await import('../../core/commands/organize');

      // Should not throw error and should work with redirected directory
      await expect(organizeAllFiles()).resolves.not.toThrow();

      // Verify files were organized in the custom directory
      const testFile = path.join(customDocsDir, 'example.md');
      expect(fs.existsSync(testFile)).toBe(true);

      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toMatch(/^---\nid: /);
    });

    it('should allow info command to work with redirected directory', async () => {
      // Set up test fixture
      copyDirectoryFromFixture(testEnv, 'redirect/before');

      const customDocsDir = path.join(testEnv.tempDir, 'custom-docs');

      // Copy test file to custom location
      fs.cpSync(path.join(testEnv.tempDir, 'docs'), customDocsDir, {
        recursive: true,
      });

      // Set redirect
      await setRedirect({ directory: customDocsDir });

      // Import and test info command
      const { getInfoByIdOrPath } = await import('../../core/commands/info');

      const info = await getInfoByIdOrPath('TEST123');
      expect(info).toBe(
        'ID: TEST123\nType: Specification\nFile Path: custom-docs/test-spec.md'
      );
    });

    it('should verify redirect.json contains correct structure', async () => {
      // Set up test fixture
      copyDirectoryFromFixture(testEnv, 'redirect/before');

      const customDocsDir = path.join(testEnv.tempDir, 'custom-docs');
      fs.cpSync(path.join(testEnv.tempDir, 'docs'), customDocsDir, {
        recursive: true,
      });

      // Set redirect
      await setRedirect({ directory: customDocsDir });

      // Verify the redirect.json structure programmatically
      const redirectPath = path.join(testEnv.tempDir, '.zamm', 'redirect.json');
      expect(fs.existsSync(redirectPath)).toBe(true);

      const redirectConfig = JSON.parse(
        fs.readFileSync(redirectPath, 'utf-8')
      ) as {
        directory: string;
      };
      expect(redirectConfig).toHaveProperty('directory');
      expect(redirectConfig.directory).toBe(path.resolve(customDocsDir));
    });
  });
});
