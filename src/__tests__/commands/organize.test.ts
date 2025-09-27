import * as fs from 'fs';
import * as path from 'path';
import {
  setIdProvider,
  resetIdProvider,
  organizeFile,
  organizeAllFiles,
} from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  copyDirectoryFromFixture,
  expectFileMatches,
} from '../shared/test-utils';
import { createDeterministicCommits } from '../shared/git-test-utils';

class MockIdProvider {
  constructor(private ids: string[]) {}
  private index = 0;
  generateId(): string {
    return this.ids[this.index++] || 'DEFAULT123';
  }
}

describe('ZAMM CLI Organize Command', () => {
  let testEnv: TestEnvironment;
  let originalConsoleWarn: typeof console.warn;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/organize');
    process.chdir(testEnv.tempDir);
    // Suppress console warnings during tests
    originalConsoleWarn = console.warn;
    console.warn = jest.fn();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  async function runOrganizeCommand(filePath: string): Promise<void> {
    await organizeFile(filePath);
  }

  describe('Organize Spec', () => {
    it('should add spec frontmatter to regular docs file', async () => {
      setIdProvider(new MockIdProvider(['ABC123']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/specs/spec.md');
      await runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/specs/spec.md', 'after');
    });
  });

  describe('Organize Project', () => {
    it('should add project frontmatter to root docs README', async () => {
      setIdProvider(new MockIdProvider(['DEF456']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/README.md');
      await runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/README.md', 'after');
    });
  });

  describe('Organize Implementation', () => {
    it('should add implementation frontmatter to docs/impls file', async () => {
      setIdProvider(new MockIdProvider(['GHI789']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/impls/nodejs.md');
      await runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/impls/nodejs.md', 'after');
    });
  });

  describe('Organize Reference Implementation', () => {
    it('should add ref-impl frontmatter to impl-history file', async () => {
      setIdProvider(new MockIdProvider(['JKL012']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/impl-history/notes.md');
      await runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/impl-history/notes.md', 'after');
    });

    it('should update spec and impl paths for ref-impl files', async () => {
      copyDirectoryFromFixture(testEnv, 'before');
      const refImplPath = path.join(
        testEnv.tempDir,
        'docs/impl-history/nodejs/features/test-ref-impl-outdated-paths.md'
      );
      await runOrganizeCommand(refImplPath);

      expectFileMatches(
        testEnv,
        'docs/impl-history/nodejs/features/test-ref-impl-outdated-paths.md',
        'after'
      );
    });

    it('should update commit messages for ref-impl files', async () => {
      copyDirectoryFromFixture(testEnv, 'before');
      // Create the deterministic commits that match our test fixture commit hashes
      createDeterministicCommits(testEnv.tempDir, 3);

      const refImplPath = path.join(
        testEnv.tempDir,
        'docs/impl-history/nodejs/features/test-ref-impl-missing-commit-messages.md'
      );
      await runOrganizeCommand(refImplPath);

      expectFileMatches(
        testEnv,
        'docs/impl-history/nodejs/features/test-ref-impl-missing-commit-messages.md',
        'after'
      );
    });

    it('should remove commit message fields when commits do not exist', async () => {
      copyDirectoryFromFixture(testEnv, 'before');
      const refImplPath = path.join(
        testEnv.tempDir,
        'docs/impl-history/nodejs/features/test-ref-impl-nonexistent-commits.md'
      );
      await runOrganizeCommand(refImplPath);

      expectFileMatches(
        testEnv,
        'docs/impl-history/nodejs/features/test-ref-impl-nonexistent-commits.md',
        'after'
      );
    });

    it('should handle ref-impl files with missing referenced files gracefully', async () => {
      copyDirectoryFromFixture(testEnv, 'before');
      const refImplPath = path.join(
        testEnv.tempDir,
        'docs/impl-history/nodejs/features/test-ref-impl-missing-refs.md'
      );

      // Should not throw, but should warn and preserve existing paths
      await expect(runOrganizeCommand(refImplPath)).resolves.not.toThrow();

      // Check that file still has proper structure but unchanged paths
      expectFileMatches(
        testEnv,
        'docs/impl-history/nodejs/features/test-ref-impl-missing-refs.md',
        'after'
      );
    });
  });

  describe('Organize Test', () => {
    it('should add test frontmatter to tests file', async () => {
      setIdProvider(new MockIdProvider(['MNO345']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/tests/unit.md');
      await runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/tests/unit.md', 'after');
    });
  });

  describe('Organize All Files', () => {
    it('should organize all markdown files under docs/', async () => {
      const fileIds = ['DEF456', 'JKL012', 'GHI789', 'ABC123', 'MNO345'];
      setIdProvider(new MockIdProvider(fileIds));

      copyDirectoryFromFixture(testEnv, 'before');

      await organizeAllFiles();

      expectFileMatches(testEnv, 'docs/README.md', 'after');
      expectFileMatches(testEnv, 'docs/specs/spec.md', 'after');
      expectFileMatches(testEnv, 'docs/impls/nodejs.md', 'after');
      expectFileMatches(testEnv, 'docs/impl-history/notes.md', 'after');
      expectFileMatches(testEnv, 'docs/tests/unit.md', 'after');
    });

    it('should handle empty docs directory gracefully', async () => {
      fs.mkdirSync(path.join(testEnv.tempDir, 'docs'), { recursive: true });

      await expect(organizeAllFiles()).resolves.not.toThrow();
    });

    it('should error when docs directory does not exist', async () => {
      fs.rmSync(path.join(testEnv.tempDir, 'docs'), {
        recursive: true,
        force: true,
      });

      await expect(organizeAllFiles()).rejects.toThrow(
        'docs/ directory not found'
      );
    });
  });

  describe('Error handling', () => {
    it('should error when file does not exist', async () => {
      await expect(runOrganizeCommand('nonexistent.md')).rejects.toThrow();
    });

    it('should preserve existing frontmatter id', async () => {
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/example.md');
      await runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/example.md', 'after');
    });
  });
});
