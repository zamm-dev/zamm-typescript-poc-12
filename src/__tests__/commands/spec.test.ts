import * as fs from 'fs';
import * as path from 'path';
import {
  recordSpecCommits,
  createSpecChangelog,
  setIdProvider,
  resetIdProvider,
  IdProvider,
  setAnthropicService,
  resetAnthropicService,
  AnthropicService,
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
  let originalCwd: string;
  let mockAnthropicService: jest.Mocked<AnthropicService>;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/spec');
    process.chdir(testEnv.tempDir);
    setIdProvider(new TestIdProvider());

    // Create mock Anthropic service
    mockAnthropicService = {
      suggestBranchName: jest.fn().mockResolvedValue('test-branch'),
      suggestAlternativeBranchName: jest
        .fn()
        .mockResolvedValue('alternative-branch'),
      suggestSpecTitle: jest
        .fn()
        .mockResolvedValue('Auto-generated Title for Testing'),
    };
    setAnthropicService(mockAnthropicService);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
    resetAnthropicService();
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
    it('should record commits by ID for spec in spec-history', async () => {
      // Create a spec file in spec-history directory
      createTestFile('docs/spec-history/user-authentication.md', 'before');
      createTestCommits();
      await recordSpecCommits('XYZ789', 2);
      expectFileMatches(
        testEnv,
        'docs/spec-history/user-authentication.md',
        'after'
      );
    });

    it('should record commits by file path for spec in spec-history', async () => {
      const testFile = createTestFile(
        'docs/spec-history/user-authentication.md',
        'before'
      );
      createTestCommits();
      await recordSpecCommits(testFile, 2);
      expectFileMatches(
        testEnv,
        'docs/spec-history/user-authentication.md',
        'after'
      );
    });

    it('should prepend new commits to existing commits', async () => {
      // Use the existing commit fixture
      createTestFile(
        'docs/spec-history/user-authentication.md',
        'before-with-existing-commits'
      );
      createTestCommits();
      await recordSpecCommits('XYZ789', 2);
      expectFileMatches(
        testEnv,
        'docs/spec-history/user-authentication.md',
        'after-with-existing-commits'
      );
    });

    it('should error for non-existent file ID', async () => {
      // Create docs directory but no matching file
      createTestFile('docs/spec-history/user-authentication.md', 'before');
      await expect(recordSpecCommits('NONEXISTENT', 2)).rejects.toThrow(
        'No file found matching the given ID or path: NONEXISTENT'
      );
    });

    it('should error for file without proper frontmatter', async () => {
      const testFile = path.join(
        testEnv.tempDir,
        'docs/spec-history/broken.md'
      );
      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      fs.writeFileSync(testFile, 'No frontmatter here');

      await expect(recordSpecCommits(testFile, 2)).rejects.toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });

    it('should error when not in git repository', async () => {
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
        await expect(recordSpecCommits(testFile, 2)).rejects.toThrow(
          'Not in a git repository'
        );
      } finally {
        cleanupTestEnvironment(nonGitEnv);
      }
    });

    it('should error when attempting to record commits to a non-spec file', async () => {
      // Create an implementation file and try to record spec commits to it
      createTestFile('docs/impls/python.md');
      createTestCommits();
      await expect(recordSpecCommits('IMP002', 2)).rejects.toThrow(
        'Error: Spec commits have to be added to spec files. The file you entered, Impl IMP002 at docs/impls/python.md, is a implementation file.'
      );
    });

    it('should error when attempting to record commits to a spec file not in spec-history', async () => {
      // Create a regular spec file (not in spec-history) and try to record commits
      createTestFile('docs/specs/features/authentication.md');
      createTestCommits();
      await expect(recordSpecCommits('XYZ789', 2)).rejects.toThrow(
        'Error: Spec commit recording only applies to files in docs/spec-history/. The file you entered, Spec XYZ789 at docs/specs/features/authentication.md, is not in the spec-history directory.'
      );
    });

    it('should error when attempting to record commits to a project file', async () => {
      createTestFile('docs/README.md');
      createTestCommits();
      await expect(recordSpecCommits('PRJ001', 2)).rejects.toThrow(
        'Error: Spec commits have to be added to spec files. The file you entered, Proj PRJ001 at docs/README.md, is a project file.'
      );
    });
  });

  describe('createSpecChangelog', () => {
    beforeEach(() => {
      // Create basic docs directory structure for changelog tests
      const docsDir = path.join(testEnv.tempDir, 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
    });

    it('should create a new spec changelog file with absolute path', async () => {
      const filepath = 'spec-history/new-feature.md';
      const createdPath = await createSpecChangelog(filepath);

      expect(createdPath).toContain('spec-history/new-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/new-feature.md',
        'changelog-expected'
      );
    });

    it('should create a new spec changelog file with relative path', async () => {
      const filepath = 'new-feature.md';
      const createdPath = await createSpecChangelog(filepath);

      expect(createdPath).toContain('spec-history/new-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/new-feature.md',
        'changelog-expected'
      );
    });

    it('should create nested directories when they do not exist', async () => {
      const filepath = 'nested/deep-feature.md';
      const createdPath = await createSpecChangelog(filepath);

      expect(createdPath).toContain('spec-history/nested/deep-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/nested/deep-feature.md',
        'changelog-expected'
      );
    });

    it('should add .md extension if not present', async () => {
      const filepath = 'new-feature';
      const createdPath = await createSpecChangelog(filepath);

      expect(createdPath).toContain('spec-history/new-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/new-feature.md',
        'changelog-expected'
      );
    });

    it('should error when file already exists', async () => {
      // Copy an existing spec file
      createTestFile(
        'docs/spec-history/existing-spec.md',
        'changelog-existing'
      );

      await expect(createSpecChangelog('existing-spec.md')).rejects.toThrow(
        'File already exists: spec-history/existing-spec.md'
      );
    });

    it('should error when not in git repository', async () => {
      // Create a temporary non-git directory
      const originalProjectCwd = testEnv.originalCwd;
      const nonGitEnv = setupTestEnvironment('src/__tests__/fixtures/spec');
      nonGitEnv.originalCwd = originalProjectCwd;
      try {
        // Remove .git to simulate non-git environment
        const gitDir = path.join(nonGitEnv.tempDir, '.git');
        if (fs.existsSync(gitDir)) {
          fs.rmSync(gitDir, { recursive: true, force: true });
        }

        process.chdir(nonGitEnv.tempDir);
        await expect(createSpecChangelog('new-feature.md')).rejects.toThrow(
          'Not in a git repository'
        );
      } finally {
        cleanupTestEnvironment(nonGitEnv);
        process.chdir(testEnv.tempDir);
      }
    });

    it('should create changelog with both title and description', async () => {
      const filepath = 'new-feature.md';
      const createdPath = await createSpecChangelog({
        filepath,
        title: 'Custom Title',
        description: 'This is a custom description.',
      });

      expect(createdPath).toContain('spec-history/new-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/new-feature.md',
        'changelog-with-both'
      );
      // Should not call Anthropic service when title is provided
      expect(mockAnthropicService.suggestSpecTitle).not.toHaveBeenCalled();
    });

    it('should create changelog with description only and auto-generate title', async () => {
      const filepath = 'new-feature.md';
      const createdPath = await createSpecChangelog({
        filepath,
        description: 'This is a custom description.',
      });

      expect(createdPath).toContain('spec-history/new-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/new-feature.md',
        'changelog-with-description'
      );
      // Should call Anthropic service with the description
      expect(mockAnthropicService.suggestSpecTitle).toHaveBeenCalledWith(
        'This is a custom description.'
      );
      expect(mockAnthropicService.suggestSpecTitle).toHaveBeenCalledTimes(1);
    });

    it('should support legacy string API for backward compatibility', async () => {
      const filepath = 'new-feature.md';
      const createdPath = await createSpecChangelog(filepath);

      expect(createdPath).toContain('spec-history/new-feature.md');
      expectFileMatches(
        testEnv,
        'docs/spec-history/new-feature.md',
        'changelog-expected'
      );
      // Should not call Anthropic service for legacy API
      expect(mockAnthropicService.suggestSpecTitle).not.toHaveBeenCalled();
    });
  });
});
