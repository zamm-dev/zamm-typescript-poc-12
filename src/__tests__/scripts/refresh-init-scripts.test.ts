import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { refreshInitScripts } from '../../scripts/refresh-init-scripts';

describe('refresh-init-scripts', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    // Create temp directory for test output
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'refresh-test-'));
  });

  afterEach(() => {
    process.chdir(originalCwd);
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it('should refresh init scripts to custom output directory', () => {
    const outputDir = refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    expect(outputDir).toBe(tempDir);

    // Verify .claude directory was copied
    expect(fs.existsSync(path.join(tempDir, '.claude'))).toBe(true);
    expect(
      fs.existsSync(path.join(tempDir, '.claude/software-dev-guidelines.md'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tempDir, '.claude/commands/implement-spec.md'))
    ).toBe(true);

    // Verify settings.local.json was excluded
    expect(
      fs.existsSync(path.join(tempDir, '.claude/settings.local.json'))
    ).toBe(false);

    // Verify dev scripts were copied
    expect(fs.existsSync(path.join(tempDir, 'dev/start-worktree.sh'))).toBe(
      true
    );
    expect(fs.existsSync(path.join(tempDir, 'dev/end-worktree.sh'))).toBe(true);
  });

  it('should restore {{IMPL_PATH}} placeholders in .claude files', () => {
    refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    const implementSpecPath = path.join(
      tempDir,
      '.claude/commands/implement-spec.md'
    );
    const content = fs.readFileSync(implementSpecPath, 'utf8');

    expect(content).toContain('{{IMPL_PATH}}');
    expect(content).not.toContain('docs/impls/nodejs.md');
  });

  it('should restore {{WORKTREE_SETUP_COMMANDS}} placeholder in start-worktree.sh', () => {
    refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    const startWorktreePath = path.join(tempDir, 'dev/start-worktree.sh');
    const content = fs.readFileSync(startWorktreePath, 'utf8');

    expect(content).toContain('##### Setup worktree environment');
    expect(content).toContain('{{WORKTREE_SETUP_COMMANDS}}');
    expect(content).not.toContain('npm install');

    // Verify blank line after placeholder
    const lines = content.split('\n');
    const placeholderIndex = lines.indexOf('{{WORKTREE_SETUP_COMMANDS}}');
    expect(placeholderIndex).toBeGreaterThan(-1);
    expect(lines[placeholderIndex + 1]).toBe('');
  });

  it('should restore {{WORKTREE_BUILD_COMMANDS}} placeholder in end-worktree.sh', () => {
    refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    const endWorktreePath = path.join(tempDir, 'dev/end-worktree.sh');
    const content = fs.readFileSync(endWorktreePath, 'utf8');

    expect(content).toContain(
      '# Step 5: Run implementation-specific build or verification commands'
    );
    expect(content).toContain('{{WORKTREE_BUILD_COMMANDS}}');
    expect(content).not.toContain('npm install && npm run build');

    // Verify trailing newline
    expect(content.endsWith('\n')).toBe(true);
  });

  it('should remove executable bit from template shell scripts', () => {
    refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    const startWorktreePath = path.join(tempDir, 'dev/start-worktree.sh');
    const endWorktreePath = path.join(tempDir, 'dev/end-worktree.sh');

    const startStats = fs.statSync(startWorktreePath);
    const endStats = fs.statSync(endWorktreePath);

    // Check that executable bit is NOT set (0o644 = rw-r--r--)
    expect(startStats.mode & 0o111).toBe(0);
    expect(endStats.mode & 0o111).toBe(0);
  });

  it('should be idempotent - running twice produces same result', () => {
    // Run first time
    refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    // Read all generated files
    const firstRun = readAllFiles(tempDir);

    // Run second time
    refreshInitScripts({
      outputDir: tempDir,
      validateGitRoot: false,
    });

    // Read all generated files again
    const secondRun = readAllFiles(tempDir);

    // Compare results
    expect(Object.keys(firstRun).sort()).toEqual(Object.keys(secondRun).sort());
    for (const filePath of Object.keys(firstRun)) {
      expect(secondRun[filePath]).toEqual(firstRun[filePath]);
    }
  });

  it('should succeed when run on current project templates', () => {
    // This test verifies that the actual project templates are up-to-date
    // and don't need manual review
    expect(() => {
      refreshInitScripts({
        outputDir: tempDir,
        validateGitRoot: false,
      });
    }).not.toThrow();
  });

  it('should throw error if start-worktree.sh marker is missing', () => {
    // Create a temp directory with invalid start-worktree.sh but valid .claude dir
    const testSourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'source-'));

    // Create .claude directory (can be empty, just needs to exist)
    fs.mkdirSync(path.join(testSourceDir, '.claude'), { recursive: true });

    // Create dev directory with invalid start-worktree.sh
    const invalidDevDir = path.join(testSourceDir, 'dev');
    fs.mkdirSync(invalidDevDir, { recursive: true });
    fs.writeFileSync(
      path.join(invalidDevDir, 'start-worktree.sh'),
      '#!/bin/bash\n# Missing marker\necho "test"\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(invalidDevDir, 'end-worktree.sh'),
      '#!/bin/bash\n# Valid file\n# Step 5: test\necho "test"\n# Step 6: test\n',
      'utf8'
    );

    // Change to test source dir temporarily
    const savedCwd = process.cwd();
    try {
      process.chdir(testSourceDir);

      expect(() => {
        refreshInitScripts({
          outputDir: tempDir,
          validateGitRoot: false,
        });
      }).toThrow(/Could not find.*Setup worktree environment/);
    } finally {
      process.chdir(savedCwd);
      fs.rmSync(testSourceDir, { recursive: true });
    }
  });
});

/**
 * Recursively reads all files in a directory and returns them as a map
 */
function readAllFiles(dir: string): Record<string, string> {
  const files: Record<string, string> = {};

  function walk(currentPath: string): void {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(dir, fullPath);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files[relativePath] = fs.readFileSync(fullPath, 'utf8');
      }
    }
  }

  walk(dir);
  return files;
}
