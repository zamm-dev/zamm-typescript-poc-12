#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';

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

program.parse();
