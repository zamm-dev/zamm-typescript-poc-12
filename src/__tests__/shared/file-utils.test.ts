import * as fs from 'fs';
import * as path from 'path';
import {
  extractTitleFromMarkdown,
  resolveTitleFromFile,
} from '../../core/shared/file-utils';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from './test-utils';

describe('File Utils', () => {
  let testEnv: TestEnvironment;

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/file-utils');
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
  });

  describe('extractTitleFromMarkdown', () => {
    it('should extract title from markdown with level 1 heading', () => {
      const content = '# My Title\n\nSome content here.';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBe('My Title');
    });

    it('should extract title with extra whitespace', () => {
      const content = '#   My Title   \n\nSome content here.';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBe('My Title');
    });

    it('should extract first level 1 heading when multiple exist', () => {
      const content =
        '# First Title\n\nSome content.\n\n# Second Title\n\nMore content.';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBe('First Title');
    });

    it('should ignore level 2 and higher headings', () => {
      const content = '## Level 2\n\n### Level 3\n\n# Level 1\n\nContent.';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBe('Level 1');
    });

    it('should return null when no level 1 heading exists', () => {
      const content = '## Level 2 Only\n\nSome content here.';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBeNull();
    });

    it('should return null for empty content', () => {
      const content = '';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBeNull();
    });

    it('should ignore frontmatter and extract title from body', () => {
      const content =
        '---\nid: ABC123\ntype: spec\n---\n\n# My Spec Title\n\nContent here.';
      const title = extractTitleFromMarkdown(content);
      expect(title).toBe('My Spec Title');
    });
  });

  describe('resolveTitleFromFile', () => {
    it('should resolve title from file when title exists', () => {
      const testFile = path.join(testEnv.tempDir, 'test-with-title.md');
      const content = '# Test Document\n\nThis is a test document.';
      fs.writeFileSync(testFile, content);

      const result = resolveTitleFromFile(testFile);
      expect(result).toBe('Test Document');
    });

    it('should fallback to file path when no title exists', () => {
      const testFile = path.join(testEnv.tempDir, 'test-no-title.md');
      const content = '## Only Level 2 Heading\n\nNo level 1 heading here.';
      fs.writeFileSync(testFile, content);

      const result = resolveTitleFromFile(testFile);
      expect(result).toBe(testFile);
    });

    it('should fallback to file path when file does not exist', () => {
      const nonExistentFile = path.join(testEnv.tempDir, 'does-not-exist.md');

      const result = resolveTitleFromFile(nonExistentFile);
      expect(result).toBe(nonExistentFile);
    });
  });
});
