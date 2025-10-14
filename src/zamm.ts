#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import { version } from '../package.json';
import {
  organizeFile,
  organizeAllFiles,
  setIdProvider,
  resetIdProvider,
  getInfoByIdOrPath,
  generateImplementationNote,
  recordCommits,
  recordSpecCommits,
  createSpecChangelog,
  ImplementOptions,
  CreateSpecChangelogOptions,
  splitFile,
  SplitOptions,
  featStart,
  FeatStartOptions,
  setRedirect,
  RedirectOptions,
  installInitScripts,
  initProject,
  InitProjectOptions,
} from './core/index';

const program = new Command();

program
  .name('zamm')
  .description(
    'ZAMM - Zen and the Automation of Metaprogramming for the Masses'
  )
  .version(version);

program
  .command('hello')
  .description('Say hello from ZAMM')
  .action(() => {
    console.log(chalk.green('Hello from ZAMM!'));
    console.log(
      chalk.blue('Zen and the Automation of Metaprogramming for the Masses')
    );
  });

async function organizeFileWithErrorHandling(filePath?: string): Promise<void> {
  try {
    if (filePath) {
      await organizeFile(filePath);
      console.log(chalk.green(`✓ Organized ${filePath}`));
    } else {
      await organizeAllFiles();
      console.log(chalk.green('✓ Organized all files in configured directory'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error organizing: ${errorMessage}`));
    process.exit(1);
  }
}

program
  .command('organize')
  .alias('o')
  .description('Add proper YAML frontmatter to markdown files')
  .argument(
    '[file]',
    'file to organize (if not provided, organizes all files in docs/)'
  )
  .action(organizeFileWithErrorHandling);

async function infoWithErrorHandling(idOrPath: string): Promise<void> {
  try {
    const info = await getInfoByIdOrPath(idOrPath);
    console.log(info);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

program
  .command('info')
  .description('Display structured information about a file by ID or path')
  .argument('<id-or-path>', 'file ID or file path to get information about')
  .action(infoWithErrorHandling);

async function splitWithErrorHandling(
  mainFile: string,
  options: { into: string[] }
): Promise<void> {
  try {
    const fileNames = Array.isArray(options.into)
      ? options.into
      : [options.into];

    const splitOptions: SplitOptions = {
      mainFilePath: mainFile,
      newFileNames: fileNames,
    };

    await splitFile(splitOptions);

    console.log(
      chalk.green(`✓ Split ${mainFile} into ${fileNames.length} file(s)`)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

program
  .command('split')
  .description('Split content from a main file into new separate files')
  .argument('<main-file>', 'main file to split')
  .requiredOption('--into <filenames...>', 'new filenames to split off')
  .action(splitWithErrorHandling);

async function implementWithErrorHandling(options: {
  spec: string;
  for: string;
  filename?: string;
}): Promise<void> {
  try {
    const implementOptions: ImplementOptions = {
      specIdOrPath: options.spec,
      implIdOrPath: options.for,
      filename: options.filename,
    };
    const newFilePath = await generateImplementationNote(implementOptions);
    console.log(
      chalk.green(`✓ Created reference implementation: ${newFilePath}`)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

async function recordCommitsWithErrorHandling(
  idOrPath: string,
  options: { lastNCommits: number }
): Promise<void> {
  try {
    await recordCommits(idOrPath, options.lastNCommits);
    console.log(
      chalk.green(`✓ Recorded ${options.lastNCommits} commit(s) to ${idOrPath}`)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

async function recordSpecCommitsWithErrorHandling(
  idOrPath: string,
  options: { lastNCommits: number }
): Promise<void> {
  try {
    await recordSpecCommits(idOrPath, options.lastNCommits);
    console.log(
      chalk.green(`✓ Recorded ${options.lastNCommits} commit(s) to ${idOrPath}`)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

async function createSpecChangelogWithErrorHandling(
  filepath: string,
  options: { description?: string; title?: string }
): Promise<void> {
  try {
    const createOptions: CreateSpecChangelogOptions = { filepath };
    if (options.description !== undefined) {
      createOptions.description = options.description;
    }
    if (options.title !== undefined) {
      createOptions.title = options.title;
    }
    const createdFilePath = await createSpecChangelog(createOptions);
    console.log(chalk.green(`✓ Created spec changelog: ${createdFilePath}`));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

async function initScriptsWithErrorHandling(options: {
  impl: string;
}): Promise<void> {
  try {
    const result = await installInitScripts({ implIdOrPath: options.impl });
    const devDirDisplay =
      path.relative(process.cwd(), result.devDir) || result.devDir;
    const commandsDirDisplay =
      path.relative(process.cwd(), result.claudeCommandsDir) ||
      result.claudeCommandsDir;

    console.log(
      chalk.green(
        `✓ Installed dev scripts to ${devDirDisplay} and Claude commands to ${commandsDirDisplay}`
      )
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

const implCommand = program
  .command('impl')
  .alias('i')
  .description('Implementation management commands');

implCommand
  .command('create')
  .description(
    'Generate reference implementation file for a spec and implementation'
  )
  .requiredOption('--spec <spec>', 'spec file ID or path')
  .requiredOption('--for <impl>', 'implementation file ID or path')
  .option('--filename <filename>', 'custom filename for the generated file')
  .action(implementWithErrorHandling);

implCommand
  .command('record')
  .description('Record commit hashes in implementation file')
  .requiredOption(
    '--last-n-commits <n>',
    'number of recent commits to record',
    parseInt
  )
  .argument(
    '<id-or-path>',
    'reference implementation ID or file path to update'
  )
  .action(recordCommitsWithErrorHandling);

async function initProjectWithErrorHandling(options: {
  projectTitle?: string;
  projectDescription?: string;
  initialStack?: string;
}): Promise<void> {
  try {
    const initOptions: InitProjectOptions = {};
    if (options.projectTitle !== undefined) {
      initOptions.projectTitle = options.projectTitle;
    }
    if (options.projectDescription !== undefined) {
      initOptions.projectDescription = options.projectDescription;
    }
    if (options.initialStack !== undefined) {
      initOptions.initialStack = options.initialStack;
    }
    await initProject(initOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

const initCommand = program
  .command('init')
  .description('Project initialization utilities');

initCommand
  .command('project')
  .description('Set up a new ZAMM project with worktree structure')
  .option('--project-title <title>', 'project title')
  .option('--project-description <description>', 'project description')
  .option('--initial-stack <stack>', 'initial stack/implementation')
  .action(initProjectWithErrorHandling);

initCommand
  .command('scripts')
  .description(
    'Install dev scripts and Claude commands tailored to an implementation'
  )
  .requiredOption('--impl <impl>', 'implementation file ID or path')
  .action(initScriptsWithErrorHandling);

async function featStartWithErrorHandling(args: string[]): Promise<void> {
  try {
    const description = args.join(' ');
    if (!description.trim()) {
      throw new Error('Description is required');
    }

    const featOptions: FeatStartOptions = {
      description: description.trim(),
    };

    await featStart(featOptions);
    console.log(chalk.green('✓ Feature started successfully'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

const featCommand = program
  .command('feat')
  .description('Feature lifecycle management commands');

featCommand
  .command('start')
  .description('Start a new feature with worktree and spec file')
  .argument('<description...>', 'feature description')
  .action(featStartWithErrorHandling);

const specCommand = program
  .command('spec')
  .description('Specification management commands');

specCommand
  .command('record')
  .description('Record commit hashes in spec file')
  .requiredOption(
    '--last-n-commits <n>',
    'number of recent commits to record',
    parseInt
  )
  .argument('<id-or-path>', 'spec ID or file path to update')
  .action(recordSpecCommitsWithErrorHandling);

specCommand
  .command('changelog')
  .description('Create a new spec changelog file')
  .argument(
    '<filepath>',
    'file path for the new spec (spec-history/ will be prepended if not present)'
  )
  .option('--description <text>', 'description of the spec change')
  .option('--title <text>', 'title for the changelog entry')
  .action(createSpecChangelogWithErrorHandling);

async function redirectWithErrorHandling(directory: string): Promise<void> {
  try {
    const redirectOptions: RedirectOptions = { directory };
    await setRedirect(redirectOptions);
    console.log(chalk.green(`✓ Set redirect directory to: ${directory}`));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

program
  .command('redirect')
  .description('Set a custom base directory instead of docs/')
  .argument('<directory>', 'directory to use as base instead of docs/')
  .action(redirectWithErrorHandling);

export { setIdProvider, resetIdProvider };

program.parse();
