#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { copyDirectory } from '../core/shared/file-utils';

const DEFAULT_TEMPLATE_DIR = 'src/resources/init-scripts';
const CLAUDE_DIR = '.claude';
const DEV_DIR = 'dev';

export interface RefreshOptions {
  outputDir?: string;
  validateGitRoot?: boolean;
}

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
      throw new Error('Must run inside a git repository');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('git repository')) {
      throw error;
    }
    throw new Error('Must run inside a git repository');
  }

  const gitRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();

  if (process.cwd() !== gitRoot) {
    throw new Error(`Must run from the git root (${gitRoot})`);
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
    throw new Error(
      'Could not find "##### Setup worktree environment" marker in start-worktree.sh. The script structure has changed and needs manual review.'
    );
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
    throw new Error(
      'Could not find "# Step 5:" and/or "# Step 6:" markers in end-worktree.sh. The script structure has changed and needs manual review.'
    );
  }

  // Ensure trailing newline
  const outputContent = output.join('\n') + '\n';
  fs.writeFileSync(filePath, outputContent);
}

/**
 * Main function to refresh init script templates
 * @param options - Options for refreshing templates
 * @returns The output directory where templates were written
 */
export function refreshInitScripts(options: RefreshOptions = {}): string {
  const {
    outputDir = DEFAULT_TEMPLATE_DIR,
    validateGitRoot: shouldValidateGitRoot = true,
  } = options;

  if (shouldValidateGitRoot) {
    validateGitRoot();
  }

  // Copy .claude directory (excluding settings.local.json)
  const templateClaudeDir = path.join(outputDir, CLAUDE_DIR);
  if (fs.existsSync(templateClaudeDir)) {
    fs.rmSync(templateClaudeDir, { recursive: true });
  }
  copyDirectory(CLAUDE_DIR, templateClaudeDir, ['settings.local.json']);

  // Restore {{IMPL_PATH}} placeholders in .claude files
  restoreImplPathPlaceholders(templateClaudeDir);

  // Copy dev scripts
  const templateDevDir = path.join(outputDir, DEV_DIR);
  if (!fs.existsSync(templateDevDir)) {
    fs.mkdirSync(templateDevDir, { recursive: true });
  }

  const startWorktreeSrc = path.join(DEV_DIR, 'start-worktree.sh');
  const startWorktreeDest = path.join(templateDevDir, 'start-worktree.sh');
  fs.copyFileSync(startWorktreeSrc, startWorktreeDest);
  fs.chmodSync(startWorktreeDest, 0o644); // Remove executable bit from template

  const endWorktreeSrc = path.join(DEV_DIR, 'end-worktree.sh');
  const endWorktreeDest = path.join(templateDevDir, 'end-worktree.sh');
  fs.copyFileSync(endWorktreeSrc, endWorktreeDest);
  fs.chmodSync(endWorktreeDest, 0o644); // Remove executable bit from template

  // Restore placeholders
  restoreStartWorktreePlaceholder(startWorktreeDest);
  restoreEndWorktreePlaceholder(endWorktreeDest);

  return outputDir;
}

// CLI entry point (only runs when executed directly, not when imported)
// eslint-disable-next-line no-undef
if (typeof require !== 'undefined' && require.main === module) {
  try {
    console.log('Refreshing init script templates...');
    const outputDir = refreshInitScripts();
    console.log('');
    console.log('Successfully refreshed init script templates:');
    console.log('  - .claude/ directory (with {{IMPL_PATH}} placeholders)');
    console.log(
      '  - dev/start-worktree.sh (with {{WORKTREE_SETUP_COMMANDS}} placeholder)'
    );
    console.log(
      '  - dev/end-worktree.sh (with {{WORKTREE_BUILD_COMMANDS}} placeholder)'
    );
    console.log(`\nOutput directory: ${outputDir}`);
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
