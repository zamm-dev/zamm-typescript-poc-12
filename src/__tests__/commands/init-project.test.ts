import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import {
  setIdProvider,
  resetIdProvider,
  initProject,
  setPromptService,
  getPromptService,
  PromptService,
} from '../../core/index';
import {
  TestEnvironment,
  setupTestEnvironment,
  cleanupTestEnvironment,
  expectFileMatches,
} from '../shared/test-utils';

class MockIdProvider {
  constructor(private ids: string[]) {}
  private index = 0;
  generateId(): string {
    return this.ids[this.index++] || 'DEFAULT123';
  }
}

describe('ZAMM CLI Init Project Command', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;
  let originalPromptService: PromptService;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    originalCwd = process.cwd();
    testEnv = setupTestEnvironment('src/__tests__/fixtures/init-project');
    process.chdir(testEnv.tempDir);
    originalPromptService = getPromptService();
    // Suppress console output during tests
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTestEnvironment(testEnv);
    resetIdProvider();
    setPromptService(originalPromptService);
    // Restore console.log
    console.log = originalConsoleLog;
  });

  it('should initialize project with interactive prompts', async () => {
    setIdProvider(new MockIdProvider(['TEST123', 'TEST456']));

    const mockQuestion = jest
      .fn()
      .mockResolvedValueOnce('Task Management Application')
      .mockResolvedValueOnce(
        'A web-based task management application that helps teams collaborate on projects.'
      )
      .mockResolvedValueOnce('NodeJS with TypeScript');

    setPromptService({ question: mockQuestion });

    await initProject();

    // Verify prompts were called with correct questions
    expect(mockQuestion).toHaveBeenCalledTimes(3);
    expect(mockQuestion).toHaveBeenNthCalledWith(
      1,
      'What is the project title? '
    );
    expect(mockQuestion).toHaveBeenNthCalledWith(
      2,
      'What is this project about? '
    );
    expect(mockQuestion).toHaveBeenNthCalledWith(
      3,
      'What is the initial stack/implementation? '
    );

    const projectPath = path.join(
      testEnv.tempDir,
      'task-management-application'
    );
    const basePath = path.join(projectPath, 'base');
    const docsPath = path.join(basePath, 'docs');
    const implsPath = path.join(docsPath, 'impls');

    // Verify directory structure
    expect(fs.existsSync(projectPath)).toBe(true);
    expect(fs.existsSync(basePath)).toBe(true);
    expect(fs.existsSync(docsPath)).toBe(true);
    expect(fs.existsSync(implsPath)).toBe(true);

    // Verify git repository
    expect(fs.existsSync(path.join(basePath, '.git'))).toBe(true);

    // Verify README.md content
    expectFileMatches(
      testEnv,
      'task-management-application/base/docs/README.md',
      'expected'
    );

    // Verify implementation file content
    expectFileMatches(
      testEnv,
      'task-management-application/base/docs/impls/nodejs-with-typescript.md',
      'expected'
    );

    // Verify git commit
    const gitLog = execSync('git log --oneline', {
      cwd: basePath,
      encoding: 'utf8',
    });
    expect(gitLog).toContain('Initial project setup');
  });

  it('should initialize project with command options', async () => {
    setIdProvider(new MockIdProvider(['OPT123', 'OPT456']));

    await initProject({
      projectTitle: 'Test Project',
      projectDescription: 'A test project description.',
      initialStack: 'Python',
    });

    const projectPath = path.join(testEnv.tempDir, 'test-project');
    const basePath = path.join(projectPath, 'base');

    // Verify git repository exists
    expect(fs.existsSync(path.join(basePath, '.git'))).toBe(true);

    // Verify README.md content
    expectFileMatches(testEnv, 'test-project/base/docs/README.md', 'expected');

    // Verify implementation file content
    expectFileMatches(
      testEnv,
      'test-project/base/docs/impls/python.md',
      'expected'
    );
  });

  it('should normalize project directory names', async () => {
    setIdProvider(new MockIdProvider(['NORM123', 'NORM456']));

    await initProject({
      projectTitle: 'My Cool Project!!! 2024',
      projectDescription: 'Description',
      initialStack: 'Ruby on Rails',
    });

    // Verify normalized directory name
    const projectPath = path.join(testEnv.tempDir, 'my-cool-project-2024');
    expect(fs.existsSync(projectPath)).toBe(true);

    // Verify normalized implementation filename
    const implPath = path.join(
      projectPath,
      'base/docs/impls',
      'ruby-on-rails.md'
    );
    expect(fs.existsSync(implPath)).toBe(true);
  });

  it('should fail if project directory already exists', async () => {
    setIdProvider(new MockIdProvider(['DUP123', 'DUP456']));

    await initProject({
      projectTitle: 'Duplicate Project',
      projectDescription: 'First attempt',
      initialStack: 'NodeJS',
    });

    // Try to create the same project again
    await expect(
      initProject({
        projectTitle: 'Duplicate Project',
        projectDescription: 'Second attempt',
        initialStack: 'NodeJS',
      })
    ).rejects.toThrow('Project directory already exists');
  });

  it('should fail with empty project title', async () => {
    const mockQuestion = jest
      .fn()
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce('Description')
      .mockResolvedValueOnce('Stack');

    setPromptService({ question: mockQuestion });

    await expect(initProject()).rejects.toThrow(
      'Project title cannot be empty'
    );
  });

  it('should fail with empty project description', async () => {
    const mockQuestion = jest
      .fn()
      .mockResolvedValueOnce('Title')
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce('Stack');

    setPromptService({ question: mockQuestion });

    await expect(initProject()).rejects.toThrow(
      'Project description cannot be empty'
    );
  });

  it('should fail with empty initial stack', async () => {
    const mockQuestion = jest
      .fn()
      .mockResolvedValueOnce('Title')
      .mockResolvedValueOnce('Description')
      .mockResolvedValueOnce('');

    setPromptService({ question: mockQuestion });

    await expect(initProject()).rejects.toThrow(
      'Initial stack cannot be empty'
    );
  });
});
