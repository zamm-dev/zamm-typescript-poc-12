import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import {
  generateImplementationNote,
  recordCommits,
  ImplementOptions,
  setIdProvider,
  resetIdProvider,
  IdProvider,
} from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  copyTestFile,
} from '../shared/test-utils';

class TestIdProvider implements IdProvider {
  private counter = 0;

  generateId(): string {
    this.counter++;
    return `TST${this.counter.toString().padStart(3, '0')}`;
  }
}

describe('ZAMM CLI Implement Command', () => {
  let testEnv: TestEnvironment;

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/info');
    setIdProvider(new TestIdProvider());
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
  });

  function createTestFile(filePath: string): string {
    return copyTestFile(testEnv, filePath);
  }

  describe('generateImplementationNote', () => {
    it('should create reference implementation for spec and implementation by ID', () => {
      createTestFile('docs/specs/features/authentication.md');
      createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'IMP002',
      };

      const resultPath = generateImplementationNote(options);

      expect(resultPath).toMatch(
        /docs\/impl-history\/python\/features\/new-XYZ789-impl\.md$/
      );
      expect(fs.existsSync(resultPath)).toBe(true);

      const content = fs.readFileSync(resultPath, 'utf8');
      const expectedContent = fs.readFileSync(
        path.join(__dirname, '../fixtures/implement/new-XYZ789-impl.md'),
        'utf8'
      );
      expect(content).toBe(expectedContent);
    });

    it('should create reference implementation for spec and implementation by path', () => {
      const specPath = createTestFile('docs/specs/features/authentication.md');
      const implPath = createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: specPath,
        implIdOrPath: implPath,
      };

      const resultPath = generateImplementationNote(options);

      expect(resultPath).toMatch(
        /docs\/impl-history\/python\/features\/new-XYZ789-impl\.md$/
      );
      expect(fs.existsSync(resultPath)).toBe(true);

      const content = fs.readFileSync(resultPath, 'utf8');
      const expectedContent = fs.readFileSync(
        path.join(__dirname, '../fixtures/implement/new-XYZ789-impl.md'),
        'utf8'
      );
      expect(content).toBe(expectedContent);
    });

    it('should create impl-history directory if it does not exist', () => {
      createTestFile('docs/specs/features/authentication.md');
      createTestFile('docs/impls/python.md');

      const implHistoryDir = path.join(
        testEnv.tempDir,
        'docs/impl-history/python/features'
      );
      expect(fs.existsSync(implHistoryDir)).toBe(false);

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'IMP002',
      };

      generateImplementationNote(options);

      expect(fs.existsSync(implHistoryDir)).toBe(true);
    });

    it('should work with test file type as spec', () => {
      // Create a test file in the fixtures and use it
      const content = fs.readFileSync(
        path.join(
          __dirname,
          '../fixtures/info/docs/specs/features/authentication.md'
        ),
        'utf8'
      );
      // Change the content to make it a test type and place in cli/tests directory
      const updatedContent = content.replace('type: spec', 'type: test');
      const testSpecPath = path.join(
        testEnv.tempDir,
        'docs/specs/cli/tests/info-command.md'
      );
      fs.mkdirSync(path.dirname(testSpecPath), { recursive: true });
      fs.writeFileSync(testSpecPath, updatedContent);

      createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: testSpecPath,
        implIdOrPath: 'IMP002',
      };

      const resultPath = generateImplementationNote(options);

      expect(fs.existsSync(resultPath)).toBe(true);
      expect(resultPath).toMatch(
        /docs\/impl-history\/python\/cli\/tests\/new-XYZ789-impl\.md$/
      );
    });

    it('should error for non-existent spec ID', () => {
      createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: 'NOTFOUND',
        implIdOrPath: 'IMP002',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for non-existent implementation ID', () => {
      createTestFile('docs/specs/features/authentication.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'NOTFOUND',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for wrong spec file type', () => {
      createTestFile('docs/impls/python.md');
      const wrongSpecPath = createTestFile('docs/README.md');

      const options: ImplementOptions = {
        specIdOrPath: wrongSpecPath,
        implIdOrPath: 'IMP002',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        "Spec file must be of type 'spec' or 'test', got 'project'"
      );
    });

    it('should error for wrong implementation file type', () => {
      createTestFile('docs/specs/features/authentication.md');
      const wrongImplPath = createTestFile('docs/README.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: wrongImplPath,
      };

      expect(() => generateImplementationNote(options)).toThrow(
        "Implementation file must be of type 'implementation', got 'project'"
      );
    });

    it('should error when not in git repository', () => {
      fs.rmSync(path.join(testEnv.tempDir, '.git'), {
        recursive: true,
        force: true,
      });

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'IMP002',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        'Not in a git repository'
      );
    });
  });

  describe('recordCommits', () => {
    function createTestCommits(): string[] {
      // Create test commits with deterministic metadata
      const commitShas: string[] = [];

      // Set git config for deterministic commits
      execSync('git config user.name "Test User"', {
        cwd: testEnv.tempDir,
      });
      execSync('git config user.email "test@example.com"', {
        cwd: testEnv.tempDir,
      });

      for (let i = 1; i <= 3; i++) {
        const testFile = path.join(testEnv.tempDir, `test${i}.txt`);
        fs.writeFileSync(testFile, `Test commit ${i}`);
        execSync(`git add test${i}.txt`, { cwd: testEnv.tempDir });

        // Set commit date for deterministic hashes
        const commitDate = `2024-01-0${i} 12:00:00`;
        execSync(
          `GIT_COMMITTER_DATE="${commitDate}" GIT_AUTHOR_DATE="${commitDate}" git commit -m "Test commit ${i}"`,
          { cwd: testEnv.tempDir }
        );

        const sha = execSync('git rev-parse HEAD', {
          cwd: testEnv.tempDir,
          encoding: 'utf8',
        }).trim();
        commitShas.push(sha);
      }

      return commitShas.reverse(); // Return most recent first
    }

    it('should record commits by ID', () => {
      const testFile = createTestFile(
        'docs/specs/features/impl-history/initial-auth.md'
      );
      const commitShas = createTestCommits();

      recordCommits('NOT123', 2);

      const content = fs.readFileSync(testFile, 'utf8');
      expect(content).toContain('commits:');
      expect(content).toContain(`- sha: ${commitShas[0]}`);
      expect(content).toContain(`- sha: ${commitShas[1]}`);
      expect(content).not.toContain(`- sha: ${commitShas[2]}`);
    });

    it('should record commits by file path', () => {
      const testFile = createTestFile(
        'docs/specs/features/impl-history/initial-auth.md'
      );
      const commitShas = createTestCommits();

      recordCommits(testFile, 1);

      const content = fs.readFileSync(testFile, 'utf8');
      expect(content).toContain('commits:');
      expect(content).toContain(`- sha: ${commitShas[0]}`);
      expect(content).not.toContain(`- sha: ${commitShas[1]}`);
    });

    it('should prepend new commits to existing commits', () => {
      const testFile = createTestFile(
        'docs/specs/features/impl-history/initial-auth.md'
      );

      // First, add existing commits manually
      let content = fs.readFileSync(testFile, 'utf8');
      const existingCommit = 'existing123abc';
      content = content.replace(
        'impl:\n  id: IMP002\n  path: /docs/impls/python.md',
        `impl:\n  id: IMP002\n  path: /docs/impls/python.md\ncommits:\n  - sha: ${existingCommit}`
      );
      fs.writeFileSync(testFile, content);

      const commitShas = createTestCommits();
      recordCommits('NOT123', 2);

      const updatedContent = fs.readFileSync(testFile, 'utf8');
      expect(updatedContent).toContain('commits:');

      // New commits should come first
      const commitLines = updatedContent
        .split('\n')
        .filter(line => line.includes('- sha:'));
      expect(commitLines[0]).toContain(commitShas[0]);
      expect(commitLines[1]).toContain(commitShas[1]);
      expect(commitLines[2]).toContain(existingCommit);
    });

    it('should error for non-existent file ID', () => {
      // Create the docs directory structure first
      createTestFile('docs/specs/features/impl-history/initial-auth.md');
      createTestCommits();

      expect(() => recordCommits('NOTFOUND', 1)).toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for file without proper frontmatter', () => {
      const testFile = path.join(testEnv.tempDir, 'no-frontmatter.md');
      fs.writeFileSync(testFile, 'Just some content without frontmatter');
      createTestCommits();

      expect(() => recordCommits(testFile, 1)).toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });

    it('should error when not in git repository', () => {
      createTestFile('docs/specs/features/impl-history/initial-auth.md');

      fs.rmSync(path.join(testEnv.tempDir, '.git'), {
        recursive: true,
        force: true,
      });

      expect(() => recordCommits('NOT123', 1)).toThrow(
        'Not in a git repository'
      );
    });
  });
});
