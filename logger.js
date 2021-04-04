const chalk = require('chalk');
const ui = require('cliui')();
module.exports = {
  v(s) {
    // verbose
    console.log(s);
  },
  i(s) {
    // info
    ui.div(chalk.green('[info]: ') + s);
    console.log(ui.toString());
  },
  e(s) {
    // error
    ui.div(chalk.red('[error]: ') + s);
    console.log(ui.toString());
  },
  w(s) {
    //warn
    ui.div(chalk.keyword('orange')('[warn]: ') + s);
    console.log(ui.toString());
  },
};
