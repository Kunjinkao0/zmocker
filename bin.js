#!/usr/bin/env node
const chalk = require('chalk');
const ui = require('cliui')();
// const inquirer = require('inquirer');
const argv = require('minimist')(process.argv.slice(2));
const { startAPP, startAPPWithSingleFile } = require('./app');

ui.div(chalk.yellow('✨✨✨Welcome to ZMOCKER✨✨✨'));
console.log(ui.toString());

const fPath = argv?._?.[0];
const port = argv.port || 4399;
const apiFolder = argv['api-folder'];

if (fPath) {
  startAPPWithSingleFile(port, fPath);
} else {
  startAPP(port, apiFolder);
}
