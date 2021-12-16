"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const CryptorCli_1 = require("./cli/CryptorCli");
const program = new commander_1.Command();
CryptorCli_1.CryptorCli.prepCommand(program);
CryptorCli_1.CryptorCli.run(program);
//# sourceMappingURL=Cli.js.map