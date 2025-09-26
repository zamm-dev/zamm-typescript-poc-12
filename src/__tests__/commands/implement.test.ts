import * as fs from 'fs';
import * as path from 'path';
import {
  generateImplementationNote,
  recordCommits,
  ImplementOptions,
  setIdProvider,
  resetIdProvider,
  IdProvider,
  getLastNCommits,
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

describe('ZAMM CLI Implement Command', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/implement');
    setIdProvider(new TestIdProvider());
    process.chdir(testEnv.tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
  });

  function createTestFile(filePath: string): string {
    // All source files for tests come from the info fixtures
    // Only the expected output files come from implement fixtures
    const infoEnv = { ...testEnv, fixtureDir: 'src/__tests__/fixtures/info' };
    return copyTestFile(infoEnv, filePath);
  }

  describe('generateImplementationNote', () => {
    it('should create reference implementation for spec and implementation by ID', async () => {
      createTestFile('docs/specs/features/authentication.md');
      createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'IMP002',
      };

      const resultPath = await generateImplementationNote(options);

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

    it('should create reference implementation for spec and implementation by path', async () => {
      const specPath = createTestFile('docs/specs/features/authentication.md');
      const implPath = createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: specPath,
        implIdOrPath: implPath,
      };

      const resultPath = await generateImplementationNote(options);

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

    it('should create impl-history directory if it does not exist', async () => {
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

      await generateImplementationNote(options);

      expect(fs.existsSync(implHistoryDir)).toBe(true);
    });

    it('should work with test file type as spec', async () => {
      const testSpecPath = path.join(
        testEnv.tempDir,
        'docs/specs/cli/tests/info-command.md'
      );
      fs.mkdirSync(path.dirname(testSpecPath), { recursive: true });
      const testContent = fs.readFileSync(
        path.join(__dirname, '../fixtures/implement/test-spec-info-command.md'),
        'utf8'
      );
      fs.writeFileSync(testSpecPath, testContent);

      createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: testSpecPath,
        implIdOrPath: 'IMP002',
      };

      const resultPath = await generateImplementationNote(options);

      expect(fs.existsSync(resultPath)).toBe(true);
      expect(resultPath).toMatch(
        /docs\/impl-history\/python\/cli\/tests\/new-XYZ789-impl\.md$/
      );
    });

    it('should error for non-existent spec ID', async () => {
      createTestFile('docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: 'NOTFOUND',
        implIdOrPath: 'IMP002',
      };

      await expect(generateImplementationNote(options)).rejects.toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for non-existent implementation ID', async () => {
      createTestFile('docs/specs/features/authentication.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'NOTFOUND',
      };

      await expect(generateImplementationNote(options)).rejects.toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for wrong spec file type', async () => {
      createTestFile('docs/impls/python.md');
      const wrongSpecPath = createTestFile('docs/README.md');

      const options: ImplementOptions = {
        specIdOrPath: wrongSpecPath,
        implIdOrPath: 'IMP002',
      };

      await expect(generateImplementationNote(options)).rejects.toThrow(
        "Spec file must be of type 'spec' or 'test', got 'project'"
      );
    });

    it('should error for wrong implementation file type', async () => {
      createTestFile('docs/specs/features/authentication.md');
      const wrongImplPath = createTestFile('docs/README.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: wrongImplPath,
      };

      await expect(generateImplementationNote(options)).rejects.toThrow(
        "Implementation file must be of type 'implementation', got 'project'"
      );
    });

    it('should error when not in git repository', async () => {
      fs.rmSync(path.join(testEnv.tempDir, '.git'), {
        recursive: true,
        force: true,
      });

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'IMP002',
      };

      await expect(generateImplementationNote(options)).rejects.toThrow(
        'Not in a git repository'
      );
    });
  });

  describe('recordCommits', () => {
    function createTestCommits(): string[] {
      createDeterministicCommits(testEnv.tempDir, 3);
      return getLastNCommits(3).map(c => c.sha);
    }

    it('should record commits by ID', async () => {
      createTestFile('docs/specs/features/impl-history/initial-auth.md');
      createTestCommits();

      await recordCommits('NOT123', 2);

      expectFileMatches(
        testEnv,
        'docs/specs/features/impl-history/initial-auth.md',
        'record-commits'
      );
    });

    it('should record commits by file path', async () => {
      const testFile = createTestFile(
        'docs/specs/features/impl-history/initial-auth.md'
      );
      createTestCommits();

      await recordCommits(testFile, 2);

      expectFileMatches(
        testEnv,
        'docs/specs/features/impl-history/initial-auth.md',
        'record-commits'
      );
    });

    it('should prepend new commits to existing commits', async () => {
      const testFile = path.join(
        testEnv.tempDir,
        'docs/specs/features/impl-history/initial-auth.md'
      );
      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      const contentWithCommits = fs.readFileSync(
        path.join(
          __dirname,
          '../fixtures/implement/initial-auth-with-existing-commits.md'
        ),
        'utf8'
      );
      fs.writeFileSync(testFile, contentWithCommits);

      createTestCommits();
      await recordCommits('NOT123', 2);

      expectFileMatches(
        testEnv,
        'docs/specs/features/impl-history/initial-auth.md',
        'record-commits-prepend'
      );
    });

    it('should error for non-existent file ID', async () => {
      // Create the docs directory structure first
      createTestFile('docs/specs/features/impl-history/initial-auth.md');
      createTestCommits();

      await expect(recordCommits('NOTFOUND', 1)).rejects.toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for file without proper frontmatter', async () => {
      const testFile = path.join(testEnv.tempDir, 'no-frontmatter.md');
      fs.writeFileSync(testFile, 'Just some content without frontmatter');
      createTestCommits();

      await expect(recordCommits(testFile, 1)).rejects.toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });

    it('should error when not in git repository', async () => {
      createTestFile('docs/specs/features/impl-history/initial-auth.md');

      fs.rmSync(path.join(testEnv.tempDir, '.git'), {
        recursive: true,
        force: true,
      });

      await expect(recordCommits('NOT123', 1)).rejects.toThrow(
        'Not in a git repository'
      );
    });

    it('should error when attempting to record commits to a spec file', async () => {
      createTestFile('docs/specs/features/authentication.md');
      createTestCommits();

      await expect(recordCommits('XYZ789', 1)).rejects.toThrow(
        'Error: Implementation commits have to be added to implementation files. The file you entered, Spec XYZ789 at docs/specs/features/authentication.md, is a specification file.'
      );
    });

    it('should error when attempting to record commits to an implementation file', async () => {
      createTestFile('docs/impls/python.md');
      createTestCommits();

      await expect(recordCommits('IMP002', 1)).rejects.toThrow(
        'Error: Implementation commits have to be added to implementation files. The file you entered, Impl IMP002 at docs/impls/python.md, is a implementation file.'
      );
    });

    it('should error when attempting to record commits to a project file', async () => {
      createTestFile('docs/README.md');
      createTestCommits();

      await expect(recordCommits('PRJ001', 1)).rejects.toThrow(
        'Error: Implementation commits have to be added to implementation files. The file you entered, Proj PRJ001 at docs/README.md, is a project file.'
      );
    });
  });
});
