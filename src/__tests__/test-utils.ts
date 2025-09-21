import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export interface TestEnvironment {
  tempDir: string;
  originalCwd: string;
  fixtureDir: string;
}

export function setupTestEnvironment(fixtureDir: string): TestEnvironment {
  const originalCwd = process.cwd();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zamm-test-'));
  process.chdir(tempDir);

  execSync('git init', { stdio: 'pipe' });
  execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
  execSync('git config user.name "Test User"', { stdio: 'pipe' });

  return { tempDir, originalCwd, fixtureDir };
}

export function cleanupTestEnvironment(env: TestEnvironment): void {
  process.chdir(env.originalCwd);
  fs.rmSync(env.tempDir, { recursive: true, force: true });
}

export function loadFixture(env: TestEnvironment, name: string): string {
  const fixturePath = path.resolve(env.originalCwd, env.fixtureDir, name);
  return fs.readFileSync(fixturePath, 'utf8');
}

export function copyTestFile(env: TestEnvironment, filePath: string): string {
  const content = loadFixture(env, filePath);
  const fullPath = path.join(env.tempDir, filePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
  return fullPath;
}

export function expectFileMatchesFixtureFile(
  env: TestEnvironment,
  filePath: string,
  fixtureSubDir: string,
  expectedRelativePath: string
): void {
  const result = fs.readFileSync(filePath, 'utf8');
  const expectedPath = path.resolve(
    env.originalCwd,
    env.fixtureDir,
    fixtureSubDir,
    expectedRelativePath
  );
  const expected = fs.readFileSync(expectedPath, 'utf8');
  expect(result).toBe(expected);
}

export function expectFileMatchesFixture(
  env: TestEnvironment,
  filePath: string,
  expectedFixtureName: string
): void {
  const result = fs.readFileSync(filePath, 'utf8');
  const expected = loadFixture(env, expectedFixtureName);
  expect(result).toBe(expected);
}

export function copyDirectoryFromFixture(
  env: TestEnvironment,
  fixtureSubDir: string
): void {
  const sourceDir = path.resolve(
    env.originalCwd,
    env.fixtureDir,
    fixtureSubDir
  );
  const targetDir = env.tempDir;
  copyDirectoryRecursive(sourceDir, targetDir);
}

function copyDirectoryRecursive(source: string, target: string): void {
  if (!fs.existsSync(source)) {
    return;
  }

  const items = fs.readdirSync(source, { withFileTypes: true });

  for (const item of items) {
    const sourcePath = path.join(source, item.name);
    const targetPath = path.join(target, item.name);

    if (item.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      const dir = path.dirname(targetPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}
