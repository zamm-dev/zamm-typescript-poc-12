import * as fs from 'fs';
import * as path from 'path';
import {
  generateImplementationNote,
  ImplementOptions,
  setIdProvider,
  resetIdProvider,
  IdProvider,
} from '../core';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  createTestFileFromFixture,
} from './test-utils';

class TestIdProvider implements IdProvider {
  private counter = 0;

  generateId(): string {
    this.counter++;
    return `TEST${this.counter.toString().padStart(3, '0')}`;
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

  function createTestFile(relativePath: string, fixtureName: string): string {
    return createTestFileFromFixture(testEnv, relativePath, fixtureName);
  }

  describe('generateImplementationNote', () => {
    it('should create implementation note for spec and implementation by ID', () => {
      createTestFile(
        'docs/specs/features/authentication.md',
        'docs/specs/features/authentication.md'
      );
      createTestFile('docs/impls/python.md', 'docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'IMP002',
      };

      const resultPath = generateImplementationNote(options);

      expect(resultPath).toMatch(
        /docs\/specs\/features\/impl-history\/new-XYZ789-impl\.md$/
      );
      expect(fs.existsSync(resultPath)).toBe(true);

      const content = fs.readFileSync(resultPath, 'utf8');
      expect(content).toContain('id: TEST001');
      expect(content).toContain('type: implementation-note');
      expect(content).toContain('specs:');
      expect(content).toContain('- id: XYZ789');
      expect(content).toContain('path: /docs/specs/features/authentication.md');
      expect(content).toContain('impl:');
      expect(content).toContain('id: IMP002');
      expect(content).toContain('path: /docs/impls/python.md');
      expect(content).toContain(
        'TODO: LLM agent, please put implementation plan details here'
      );
    });

    it('should create implementation note for spec and implementation by path', () => {
      const specPath = createTestFile(
        'docs/specs/features/authentication.md',
        'docs/specs/features/authentication.md'
      );
      const implPath = createTestFile(
        'docs/impls/python.md',
        'docs/impls/python.md'
      );

      const options: ImplementOptions = {
        specIdOrPath: specPath,
        implIdOrPath: implPath,
      };

      const resultPath = generateImplementationNote(options);

      expect(resultPath).toMatch(
        /docs\/specs\/features\/impl-history\/new-XYZ789-impl\.md$/
      );
      expect(fs.existsSync(resultPath)).toBe(true);

      const content = fs.readFileSync(resultPath, 'utf8');
      expect(content).toContain('id: TEST001');
      expect(content).toContain('type: implementation-note');
    });

    it('should create impl-history directory if it does not exist', () => {
      createTestFile(
        'docs/specs/features/authentication.md',
        'docs/specs/features/authentication.md'
      );
      createTestFile('docs/impls/python.md', 'docs/impls/python.md');

      const implHistoryDir = path.join(
        testEnv.tempDir,
        'docs/specs/features/impl-history'
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
      const testSpecPath = createTestFile(
        'docs/specs/cli/tests/info-command.md',
        'docs/specs/features/authentication.md'
      );
      // Change the content to make it a test type
      const content = fs.readFileSync(testSpecPath, 'utf8');
      const updatedContent = content.replace('type: spec', 'type: test');
      fs.writeFileSync(testSpecPath, updatedContent);

      createTestFile('docs/impls/python.md', 'docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: testSpecPath,
        implIdOrPath: 'IMP002',
      };

      const resultPath = generateImplementationNote(options);

      expect(fs.existsSync(resultPath)).toBe(true);
      expect(resultPath).toMatch(
        /docs\/specs\/cli\/tests\/impl-history\/new-XYZ789-impl\.md$/
      );
    });

    it('should error for non-existent spec ID', () => {
      createTestFile('docs/impls/python.md', 'docs/impls/python.md');

      const options: ImplementOptions = {
        specIdOrPath: 'NOTFOUND',
        implIdOrPath: 'IMP002',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for non-existent implementation ID', () => {
      createTestFile(
        'docs/specs/features/authentication.md',
        'docs/specs/features/authentication.md'
      );

      const options: ImplementOptions = {
        specIdOrPath: 'XYZ789',
        implIdOrPath: 'NOTFOUND',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for wrong spec file type', () => {
      createTestFile('docs/impls/python.md', 'docs/impls/python.md');
      const wrongSpecPath = createTestFile('docs/README.md', 'docs/README.md');

      const options: ImplementOptions = {
        specIdOrPath: wrongSpecPath,
        implIdOrPath: 'IMP002',
      };

      expect(() => generateImplementationNote(options)).toThrow(
        "Spec file must be of type 'spec' or 'test', got 'project'"
      );
    });

    it('should error for wrong implementation file type', () => {
      createTestFile(
        'docs/specs/features/authentication.md',
        'docs/specs/features/authentication.md'
      );
      const wrongImplPath = createTestFile('docs/README.md', 'docs/README.md');

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
});
