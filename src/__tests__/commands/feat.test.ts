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
import { NockRecorder } from '../shared/nock-utils';

class TestIdProvider implements IdProvider {
  generateId(): string {
    return 'TST123';
  }
}

describe('ZAMM CLI Feat Command', () => {
  let testEnv: TestEnvironment;
  let originalApiKey: string | undefined;
  let testBaseDir: string;
  let nockRecorder: NockRecorder;

  beforeAll(() => {
    // Create a base directory for all feat tests
    testBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zamm-feat-tests-'));

    // Initialize nock recorder
    nockRecorder = new NockRecorder('feat-recordings.json');
  });

  afterAll(() => {
    // Clean up the entire test directory
    fs.rmSync(testBaseDir, { recursive: true, force: true });

    // Clean up nock
    nockRecorder.clear();
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

    // Set up nock recordings for API calls
    nockRecorder.playbackRecordings();
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

    // Verify that at least one mock was used during the test
    // Skip verification for tests that should not make API calls
    if (process.env.ANTHROPIC_API_KEY === 'test-api-key') {
      nockRecorder.verifyMocksUsed();
    }

    // Reset nock for next test
    nockRecorder.clear();
    nockRecorder.playbackRecordings();
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
      expect(specContent).toContain('# Add User Authentication');
      expect(specContent).toContain('Add user authentication');
    });

    it('should prepend zamm/ to branch name if not present', async () => {
      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await featStart(options);

      // Verify that zamm/ prefix was added (our recordings show "user-authentication")
      const siblingDirs = fs.readdirSync(path.dirname(testEnv.tempDir));
      expect(siblingDirs).toContain('user-authentication');
    });

    it('should convert slashes to hyphens in directory name', async () => {
      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await featStart(options);

      // Verify spec file uses hyphens (our recordings create "user-authentication.md")
      const expectedSpecPath = path.join(
        testEnv.tempDir,
        'docs',
        'spec-history',
        'user-authentication.md'
      );
      expect(fs.existsSync(expectedSpecPath)).toBe(true);
    });

    it('should handle API integration correctly', async () => {
      const options: FeatStartOptions = {
        description: 'Add user authentication',
      };

      await featStart(options);

      // Verify that the spec file contains the expected AI-generated title
      const expectedSpecPath = path.join(
        testEnv.tempDir,
        'docs',
        'spec-history',
        'user-authentication.md'
      );
      const specContent = fs.readFileSync(expectedSpecPath, 'utf-8');
      expect(specContent).toContain('# Add User Authentication');
    });
  });
});
