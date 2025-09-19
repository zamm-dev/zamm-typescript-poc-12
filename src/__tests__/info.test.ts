import * as fs from 'fs';
import * as path from 'path';
import {
  getInfoByIdOrPath,
  findFileById,
  getFileInfo,
  getProjectImplementations,
  formatFileInfo,
} from '../core';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  createTestFileFromFixture,
} from './test-utils';

describe('ZAMM CLI Info Command', () => {
  let testEnv: TestEnvironment;

  beforeEach(() => {
    testEnv = setupTestEnvironment('src/__tests__/fixtures/info');
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
  });

  function createTestFile(relativePath: string, fixtureName: string): string {
    return createTestFileFromFixture(testEnv, relativePath, fixtureName);
  }

  describe('findFileById', () => {
    it('should find file by ID', () => {
      createTestFile('docs/features/authentication.md', 'spec-file.md');

      const result = findFileById('XYZ789');
      expect(result).toContain('docs/features/authentication.md');
      expect(result).toMatch(/\/docs\/features\/authentication\.md$/);
    });

    it('should return null if ID not found', () => {
      createTestFile('docs/features/authentication.md', 'spec-file.md');

      const result = findFileById('NOTFOUND');
      expect(result).toBeNull();
    });

    it('should handle files without frontmatter', () => {
      createTestFile('docs/example.md', 'no-frontmatter.md');

      const result = findFileById('XYZ789');
      expect(result).toBeNull();
    });
  });

  describe('getFileInfo', () => {
    it('should extract file information', () => {
      const filePath = createTestFile(
        'docs/features/authentication.md',
        'spec-file.md'
      );

      const info = getFileInfo(filePath);
      expect(info).toEqual({
        id: 'XYZ789',
        type: 'spec',
        filePath: '/docs/features/authentication.md',
        absolutePath: filePath,
        gitRoot: testEnv.tempDir,
      });
    });

    it('should error for non-existent file', () => {
      expect(() => getFileInfo('nonexistent.md')).toThrow('File not found');
    });

    it('should error for file without ID', () => {
      const filePath = createTestFile('docs/example.md', 'no-frontmatter.md');

      expect(() => getFileInfo(filePath)).toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });
  });

  describe('getProjectImplementations', () => {
    it('should find all implementation files', () => {
      createTestFile('docs/impls/nodejs.md', 'nodejs-impl.md');
      createTestFile('docs/impls/python.md', 'python-impl.md');

      const implementations = getProjectImplementations(testEnv.tempDir);
      expect(implementations).toEqual([
        { id: 'IMP001', name: 'Node.js Implementation' },
        { id: 'IMP002', name: 'Python Implementation' },
      ]);
    });

    it('should return empty array if no implementations found', () => {
      const implementations = getProjectImplementations(testEnv.tempDir);
      expect(implementations).toEqual([]);
    });

    it('should handle files without proper frontmatter', () => {
      createTestFile('docs/impls/broken.md', 'broken-impl.md');

      const implementations = getProjectImplementations(testEnv.tempDir);
      expect(implementations).toEqual([]);
    });
  });

  describe('formatFileInfo', () => {
    it('should format spec file info', () => {
      const fileInfo = {
        id: 'XYZ789',
        type: 'spec',
        filePath: '/docs/features/authentication.md',
        absolutePath: '/some/path',
        gitRoot: '/root',
      };

      const result = formatFileInfo(fileInfo);
      expect(result).toBe(
        'ID: XYZ789\nType: Specification\nFile Path: /docs/features/authentication.md'
      );
    });

    it('should format project file info with implementations', () => {
      const fileInfo = {
        id: 'PRJ001',
        type: 'project',
        filePath: '/docs/README.md',
        absolutePath: '/some/path',
        gitRoot: '/root',
      };

      const implementations = [
        { id: 'IMP001', name: 'Node.js Implementation' },
        { id: 'IMP002', name: 'Python Implementation' },
      ];

      const result = formatFileInfo(fileInfo, implementations);
      expect(result).toBe(
        `ID: PRJ001
Type: Project
File Path: /docs/README.md
Implementations:
  - IMP001: Node.js Implementation
  - IMP002: Python Implementation`
      );
    });

    it('should format all file types correctly', () => {
      const testCases = [
        { type: 'project', expected: 'Project' },
        { type: 'implementation', expected: 'Implementation' },
        { type: 'implementation-note', expected: 'Implementation Note' },
        { type: 'test', expected: 'Test' },
        { type: 'spec', expected: 'Specification' },
      ];

      testCases.forEach(({ type, expected }) => {
        const fileInfo = {
          id: 'TEST123',
          type,
          filePath: '/docs/test.md',
          absolutePath: '/some/path',
          gitRoot: '/root',
        };

        const result = formatFileInfo(fileInfo);
        expect(result).toContain(`Type: ${expected}`);
      });
    });
  });

  describe('getInfoByIdOrPath integration tests', () => {
    it('should get info for spec file by ID', () => {
      createTestFile('docs/features/authentication.md', 'spec-file.md');

      const result = getInfoByIdOrPath('XYZ789');
      expect(result).toBe(
        'ID: XYZ789\nType: Specification\nFile Path: /docs/features/authentication.md'
      );
    });

    it('should get info for spec file by path', () => {
      const filePath = createTestFile(
        'docs/features/authentication.md',
        'spec-file.md'
      );

      const result = getInfoByIdOrPath(filePath);
      expect(result).toBe(
        'ID: XYZ789\nType: Specification\nFile Path: /docs/features/authentication.md'
      );
    });

    it('should get info for project file with implementations', () => {
      createTestFile('docs/README.md', 'project-file.md');
      createTestFile('docs/impls/nodejs.md', 'nodejs-impl.md');
      createTestFile('docs/impls/python.md', 'python-impl.md');

      const result = getInfoByIdOrPath('PRJ001');
      expect(result).toBe(
        `ID: PRJ001
Type: Project
File Path: /docs/README.md
Implementations:
  - IMP001: Node.js Implementation
  - IMP002: Python Implementation`
      );
    });

    it('should error for non-existent ID or path', () => {
      createTestFile('docs/dummy.md', 'dummy-file.md');

      expect(() => getInfoByIdOrPath('NOTFOUND')).toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for file without proper frontmatter', () => {
      const filePath = createTestFile('docs/example.md', 'no-frontmatter.md');

      expect(() => getInfoByIdOrPath(filePath)).toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });

    it('should error when not in git repository', () => {
      fs.rmSync(path.join(testEnv.tempDir, '.git'), {
        recursive: true,
        force: true,
      });

      expect(() => getInfoByIdOrPath('XYZ789')).toThrow(
        'Not in a git repository'
      );
    });
  });
});
