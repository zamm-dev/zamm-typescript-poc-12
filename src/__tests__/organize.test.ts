import * as fs from 'fs';
import * as path from 'path';
import {
  setIdProvider,
  resetIdProvider,
  organizeFile,
  organizeAllFiles,
} from '../core';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  createTestFileFromFixture,
  expectFileMatchesFixture,
} from './test-utils';

class MockIdProvider {
  constructor(private ids: string[]) {}
  private index = 0;
  generateId(): string {
    return this.ids[this.index++] || 'DEFAULT123';
  }
}

describe('ZAMM CLI Organize Command', () => {
  let testEnv: TestEnvironment;

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/organize');
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
  });

  function createTestFile(relativePath: string, fixtureName: string): string {
    return createTestFileFromFixture(testEnv, relativePath, fixtureName);
  }

  function runOrganizeCommand(filePath: string): void {
    organizeFile(filePath);
  }

  function expectFileMatchesExpected(
    filePath: string,
    expectedFixtureName: string
  ): void {
    expectFileMatchesFixture(testEnv, filePath, expectedFixtureName);
  }

  describe('Organize Spec', () => {
    it('should add spec frontmatter to regular docs file', () => {
      setIdProvider(new MockIdProvider(['ABC123']));
      const filePath = createTestFile('docs/foo.md', 'spec-before.md');
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'spec-after.md');
    });
  });

  describe('Organize Project', () => {
    it('should add project frontmatter to root docs README', () => {
      setIdProvider(new MockIdProvider(['DEF456']));
      const filePath = createTestFile('docs/README.md', 'project-before.md');
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'project-after.md');
    });
  });

  describe('Organize Implementation', () => {
    it('should add implementation frontmatter to docs/impls file', () => {
      setIdProvider(new MockIdProvider(['GHI789']));
      const filePath = createTestFile(
        'docs/impls/nodejs.md',
        'implementation-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'implementation-after.md');
    });
  });

  describe('Organize Implementation Note', () => {
    it('should add implementation-note frontmatter to impl-history file', () => {
      setIdProvider(new MockIdProvider(['JKL012']));
      const filePath = createTestFile(
        'docs/impl-history/setup-notes.md',
        'implementation-note-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'implementation-note-after.md');
    });
  });

  describe('Organize Test', () => {
    it('should add test frontmatter to tests file', () => {
      setIdProvider(new MockIdProvider(['MNO345']));
      const filePath = createTestFile(
        'docs/tests/unit-tests.md',
        'test-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'test-after.md');
    });
  });

  describe('Organize All Files', () => {
    it('should organize all markdown files under docs/', () => {
      const fileIds = ['DEF456', 'JKL012', 'GHI789', 'ABC123', 'MNO345'];
      setIdProvider(new MockIdProvider(fileIds));

      createTestFile('docs/README.md', 'project-before.md');
      createTestFile('docs/spec.md', 'spec-before.md');
      createTestFile('docs/impls/nodejs.md', 'implementation-before.md');
      createTestFile(
        'docs/impl-history/notes.md',
        'implementation-note-before.md'
      );
      createTestFile('docs/tests/unit.md', 'test-before.md');

      organizeAllFiles();

      expectFileMatchesExpected(
        path.join(testEnv.tempDir, 'docs/README.md'),
        'project-after.md'
      );
      expectFileMatchesExpected(
        path.join(testEnv.tempDir, 'docs/spec.md'),
        'spec-after.md'
      );
      expectFileMatchesExpected(
        path.join(testEnv.tempDir, 'docs/impls/nodejs.md'),
        'implementation-after.md'
      );
      expectFileMatchesExpected(
        path.join(testEnv.tempDir, 'docs/impl-history/notes.md'),
        'implementation-note-after.md'
      );
      expectFileMatchesExpected(
        path.join(testEnv.tempDir, 'docs/tests/unit.md'),
        'test-after.md'
      );
    });

    it('should handle empty docs directory gracefully', () => {
      fs.mkdirSync(path.join(testEnv.tempDir, 'docs'), { recursive: true });

      expect(() => organizeAllFiles()).not.toThrow();
    });

    it('should error when docs directory does not exist', () => {
      fs.rmSync(path.join(testEnv.tempDir, 'docs'), {
        recursive: true,
        force: true,
      });

      expect(() => organizeAllFiles()).toThrow('docs/ directory not found');
    });
  });

  describe('Error handling', () => {
    it('should error when file does not exist', () => {
      expect(() => runOrganizeCommand('nonexistent.md')).toThrow();
    });

    it('should preserve existing frontmatter id', () => {
      const filePath = createTestFile(
        'docs/example.md',
        'existing-frontmatter-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'existing-frontmatter-after.md');
    });
  });
});
