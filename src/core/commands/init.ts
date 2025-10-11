import * as fs from 'fs';
import * as path from 'path';
import { findGitRoot, getDocsDirectory } from '../shared/file-utils';
import { resolveFileInfo } from '../shared/file-resolver';
import { FileInfo } from '../shared/types';
import { getAnthropicService } from '../shared/anthropic-service';

const INIT_RESOURCES_DIR = path.resolve(
  __dirname,
  '../../resources/init-scripts'
);
const DEV_TEMPLATE_DIR = path.join(INIT_RESOURCES_DIR, 'dev');
const CLAUDE_TEMPLATE_DIR = path.join(
  INIT_RESOURCES_DIR,
  '.claude',
  'commands'
);

export interface InitScriptsOptions {
  implIdOrPath: string;
}

export interface InitScriptsResult {
  devDir: string;
  claudeCommandsDir: string;
}

function ensureInsideDirectory(filePath: string, directory: string): void {
  const relative = path.relative(directory, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Implementation file must reside within the docs directory (${directory})`
    );
  }
}

function toPosixRelativePath(root: string, target: string): string {
  const relativePath = path.relative(root, target);
  return relativePath.split(path.sep).join('/');
}

async function loadTemplate(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, 'utf8');
}

function writeFileEnsuringDir(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function replacePlaceholder(
  content: string,
  placeholder: string,
  replacement: string
): string {
  return content.split(placeholder).join(replacement);
}

export async function installInitScripts(
  options: InitScriptsOptions
): Promise<InitScriptsResult> {
  if (!options.implIdOrPath) {
    throw new Error('Missing required option: --impl <IMPL_ID_OR_PATH>');
  }

  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const docsDir = await getDocsDirectory();
  const resolvedDocsDir = fs.realpathSync(docsDir);

  const implInfo = await resolveFileInfo(options.implIdOrPath);
  validateImplementationFile(implInfo, resolvedDocsDir);

  const anthropicService = getAnthropicService();
  const implContent = fs.readFileSync(implInfo.absolutePath, 'utf8');
  const commandResponse =
    await anthropicService.generateWorktreeSetupCommands(implContent);
  const buildResponse =
    await anthropicService.generateWorktreeBuildCommands(implContent);

  const normalizedCommands = commandResponse.trim();
  const setupCommands = normalizedCommands
    ? normalizedCommands
    : '# No implementation-specific setup required';
  const normalizedBuildCommands = buildResponse.trim();
  const buildCommands = normalizedBuildCommands
    ? normalizedBuildCommands
    : '# No implementation-specific post-worktree steps required';

  const devDir = path.join(gitRoot, 'dev');
  const claudeCommandsDir = path.join(gitRoot, '.claude', 'commands');

  await installDevScripts(devDir, setupCommands, buildCommands);
  await installClaudeCommands(
    claudeCommandsDir,
    toPosixRelativePath(gitRoot, implInfo.absolutePath)
  );

  return { devDir, claudeCommandsDir };
}

function validateImplementationFile(implInfo: FileInfo, docsDir: string): void {
  if (implInfo.type !== 'implementation') {
    throw new Error(
      `Implementation file must be of type 'implementation', got '${implInfo.type}'`
    );
  }

  ensureInsideDirectory(implInfo.absolutePath, docsDir);
}

async function installDevScripts(
  targetDevDir: string,
  setupCommands: string,
  buildCommands: string
): Promise<void> {
  const startTemplatePath = path.join(DEV_TEMPLATE_DIR, 'start-worktree.sh');
  const endTemplatePath = path.join(DEV_TEMPLATE_DIR, 'end-worktree.sh');

  const [startTemplate, endTemplate] = await Promise.all([
    loadTemplate(startTemplatePath),
    loadTemplate(endTemplatePath),
  ]);

  const startScriptContent = replacePlaceholder(
    startTemplate,
    '{{WORKTREE_SETUP_COMMANDS}}',
    setupCommands
  );

  if (startScriptContent.includes('{{WORKTREE_SETUP_COMMANDS}}')) {
    throw new Error('Failed to replace worktree setup placeholder in template');
  }

  const endScriptContent = replacePlaceholder(
    endTemplate,
    '{{WORKTREE_BUILD_COMMANDS}}',
    buildCommands
  );

  if (endScriptContent.includes('{{WORKTREE_BUILD_COMMANDS}}')) {
    throw new Error('Failed to replace post-worktree placeholder in template');
  }

  const startTargetPath = path.join(targetDevDir, 'start-worktree.sh');
  const endTargetPath = path.join(targetDevDir, 'end-worktree.sh');

  writeFileEnsuringDir(startTargetPath, startScriptContent);
  writeFileEnsuringDir(endTargetPath, endScriptContent);

  fs.chmodSync(startTargetPath, 0o755);
  fs.chmodSync(endTargetPath, 0o755);
}

async function installClaudeCommands(
  targetCommandsDir: string,
  implPathForTemplate: string
): Promise<void> {
  const entries = fs
    .readdirSync(CLAUDE_TEMPLATE_DIR, { withFileTypes: true })
    .filter(entry => entry.isFile());

  for (const entry of entries) {
    const templatePath = path.join(CLAUDE_TEMPLATE_DIR, entry.name);
    const content = await loadTemplate(templatePath);
    const replaced = replacePlaceholder(
      content,
      '{{IMPL_PATH}}',
      implPathForTemplate
    );

    if (replaced.includes('{{IMPL_PATH}}')) {
      throw new Error(
        `Failed to replace implementation path placeholder in template ${entry.name}`
      );
    }

    const targetPath = path.join(targetCommandsDir, entry.name);
    writeFileEnsuringDir(targetPath, replaced);
  }
}
