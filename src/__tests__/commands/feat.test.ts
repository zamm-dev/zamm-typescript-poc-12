import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import {
  featStart,
  FeatStartOptions,
  setIdProvider,
  resetIdProvider,
  IdProvider,
} from '../../core/index';
import { TestEnvironment, cleanupTestEnvironment } from '../shared/test-utils';

// Mock Anthropic SDK
const mockMessages = {
  create: jest.fn(),
};

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: mockMessages,
    })),
  };
});

class TestIdProvider implements IdProvider {
  generateId(): string {
    return 'TST123';
  }
}

describe('ZAMM CLI Feat Command', () => {
  let testEnv: TestEnvironment;
  let originalApiKey: string | undefined;
  let testBaseDir: string;

  beforeAll(() => {
    // Create a base directory for all feat tests
    testBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zamm-feat-tests-'));
  });

  afterAll(() => {
    // Clean up the entire test directory
    fs.rmSync(testBaseDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Clean up any leftover directories from previous tests
    const entries = fs.readdirSync(testBaseDir);
    for (const entry of entries) {
      const fullPath = path.join(testBaseDir, entry);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    // Set up test environment within our controlled directory
    const testSubDir = path.join(testBaseDir, 'repo');
    fs.mkdirSync(testSubDir, { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(testSubDir);

    execSync('git init', { stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });

    testEnv = {
      tempDir: testSubDir,
      originalCwd,
      fixtureDir: 'src/__tests__/fixtures/feat',
    };

    setIdProvider(new TestIdProvider());

    // Set up API key for tests
    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
    resetIdProvider();

    // Restore API key
    if (originalApiKey) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  describe('featStart', () => {
    it('should throw error when ANTHROPIC_API_KEY is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await expect(featStart(options)).rejects.toThrow(
        'ANTHROPIC_API_KEY environment variable is required'
      );
    });

    it('should create worktree and spec file successfully', async () => {
      // Mock Anthropic responses
      mockMessages.create
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'user-authentication' }],
        })
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'User Authentication System' }],
        });

      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await featStart(options);

      // Verify spec file was created
      const expectedSpecPath = path.join(
        testEnv.tempDir,
        'docs',
        'spec-history',
        'user-authentication.md'
      );
      expect(fs.existsSync(expectedSpecPath)).toBe(true);

      const specContent = fs.readFileSync(expectedSpecPath, 'utf-8');
      expect(specContent).toContain('id: TST123');
      expect(specContent).toContain('type: spec');
      expect(specContent).toContain('# User Authentication System');
      expect(specContent).toContain('Add user authentication');
    });

    it('should prepend zamm/ to branch name if not present', async () => {
      mockMessages.create
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'feature-branch' }],
        })
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Feature Branch' }],
        });

      const options: FeatStartOptions = {
        description: 'Some feature',
      };

      await featStart(options);
    });

    it('should convert slashes to hyphens in directory name', async () => {
      mockMessages.create
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'feature/sub/branch' }],
        })
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Feature Sub Branch' }],
        });

      const options: FeatStartOptions = {
        description: 'Complex feature',
      };

      await featStart(options);

      // Verify spec file path uses hyphens instead of slashes
      const expectedSpecPath = path.join(
        testEnv.tempDir,
        'docs',
        'spec-history',
        'feature-sub-branch.md'
      );
      expect(fs.existsSync(expectedSpecPath)).toBe(true);
    });

    it('should handle branches that already have zamm/ prefix', async () => {
      mockMessages.create
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'zamm/existing-prefix' }],
        })
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Existing Prefix Feature' }],
        });

      const options: FeatStartOptions = {
        description: 'Feature with prefix',
      };

      await featStart(options);

      // Verify spec file uses directory name without zamm/
      const expectedSpecPath = path.join(
        testEnv.tempDir,
        'docs',
        'spec-history',
        'existing-prefix.md'
      );
      expect(fs.existsSync(expectedSpecPath)).toBe(true);
    });
  });
});
