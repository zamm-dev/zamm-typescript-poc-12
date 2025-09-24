#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
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
  ImplementOptions,
  splitFile,
  SplitOptions,
  featStart,
  FeatStartOptions,
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

function organizeFileWithErrorHandling(filePath?: string): void {
  try {
    if (filePath) {
      organizeFile(filePath);
      console.log(chalk.green(`✓ Organized ${filePath}`));
    } else {
      organizeAllFiles();
      console.log(chalk.green('✓ Organized all files in docs/'));
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

function infoWithErrorHandling(idOrPath: string): void {
  try {
    const info = getInfoByIdOrPath(idOrPath);
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

function splitWithErrorHandling(
  mainFile: string,
  options: { into: string[] }
): void {
  try {
    const fileNames = Array.isArray(options.into)
      ? options.into
      : [options.into];

    const splitOptions: SplitOptions = {
      mainFilePath: mainFile,
      newFileNames: fileNames,
    };

    splitFile(splitOptions);

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

function implementWithErrorHandling(options: {
  spec: string;
  for: string;
}): void {
  try {
    const implementOptions: ImplementOptions = {
      specIdOrPath: options.spec,
      implIdOrPath: options.for,
    };
    const newFilePath = generateImplementationNote(implementOptions);
    console.log(
      chalk.green(`✓ Created reference implementation: ${newFilePath}`)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

function recordCommitsWithErrorHandling(
  idOrPath: string,
  options: { lastNCommits: number }
): void {
  try {
    recordCommits(idOrPath, options.lastNCommits);
    console.log(
      chalk.green(`✓ Recorded ${options.lastNCommits} commit(s) to ${idOrPath}`)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}

function recordSpecCommitsWithErrorHandling(
  idOrPath: string,
  options: { lastNCommits: number }
): void {
  try {
    recordSpecCommits(idOrPath, options.lastNCommits);
    console.log(
      chalk.green(`✓ Recorded ${options.lastNCommits} commit(s) to ${idOrPath}`)
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

export { setIdProvider, resetIdProvider };

program.parse();
