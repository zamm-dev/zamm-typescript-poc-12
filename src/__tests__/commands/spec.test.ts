import * as fs from 'fs';
import * as path from 'path';
import {
  recordSpecCommits,
  setIdProvider,
  resetIdProvider,
  IdProvider,
} from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  copyTestFile,
  expectFileMatches,
} from '../shared/test-utils';
import { createDeterministicCommits } from '../shared/git-test-utils';

class TestIdProvider implements IdProvider {
  private counter = 0;

  generateId(): string {
    this.counter++;
    return `TST${this.counter.toString().padStart(3, '0')}`;
  }
}

describe('ZAMM CLI Spec Command', () => {
  let testEnv: TestEnvironment;

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/spec');
    setIdProvider(new TestIdProvider());
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
  });

  function createTestFile(filePath: string, fixtureSubDir?: string): string {
    // Use info fixtures as base content, unless specific fixture is requested
    if (fixtureSubDir) {
      const sourceEnv = {
        ...testEnv,
        fixtureDir: `src/__tests__/fixtures/spec/${fixtureSubDir}`,
      };
      return copyTestFile(sourceEnv, filePath);
    } else {
      const sourceEnv = {
        ...testEnv,
        fixtureDir: 'src/__tests__/fixtures/info',
      };
      return copyTestFile(sourceEnv, filePath);
    }
  }

  function createTestCommits(): void {
    createDeterministicCommits(testEnv.tempDir, 2);
  }

  describe('recordSpecCommits', () => {
    it('should record commits by ID for spec in spec-history', () => {
      // Create a spec file in spec-history directory
      createTestFile('docs/spec-history/user-authentication.md', 'before');
      createTestCommits();
      recordSpecCommits('XYZ789', 2);
      expectFileMatches(
        testEnv,
        'docs/spec-history/user-authentication.md',
        'after'
      );
    });

    it('should record commits by file path for spec in spec-history', () => {
      const testFile = createTestFile(
        'docs/spec-history/user-authentication.md',
        'before'
      );
      createTestCommits();
      recordSpecCommits(testFile, 2);
      expectFileMatches(
        testEnv,
        'docs/spec-history/user-authentication.md',
        'after'
      );
    });

    it('should prepend new commits to existing commits', () => {
      // Use the existing commit fixture
      createTestFile(
        'docs/spec-history/user-authentication.md',
        'before-with-existing-commits'
      );
      createTestCommits();
      recordSpecCommits('XYZ789', 2);
      expectFileMatches(
        testEnv,
        'docs/spec-history/user-authentication.md',
        'after-with-existing-commits'
      );
    });

    it('should error for non-existent file ID', () => {
      // Create docs directory but no matching file
      createTestFile('docs/spec-history/user-authentication.md', 'before');
      expect(() => recordSpecCommits('NONEXISTENT', 2)).toThrow(
        'No file found matching the given ID or path: NONEXISTENT'
      );
    });

    it('should error for file without proper frontmatter', () => {
      const testFile = path.join(
        testEnv.tempDir,
        'docs/spec-history/broken.md'
      );
      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      fs.writeFileSync(testFile, 'No frontmatter here');

      expect(() => recordSpecCommits(testFile, 2)).toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });

    it('should error when not in git repository', () => {
      // Create a temporary non-git directory
      const originalProjectCwd = testEnv.originalCwd; // Store the project's original working directory
      const nonGitEnv = setupTestEnvironment('src/__tests__/fixtures/spec');
      nonGitEnv.originalCwd = originalProjectCwd; // Fix the originalCwd to point to the project
      try {
        // Remove .git to simulate non-git environment
        const gitDir = path.join(nonGitEnv.tempDir, '.git');
        if (fs.existsSync(gitDir)) {
          fs.rmSync(gitDir, { recursive: true, force: true });
        }
        // Copy a spec file from the before-no-git fixture
        const sourceEnv = {
          ...nonGitEnv,
          fixtureDir: 'src/__tests__/fixtures/spec/before-no-git',
        };
        const testFile = copyTestFile(
          sourceEnv,
          'docs/spec-history/user-authentication.md'
        );
        expect(() => recordSpecCommits(testFile, 2)).toThrow(
          'Not in a git repository'
        );
      } finally {
        cleanupTestEnvironment(nonGitEnv);
      }
    });

    it('should error when attempting to record commits to a non-spec file', () => {
      // Create an implementation file and try to record spec commits to it
      createTestFile('docs/impls/python.md');
      createTestCommits();
      expect(() => recordSpecCommits('IMP002', 2)).toThrow(
        'Error: Spec commits have to be added to spec files. The file you entered, Impl IMP002 at docs/impls/python.md, is a implementation file.'
      );
    });

    it('should error when attempting to record commits to a spec file not in spec-history', () => {
      // Create a regular spec file (not in spec-history) and try to record commits
      createTestFile('docs/specs/features/authentication.md');
      createTestCommits();
      expect(() => recordSpecCommits('XYZ789', 2)).toThrow(
        'Error: Spec commit recording only applies to files in docs/spec-history/. The file you entered, Spec XYZ789 at docs/specs/features/authentication.md, is not in the spec-history directory.'
      );
    });

    it('should error when attempting to record commits to a project file', () => {
      createTestFile('docs/README.md');
      createTestCommits();
      expect(() => recordSpecCommits('PRJ001', 2)).toThrow(
        'Error: Spec commits have to be added to spec files. The file you entered, Proj PRJ001 at docs/README.md, is a project file.'
      );
    });
  });
});
