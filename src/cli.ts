#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';
import { organizeFile, setIdProvider, resetIdProvider } from './organizer';

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

function organizeFileWithErrorHandling(filePath: string): void {
  try {
    organizeFile(filePath);
    console.log(chalk.green(`✓ Organized ${filePath}`));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error organizing file: ${errorMessage}`));
    process.exit(1);
  }
}

program
  .command('organize')
  .alias('o')
  .description('Add proper YAML frontmatter to markdown files')
  .argument('<file>', 'file to organize')
  .action(organizeFileWithErrorHandling);

export { setIdProvider, resetIdProvider };

program.parse();
