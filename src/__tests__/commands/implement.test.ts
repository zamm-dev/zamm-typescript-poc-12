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

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/implement');
    setIdProvider(new TestIdProvider());
  });

  afterEach(() => {
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
      createDeterministicCommits(testEnv.tempDir, 3);
      return getLastNCommits(3).map(c => c.sha);
    }

    it('should record commits by ID', () => {
      createTestFile('docs/specs/features/impl-history/initial-auth.md');
      createTestCommits();

      recordCommits('NOT123', 2);

      expectFileMatches(
        testEnv,
        'docs/specs/features/impl-history/initial-auth.md',
        'record-commits'
      );
    });

    it('should record commits by file path', () => {
      const testFile = createTestFile(
        'docs/specs/features/impl-history/initial-auth.md'
      );
      createTestCommits();

      recordCommits(testFile, 2);

      expectFileMatches(
        testEnv,
        'docs/specs/features/impl-history/initial-auth.md',
        'record-commits'
      );
    });

    it('should prepend new commits to existing commits', () => {
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
      recordCommits('NOT123', 2);

      expectFileMatches(
        testEnv,
        'docs/specs/features/impl-history/initial-auth.md',
        'record-commits-prepend'
      );
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

    it('should error when attempting to record commits to a spec file', () => {
      createTestFile('docs/specs/features/authentication.md');
      createTestCommits();

      expect(() => recordCommits('XYZ789', 1)).toThrow(
        'Error: Implementation commits have to be added to implementation files. The file you entered, Spec XYZ789 at docs/specs/features/authentication.md, is a specification file.'
      );
    });

    it('should error when attempting to record commits to an implementation file', () => {
      createTestFile('docs/impls/python.md');
      createTestCommits();

      expect(() => recordCommits('IMP002', 1)).toThrow(
        'Error: Implementation commits have to be added to implementation files. The file you entered, Impl IMP002 at docs/impls/python.md, is a implementation file.'
      );
    });

    it('should error when attempting to record commits to a project file', () => {
      createTestFile('docs/README.md');
      createTestCommits();

      expect(() => recordCommits('PRJ001', 1)).toThrow(
        'Error: Implementation commits have to be added to implementation files. The file you entered, Proj PRJ001 at docs/README.md, is a project file.'
      );
    });
  });
});
