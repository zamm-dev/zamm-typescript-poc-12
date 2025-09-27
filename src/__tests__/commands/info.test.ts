import * as fs from 'fs';
import * as path from 'path';
import {
  getInfoByIdOrPath,
  findFileById,
  getFileInfo,
  getProjectImplementations,
  formatFileInfo,
} from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  copyTestFile,
} from '../shared/test-utils';

describe('ZAMM CLI Info Command', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/info');
    process.chdir(testEnv.tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
  });

  function createTestFile(filePath: string): string {
    return copyTestFile(testEnv, filePath);
  }

  describe('findFileById', () => {
    it('should find file by ID', async () => {
      createTestFile('docs/specs/features/authentication.md');

      const result = await findFileById('XYZ789');
      expect(result).toContain('docs/specs/features/authentication.md');
      expect(result).toMatch(/\/docs\/specs\/features\/authentication\.md$/);
    });

    it('should return null if ID not found', async () => {
      createTestFile('docs/specs/features/authentication.md');

      const result = await findFileById('NOTFOUND');
      expect(result).toBeNull();
    });

    it('should handle files without frontmatter', async () => {
      createTestFile('docs/example.md');

      const result = await findFileById('XYZ789');
      expect(result).toBeNull();
    });
  });

  describe('getFileInfo', () => {
    it('should extract file information', async () => {
      const filePath = createTestFile('docs/specs/features/authentication.md');

      const info = await getFileInfo(filePath);
      expect(info).toEqual({
        id: 'XYZ789',
        type: 'spec',
        filePath: '/specs/features/authentication.md',
        displayPath: expect.stringMatching(
          /docs\/specs\/features\/authentication\.md$/
        ) as string,
        absolutePath: filePath,
        gitRoot: testEnv.tempDir,
      });
    });

    it('should error for non-existent file', async () => {
      await expect(getFileInfo('nonexistent.md')).rejects.toThrow(
        'File not found'
      );
    });

    it('should error for file without ID', async () => {
      const filePath = createTestFile('docs/example.md');

      await expect(getFileInfo(filePath)).rejects.toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });
  });

  describe('getProjectImplementations', () => {
    it('should find all implementation files', async () => {
      createTestFile('docs/impls/nodejs.md');
      createTestFile('docs/impls/python.md');

      const implementations = await getProjectImplementations();
      expect(implementations).toEqual([
        { id: 'IMP001', name: 'Node.js Implementation' },
        { id: 'IMP002', name: 'Python Implementation' },
      ]);
    });

    it('should return empty array if no implementations found', async () => {
      // Create docs directory structure without any implementation files
      createTestFile('docs/README.md');

      const implementations = await getProjectImplementations();
      expect(implementations).toEqual([]);
    });

    it('should handle files without proper frontmatter', async () => {
      createTestFile('docs/impls/broken.md');

      const implementations = await getProjectImplementations();
      expect(implementations).toEqual([]);
    });
  });

  describe('formatFileInfo', () => {
    it('should format spec file info', () => {
      const fileInfo = {
        id: 'XYZ789',
        type: 'spec',
        filePath: '/specs/features/authentication.md',
        displayPath: 'docs/specs/features/authentication.md',
        absolutePath: '/some/path',
        gitRoot: '/root',
      };

      const result = formatFileInfo(fileInfo);
      expect(result).toBe(
        'ID: XYZ789\nType: Specification\nFile Path: docs/specs/features/authentication.md'
      );
    });

    it('should format project file info with implementations', () => {
      const fileInfo = {
        id: 'PRJ001',
        type: 'project',
        filePath: '/README.md',
        displayPath: 'docs/README.md',
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
File Path: docs/README.md
Implementations:
  - IMP001: Node.js Implementation
  - IMP002: Python Implementation`
      );
    });

    it('should format all file types correctly', () => {
      const testCases = [
        { type: 'project', expected: 'Project' },
        { type: 'implementation', expected: 'Implementation' },
        { type: 'ref-impl', expected: 'Reference Implementation' },
        { type: 'test', expected: 'Test' },
        { type: 'spec', expected: 'Specification' },
      ];

      testCases.forEach(({ type, expected }) => {
        const fileInfo = {
          id: 'TEST123',
          type,
          filePath: '/docs/test.md',
          displayPath: 'docs/test.md',
          absolutePath: '/some/path',
          gitRoot: '/root',
        };

        const result = formatFileInfo(fileInfo);
        expect(result).toContain(`Type: ${expected}`);
      });
    });
  });

  describe('getInfoByIdOrPath integration tests', () => {
    it('should get info for spec file by ID', async () => {
      createTestFile('docs/specs/features/authentication.md');

      const result = await getInfoByIdOrPath('XYZ789');
      expect(result).toBe(
        'ID: XYZ789\nType: Specification\nFile Path: docs/specs/features/authentication.md'
      );
    });

    it('should get info for spec file by path', async () => {
      createTestFile('docs/specs/features/authentication.md');

      const result = await getInfoByIdOrPath(
        'docs/specs/features/authentication.md'
      );
      expect(result).toBe(
        'ID: XYZ789\nType: Specification\nFile Path: docs/specs/features/authentication.md'
      );
    });

    it('should get info for project file with implementations', async () => {
      createTestFile('docs/README.md');
      createTestFile('docs/impls/nodejs.md');
      createTestFile('docs/impls/python.md');

      const result = await getInfoByIdOrPath('PRJ001');
      expect(result).toBe(
        `ID: PRJ001
Type: Project
File Path: docs/README.md
Implementations:
  - IMP001: Node.js Implementation
  - IMP002: Python Implementation`
      );
    });

    it('should error for non-existent ID or path', async () => {
      createTestFile('docs/dummy.md');

      await expect(getInfoByIdOrPath('NOTFOUND')).rejects.toThrow(
        'No file found matching the given ID or path: NOTFOUND'
      );
    });

    it('should error for file without proper frontmatter', async () => {
      const filePath = createTestFile('docs/example.md');

      await expect(getInfoByIdOrPath(filePath)).rejects.toThrow(
        'File does not have proper YAML frontmatter with an id field'
      );
    });

    it('should error when not in git repository', async () => {
      fs.rmSync(path.join(testEnv.tempDir, '.git'), {
        recursive: true,
        force: true,
      });

      await expect(getInfoByIdOrPath('XYZ789')).rejects.toThrow(
        'Not in a git repository'
      );
    });

    it('should get info for reference implementation file by ID', async () => {
      // Create spec and implementation files first
      createTestFile('docs/specs/features/authentication.md');
      createTestFile('docs/impls/python.md');

      // Create reference implementation file from fixture
      createTestFile('docs/specs/features/impl-history/initial-auth.md');

      const result = await getInfoByIdOrPath('NOT123');
      expect(result).toBe(
        `ID: NOT123
Type: Reference Implementation
File Path: docs/specs/features/impl-history/initial-auth.md
Specifications Implemented:
  - XYZ789: Authentication Feature
Implementation:
  - IMP002: Python Implementation`
      );
    });

    it('should get info for reference implementation file by path', async () => {
      // Create spec and implementation files first
      createTestFile('docs/specs/features/authentication.md');
      createTestFile('docs/impls/python.md');

      // Create reference implementation file from fixture
      createTestFile('docs/specs/features/impl-history/initial-auth.md');

      const result = await getInfoByIdOrPath(
        'docs/specs/features/impl-history/initial-auth.md'
      );
      expect(result).toBe(
        `ID: NOT123
Type: Reference Implementation
File Path: docs/specs/features/impl-history/initial-auth.md
Specifications Implemented:
  - XYZ789: Authentication Feature
Implementation:
  - IMP002: Python Implementation`
      );
    });

    it('should handle reference implementation with multiple specs', async () => {
      // Create reference implementation with multiple specs from fixture
      createTestFile('docs/specs/features/impl-history/multi-spec.md');

      const result = await getInfoByIdOrPath('NOT456');
      expect(result).toBe(
        `ID: NOT456
Type: Reference Implementation
File Path: docs/specs/features/impl-history/multi-spec.md
Specifications Implemented:
  - SPEC001: /docs/specs/features/auth.md
  - SPEC002: /docs/specs/features/login.md
Implementation:
  - IMP001: /docs/impls/nodejs.md`
      );
    });

    it('should handle reference implementation with malformed frontmatter gracefully', async () => {
      // Create reference implementation with incomplete frontmatter from fixture
      createTestFile('docs/specs/features/impl-history/malformed.md');

      const result = await getInfoByIdOrPath('NOT789');
      expect(result).toBe(
        `ID: NOT789
Type: Reference Implementation
File Path: docs/specs/features/impl-history/malformed.md`
      );
    });

    it('should show commits for reference implementation with commit history', async () => {
      // Create spec and implementation files first
      createTestFile('docs/specs/features/authentication.md');
      createTestFile('docs/impls/python.md');

      // Create reference implementation file with commits from fixture
      createTestFile(
        'docs/specs/features/impl-history/initial-auth-with-commits.md'
      );

      const result = await getInfoByIdOrPath('NOT124');
      expect(result).toBe(
        `ID: NOT124
Type: Reference Implementation
File Path: docs/specs/features/impl-history/initial-auth-with-commits.md
Specifications Implemented:
  - XYZ789: Authentication Feature
Implementation:
  - IMP002: Python Implementation
Commits:
  - a1b2c3d: Add initial authentication scaffolding
  - b2c3d4e: Implement user login endpoint
  - c3d4e5f: Add password validation and hashing`
      );
    });
  });
});
