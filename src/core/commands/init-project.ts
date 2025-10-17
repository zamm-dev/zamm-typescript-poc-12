import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { getIdProvider } from '../shared/id-provider';
import { getPromptService } from '../shared/prompt-utils';

const PROJECT_SETUP_RESOURCE = path.resolve(
  __dirname,
  '../../resources/project-setup.md'
);

export interface InitProjectOptions {
  projectTitle?: string;
  projectDescription?: string;
  initialStack?: string;
}

/**
 * Converts a title to a valid directory name
 * Examples: "Task Management Application" -> "task-management-application"
 */
function titleToDirectoryName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Converts a stack name to a valid filename
 * Examples: "NodeJS with TypeScript" -> "nodejs-with-typescript"
 */
function stackToFilename(stack: string): string {
  return stack
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Creates the main project README.md content
 */
function createProjectReadme(
  projectTitle: string,
  projectDescription: string
): string {
  const projectId = getIdProvider().generateId();
  return `---
id: ${projectId}
type: project
---

# ${projectTitle}

${projectDescription}
`;
}

/**
 * Creates the implementation markdown file content
 */
function createImplementationFile(
  projectTitle: string,
  stackName: string,
  stackDescription: string
): string {
  const implId = getIdProvider().generateId();
  return `---
id: ${implId}
type: implementation
---

# ${stackName} Implementation of ${projectTitle}

${stackDescription}
`;
}

/**
 * Initializes a new ZAMM project with the expected directory structure
 */
export async function initProject(
  options: InitProjectOptions = {}
): Promise<void> {
  const promptService = getPromptService();

  // Gather project information through prompts or options
  const projectTitle =
    options.projectTitle ||
    (await promptService.question('What is the project title? '));

  if (!projectTitle.trim()) {
    throw new Error('Project title cannot be empty');
  }

  const projectDescription =
    options.projectDescription ||
    (await promptService.question('What is this project about? '));

  if (!projectDescription.trim()) {
    throw new Error('Project description cannot be empty');
  }

  const initialStack =
    options.initialStack ||
    (await promptService.question(
      'What is the initial stack/implementation? '
    ));

  if (!initialStack.trim()) {
    throw new Error('Initial stack cannot be empty');
  }

  // Generate directory and file names
  const projectDirName = titleToDirectoryName(projectTitle);
  const stackFilename = stackToFilename(initialStack);

  // Create project structure
  const projectMetaPath = path.join(process.cwd(), projectDirName);
  const basePath = path.join(projectMetaPath, 'base');
  const docsPath = path.join(basePath, 'docs');
  const implsPath = path.join(docsPath, 'impls');

  // Check if project already exists
  if (fs.existsSync(projectMetaPath)) {
    throw new Error(`Project directory already exists: ${projectMetaPath}`);
  }

  // Create directory structure
  fs.mkdirSync(basePath, { recursive: true });
  fs.mkdirSync(implsPath, { recursive: true });

  // Initialize Git repository
  execSync('git init', { cwd: basePath, stdio: 'pipe' });

  // Create README.md
  const readmePath = path.join(docsPath, 'README.md');
  const readmeContent = createProjectReadme(projectTitle, projectDescription);
  fs.writeFileSync(readmePath, readmeContent, 'utf8');

  // Create implementation file
  const implPath = path.join(implsPath, `${stackFilename}.md`);
  const implContent = createImplementationFile(
    projectTitle,
    initialStack,
    initialStack
  );
  fs.writeFileSync(implPath, implContent, 'utf8');

  // Copy project-setup.md from resources
  const projectSetupDestPath = path.join(docsPath, 'project-setup.md');
  fs.copyFileSync(PROJECT_SETUP_RESOURCE, projectSetupDestPath);

  // Make initial commit
  execSync('git add -A', { cwd: basePath, stdio: 'pipe' });
  execSync('git commit -m "Initial project setup"', {
    cwd: basePath,
    stdio: 'pipe',
  });

  // Print success message
  const readmeRelPath = path.join('docs', 'README.md');
  const projectSetupRelPath = path.join('docs', 'project-setup.md');
  const implRelPath = path.join('docs', 'impls', `${stackFilename}.md`);

  console.log('Project initialized successfully!');
  console.log('');
  console.log('Created:');
  console.log(`  ${path.join(projectDirName, 'base', readmeRelPath)}`);
  console.log(`  ${path.join(projectDirName, 'base', projectSetupRelPath)}`);
  console.log(`  ${path.join(projectDirName, 'base', implRelPath)}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  cd ${path.join(projectDirName, 'base')}`);
  console.log(`  zamm init scripts --impl ${implRelPath}`);
}
