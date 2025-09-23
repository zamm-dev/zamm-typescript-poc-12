import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  splitFile,
  SplitOptions,
  setIdProvider,
  resetIdProvider,
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

describe('ZAMM CLI Split Command', () => {
  let testEnv: TestEnvironment;

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/split');
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
  });

  function runSplitCommand(options: SplitOptions): void {
    splitFile(options);
  }

  describe('Split File', () => {
    it('should split a regular file into a folder with README.md and new file with frontmatter', () => {
      setIdProvider(new MockIdProvider(['DEF456']));
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      const mainFilePath = path.join(testEnv.tempDir, 'docs/specs/features.md');

      runSplitCommand({
        mainFilePath,
        newFileName: 'authentication.md',
      });

      // Check that the original file was moved to a subfolder as README.md
      expectFileMatches(testEnv, 'docs/specs/features/README.md', 'after');

      // Check that the new file was created with proper frontmatter
      expectFileMatches(
        testEnv,
        'docs/specs/features/authentication.md',
        'after'
      );

      // Check that the original file no longer exists
      const originalFilePath = path.join(
        testEnv.tempDir,
        'docs/specs/features.md'
      );
      expect(fs.existsSync(originalFilePath)).toBe(false);
    });

    it('should split an existing README.md file in the same directory with frontmatter', () => {
      setIdProvider(new MockIdProvider(['DEF456']));
      copyDirectoryFromFixture(testEnv, 'before-existing-readme');
      createDeterministicCommits(testEnv.tempDir);

      const mainFilePath = path.join(
        testEnv.tempDir,
        'docs/specs/features/README.md'
      );

      runSplitCommand({
        mainFilePath,
        newFileName: 'authentication.md',
      });

      // Check that the original README.md file remains unchanged
      expectFileMatches(testEnv, 'docs/specs/features/README.md', 'after');

      // Check that the new file was created with proper frontmatter
      expectFileMatches(
        testEnv,
        'docs/specs/features/authentication.md',
        'after'
      );
    });

    it('should automatically append .md extension if not provided', () => {
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      const mainFilePath = path.join(testEnv.tempDir, 'docs/specs/features.md');

      runSplitCommand({
        mainFilePath,
        newFileName: 'authentication', // No .md extension
      });

      // Check that the new file was created with .md extension
      const newFilePath = path.join(
        testEnv.tempDir,
        'docs/specs/features/authentication.md'
      );
      expect(fs.existsSync(newFilePath)).toBe(true);
    });

    it('should error if main file does not exist', () => {
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      const mainFilePath = path.join(
        testEnv.tempDir,
        'docs/specs/nonexistent.md'
      );

      expect(() => {
        runSplitCommand({
          mainFilePath,
          newFileName: 'new-file.md',
        });
      }).toThrow('File not found');
    });

    it('should error if new file already exists (regular file case)', () => {
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      const mainFilePath = path.join(testEnv.tempDir, 'docs/specs/features.md');

      // First split
      runSplitCommand({
        mainFilePath,
        newFileName: 'authentication.md',
      });

      // Try to split again with same new filename
      expect(() => {
        runSplitCommand({
          mainFilePath: path.join(
            testEnv.tempDir,
            'docs/specs/features/README.md'
          ),
          newFileName: 'authentication.md',
        });
      }).toThrow('File already exists');
    });

    it('should error if directory already exists (non-README case)', () => {
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      const mainFilePath = path.join(testEnv.tempDir, 'docs/specs/features.md');

      // Create a directory with the same name that would be created
      const conflictingDirPath = path.join(
        testEnv.tempDir,
        'docs/specs/features'
      );
      fs.mkdirSync(conflictingDirPath, { recursive: true });

      expect(() => {
        runSplitCommand({
          mainFilePath,
          newFileName: 'authentication.md',
        });
      }).toThrow('Directory already exists');
    });

    it('should error if used on reference implementation file', () => {
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      // Create a reference implementation file
      const implHistoryDir = path.join(
        testEnv.tempDir,
        'docs/impl-history/nodejs'
      );
      fs.mkdirSync(implHistoryDir, { recursive: true });
      const refImplFile = path.join(implHistoryDir, 'test-impl.md');
      fs.writeFileSync(refImplFile, '# Test Implementation');

      expect(() => {
        runSplitCommand({
          mainFilePath: refImplFile,
          newFileName: 'new-file.md',
        });
      }).toThrow(
        'Split command does not apply to reference implementation files'
      );
    });

    it('should error if used on spec history file', () => {
      copyDirectoryFromFixture(testEnv, 'before-regular-file');
      createDeterministicCommits(testEnv.tempDir);

      // Create a spec history file
      const specHistoryDir = path.join(
        testEnv.tempDir,
        'docs/spec-history/cli'
      );
      fs.mkdirSync(specHistoryDir, { recursive: true });
      const specHistoryFile = path.join(specHistoryDir, 'test-spec.md');
      fs.writeFileSync(specHistoryFile, '# Test Spec History');

      expect(() => {
        runSplitCommand({
          mainFilePath: specHistoryFile,
          newFileName: 'new-file.md',
        });
      }).toThrow(
        'Split command does not apply to reference implementation files or spec changelog files'
      );
    });

    it('should error if not in a git repository', () => {
      // Create a temporary directory without git initialization
      const originalCwd = process.cwd();
      const tempDirNoGit = fs.mkdtempSync(
        path.join(os.tmpdir(), 'zamm-test-no-git-')
      );

      try {
        process.chdir(tempDirNoGit);

        const mainFilePath = path.join(tempDirNoGit, 'docs/specs/features.md');
        fs.mkdirSync(path.dirname(mainFilePath), { recursive: true });
        fs.writeFileSync(mainFilePath, '# Test file');

        expect(() => {
          runSplitCommand({
            mainFilePath,
            newFileName: 'new-file.md',
          });
        }).toThrow('Not in a git repository');
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(tempDirNoGit, { recursive: true, force: true });
      }
    });
  });
});
