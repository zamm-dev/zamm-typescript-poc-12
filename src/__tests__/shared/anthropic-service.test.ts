import { RealAnthropicService } from '../../core/shared/anthropic-service';
import { NockRecorder } from './nock-utils';
import nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';

const FIXTURE_DIR = path.resolve(__dirname, '../fixtures/anthropic');

function loadFixture(relativePath: string): string {
  const fullPath = path.join(FIXTURE_DIR, relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

describe('RealAnthropicService Unit Tests', () => {
  let originalApiKey: string | undefined;
  let nockRecorder: NockRecorder;
  let anthropicService: RealAnthropicService;

  beforeAll(() => {
    nockRecorder = new NockRecorder('feat-recordings.json');
  });

  afterAll(() => {
    nock.cleanAll();
    nock.restore();
  });

  beforeEach(() => {
    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    anthropicService = new RealAnthropicService();
    nockRecorder.playbackRecordings();
  });

  afterEach(() => {
    if (originalApiKey) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }

    if (process.env.ANTHROPIC_API_KEY === 'test-api-key') {
      expect(nock.isDone()).toBe(true);
    }

    nock.cleanAll();
    nockRecorder.clear();
    nockRecorder.playbackRecordings();
  });

  it('should throw error when ANTHROPIC_API_KEY is missing', () => {
    delete process.env.ANTHROPIC_API_KEY;

    expect(() => new RealAnthropicService()).toThrow(
      'ANTHROPIC_API_KEY environment variable is required'
    );
  });

  it('should suggest branch name via API', async () => {
    const branchName = await anthropicService.suggestBranchName(
      'Add user authentication'
    );

    expect(branchName).toBe('add-user-auth');
  });

  it('should suggest alternative branch name via API', async () => {
    const altBranchName = await anthropicService.suggestAlternativeBranchName(
      'Add user authentication',
      'add-user-auth'
    );

    expect(altBranchName).toBe('user-authentication');
  });

  it('should suggest spec title via API', async () => {
    const specTitle = await anthropicService.suggestSpecTitle(
      'Add user authentication'
    );

    expect(specTitle).toBe('Add User Authentication');
  });

  it('should generate worktree setup commands via API', async () => {
    const implementationDoc = loadFixture('worktree-commands.md');

    const setupCommands =
      await anthropicService.generateWorktreeSetupCommands(implementationDoc);
    expect(setupCommands).toBe('npm install -g npm\nnpm install');
  });

  it('should generate worktree build commands via API', async () => {
    const implementationDoc = loadFixture('worktree-commands.md');

    const buildCommands =
      await anthropicService.generateWorktreeBuildCommands(implementationDoc);
    expect(buildCommands).toBe('npm run build\nnpm test');
  });
});
