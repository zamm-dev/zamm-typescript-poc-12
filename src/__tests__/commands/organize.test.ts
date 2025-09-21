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

  function runOrganizeCommand(filePath: string): void {
    organizeFile(filePath);
  }

  describe('Organize Spec', () => {
    it('should add spec frontmatter to regular docs file', () => {
      setIdProvider(new MockIdProvider(['ABC123']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/specs/spec.md');
      runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/specs/spec.md', 'after');
    });
  });

  describe('Organize Project', () => {
    it('should add project frontmatter to root docs README', () => {
      setIdProvider(new MockIdProvider(['DEF456']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/README.md');
      runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/README.md', 'after');
    });
  });

  describe('Organize Implementation', () => {
    it('should add implementation frontmatter to docs/impls file', () => {
      setIdProvider(new MockIdProvider(['GHI789']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/impls/nodejs.md');
      runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/impls/nodejs.md', 'after');
    });
  });

  describe('Organize Reference Implementation', () => {
    it('should add ref-impl frontmatter to impl-history file', () => {
      setIdProvider(new MockIdProvider(['JKL012']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/impl-history/notes.md');
      runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/impl-history/notes.md', 'after');
    });
  });

  describe('Organize Test', () => {
    it('should add test frontmatter to tests file', () => {
      setIdProvider(new MockIdProvider(['MNO345']));
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/tests/unit.md');
      runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/tests/unit.md', 'after');
    });
  });

  describe('Organize All Files', () => {
    it('should organize all markdown files under docs/', () => {
      const fileIds = ['DEF456', 'JKL012', 'GHI789', 'ABC123', 'MNO345'];
      setIdProvider(new MockIdProvider(fileIds));

      copyDirectoryFromFixture(testEnv, 'before');

      organizeAllFiles();

      expectFileMatches(testEnv, 'docs/README.md', 'after');
      expectFileMatches(testEnv, 'docs/specs/spec.md', 'after');
      expectFileMatches(testEnv, 'docs/impls/nodejs.md', 'after');
      expectFileMatches(testEnv, 'docs/impl-history/notes.md', 'after');
      expectFileMatches(testEnv, 'docs/tests/unit.md', 'after');
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
      copyDirectoryFromFixture(testEnv, 'before');
      const filePath = path.join(testEnv.tempDir, 'docs/example.md');
      runOrganizeCommand(filePath);

      expectFileMatches(testEnv, 'docs/example.md', 'after');
    });
  });
});
