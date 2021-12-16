import { Command } from 'commander';
import { CryptorCli } from './cli/CryptorCli';

const program = new Command();
CryptorCli.prepCommand(program);
CryptorCli.run(program);