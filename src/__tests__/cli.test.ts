import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import {
  setIdProvider,
  resetIdProvider,
  organizeFile,
  organizeAllFiles,
} from '../organizer';

class MockIdProvider {
  constructor(private ids: string[]) {}
  private index = 0;
  generateId(): string {
    return this.ids[this.index++] || 'DEFAULT123';
  }
}

describe('ZAMM CLI Organize Command', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zamm-test-'));
    process.chdir(tempDir);

    execSync('git init', { stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    resetIdProvider();
  });

  function loadFixture(name: string): string {
    const fixturePath = path.resolve(
      originalCwd,
      'src/__tests__/fixtures/organize',
      name
    );
    return fs.readFileSync(fixturePath, 'utf8');
  }

  function createTestFileFromFixture(
    relativePath: string,
    fixtureName: string
  ): string {
    const content = loadFixture(fixtureName);
    const fullPath = path.join(tempDir, relativePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content);
    return fullPath;
  }

  function runOrganizeCommand(filePath: string): void {
    organizeFile(filePath);
  }

  function expectFileMatchesExpected(
    filePath: string,
    expectedFixtureName: string
  ): void {
    const result = fs.readFileSync(filePath, 'utf8');
    const expected = loadFixture(expectedFixtureName);
    expect(result).toBe(expected);
  }

  describe('Organize Spec', () => {
    it('should add spec frontmatter to regular docs file', () => {
      setIdProvider(new MockIdProvider(['ABC123']));
      const filePath = createTestFileFromFixture(
        'docs/foo.md',
        'spec-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'spec-after.md');
    });
  });

  describe('Organize Project', () => {
    it('should add project frontmatter to root docs README', () => {
      setIdProvider(new MockIdProvider(['DEF456']));
      const filePath = createTestFileFromFixture(
        'docs/README.md',
        'project-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'project-after.md');
    });
  });

  describe('Organize Implementation', () => {
    it('should add implementation frontmatter to docs/impls file', () => {
      setIdProvider(new MockIdProvider(['GHI789']));
      const filePath = createTestFileFromFixture(
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
      const filePath = createTestFileFromFixture(
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
      const filePath = createTestFileFromFixture(
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

      createTestFileFromFixture('docs/README.md', 'project-before.md');
      createTestFileFromFixture('docs/spec.md', 'spec-before.md');
      createTestFileFromFixture(
        'docs/impls/nodejs.md',
        'implementation-before.md'
      );
      createTestFileFromFixture(
        'docs/impl-history/notes.md',
        'implementation-note-before.md'
      );
      createTestFileFromFixture('docs/tests/unit.md', 'test-before.md');

      organizeAllFiles();

      expectFileMatchesExpected(
        path.join(tempDir, 'docs/README.md'),
        'project-after.md'
      );
      expectFileMatchesExpected(
        path.join(tempDir, 'docs/spec.md'),
        'spec-after.md'
      );
      expectFileMatchesExpected(
        path.join(tempDir, 'docs/impls/nodejs.md'),
        'implementation-after.md'
      );
      expectFileMatchesExpected(
        path.join(tempDir, 'docs/impl-history/notes.md'),
        'implementation-note-after.md'
      );
      expectFileMatchesExpected(
        path.join(tempDir, 'docs/tests/unit.md'),
        'test-after.md'
      );
    });

    it('should handle empty docs directory gracefully', () => {
      fs.mkdirSync(path.join(tempDir, 'docs'), { recursive: true });

      expect(() => organizeAllFiles()).not.toThrow();
    });

    it('should error when docs directory does not exist', () => {
      fs.rmSync(path.join(tempDir, 'docs'), { recursive: true, force: true });

      expect(() => organizeAllFiles()).toThrow('docs/ directory not found');
    });
  });

  describe('Error handling', () => {
    it('should error when file does not exist', () => {
      expect(() => runOrganizeCommand('nonexistent.md')).toThrow();
    });

    it('should preserve existing frontmatter id', () => {
      const filePath = createTestFileFromFixture(
        'docs/example.md',
        'existing-frontmatter-before.md'
      );
      runOrganizeCommand(filePath);

      expectFileMatchesExpected(filePath, 'existing-frontmatter-after.md');
    });
  });
});
