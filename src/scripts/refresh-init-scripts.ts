#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TEMPLATE_DIR = 'src/resources/init-scripts';
const CLAUDE_DIR = '.claude';
const DEV_DIR = 'dev';

/**
 * Validates that the script is being run from the Git repository root
 */
function validateGitRoot(): void {
  try {
    const isGitRepo = execSync('git rev-parse --is-inside-work-tree', {
      stdio: 'pipe',
      encoding: 'utf8',
    }).trim();

    if (isGitRepo !== 'true') {
      console.error('Error: must run inside a git repository');
      process.exit(1);
    }
  } catch {
    console.error('Error: must run inside a git repository');
    process.exit(1);
  }

  const gitRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();

  if (process.cwd() !== gitRoot) {
    console.error(`Error: run from the git root (${gitRoot})`);
    process.exit(1);
  }
}

/**
 * Recursively copies directory contents
 */
function copyDirectory(src: string, dest: string, exclude?: string[]): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (exclude?.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Recursively restores {{IMPL_PATH}} placeholders in .claude directory
 */
function restoreImplPathPlaceholders(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      restoreImplPathPlaceholders(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace implementation-specific path with placeholder
      content = content.replace(/docs\/impls\/nodejs\.md/g, '{{IMPL_PATH}}');
      fs.writeFileSync(fullPath, content);
    }
  }
}

/**
 * Replaces implementation-specific commands in start-worktree.sh with placeholder
 */
function restoreStartWorktreePlaceholder(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const output: string[] = [];
  let skipMode = false;
  let foundMarker = false;

  for (const line of lines) {
    if (line === '##### Setup worktree environment') {
      output.push(line);
      output.push('{{WORKTREE_SETUP_COMMANDS}}');
      output.push(''); // Blank line after placeholder
      skipMode = true;
      foundMarker = true;
      continue;
    }

    if (skipMode && line.startsWith('#####')) {
      skipMode = false;
    }

    if (!skipMode) {
      output.push(line);
    }
  }

  if (!foundMarker) {
    console.error(
      'Error: Could not find "##### Setup worktree environment" marker in start-worktree.sh'
    );
    console.error('The script structure has changed and needs manual review');
    process.exit(1);
  }

  fs.writeFileSync(filePath, output.join('\n'));
}

/**
 * Replaces implementation-specific commands in end-worktree.sh with placeholder
 */
function restoreEndWorktreePlaceholder(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const output: string[] = [];
  let inStep5 = false;
  let foundStep5 = false;
  let foundStep6 = false;

  for (const line of lines) {
    if (line.startsWith('# Step 5:')) {
      // Output generic Step 5 comment
      output.push(
        '# Step 5: Run implementation-specific build or verification commands'
      );
      inStep5 = true;
      foundStep5 = true;
      continue;
    }

    if (line.startsWith('# Step 6:')) {
      // Output the fixed Step 5 content before Step 6
      output.push(
        'echo "Running implementation-specific post-worktree commands..."'
      );
      output.push('{{WORKTREE_BUILD_COMMANDS}}');
      output.push('');
      inStep5 = false;
      foundStep6 = true;
    }

    if (!inStep5) {
      output.push(line);
    }
  }

  if (!foundStep5 || !foundStep6) {
    console.error(
      'Error: Could not find "# Step 5:" and/or "# Step 6:" markers in end-worktree.sh'
    );
    console.error('The script structure has changed and needs manual review');
    process.exit(1);
  }

  // Ensure trailing newline
  const outputContent = output.join('\n') + '\n';
  fs.writeFileSync(filePath, outputContent);
}

/**
 * Main function to refresh init script templates
 */
function refreshInitScripts(): void {
  console.log('Refreshing init script templates...');

  validateGitRoot();

  // Copy .claude directory (excluding settings.local.json)
  console.log('Copying .claude/ directory...');
  const templateClaudeDir = path.join(TEMPLATE_DIR, CLAUDE_DIR);
  if (fs.existsSync(templateClaudeDir)) {
    fs.rmSync(templateClaudeDir, { recursive: true });
  }
  copyDirectory(CLAUDE_DIR, templateClaudeDir, ['settings.local.json']);

  // Restore {{IMPL_PATH}} placeholders in .claude files
  console.log('Restoring {{IMPL_PATH}} placeholders in .claude/ files...');
  restoreImplPathPlaceholders(templateClaudeDir);

  // Copy dev scripts
  console.log('Copying dev/ scripts...');
  const templateDevDir = path.join(TEMPLATE_DIR, DEV_DIR);
  if (!fs.existsSync(templateDevDir)) {
    fs.mkdirSync(templateDevDir, { recursive: true });
  }

  const startWorktreeSrc = path.join(DEV_DIR, 'start-worktree.sh');
  const startWorktreeDest = path.join(templateDevDir, 'start-worktree.sh');
  fs.copyFileSync(startWorktreeSrc, startWorktreeDest);

  const endWorktreeSrc = path.join(DEV_DIR, 'end-worktree.sh');
  const endWorktreeDest = path.join(templateDevDir, 'end-worktree.sh');
  fs.copyFileSync(endWorktreeSrc, endWorktreeDest);

  // Restore placeholders
  console.log(
    'Restoring {{WORKTREE_SETUP_COMMANDS}} placeholder in start-worktree.sh...'
  );
  restoreStartWorktreePlaceholder(startWorktreeDest);

  console.log(
    'Restoring {{WORKTREE_BUILD_COMMANDS}} placeholder in end-worktree.sh...'
  );
  restoreEndWorktreePlaceholder(endWorktreeDest);

  // Success message
  console.log('');
  console.log('Successfully refreshed init script templates:');
  console.log('  - .claude/ directory (with {{IMPL_PATH}} placeholders)');
  console.log(
    '  - dev/start-worktree.sh (with {{WORKTREE_SETUP_COMMANDS}} placeholder)'
  );
  console.log(
    '  - dev/end-worktree.sh (with {{WORKTREE_BUILD_COMMANDS}} placeholder)'
  );
}

try {
  refreshInitScripts();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
