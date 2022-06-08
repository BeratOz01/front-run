const chalk = require("chalk");

const log = console.log;

const error = (msg, ...optional) => {
  let tempStr = msg;
  if (optional.length > 0) tempStr = `${msg} ${optional.join(" ")}`;
  log(chalk.red(tempStr));
};

const success = (msg, ...optional) => {
  let tempStr = msg;
  if (optional.length > 0) tempStr = `${msg} ${optional.join(" ")}`;
  log(chalk.green(tempStr));
};

const info = (msg, ...optional) => {
  let tempStr = msg;
  if (optional.length > 0) tempStr = `${msg} ${optional.join(" ")}`;
  log(chalk.blue(tempStr));
};

const trace = (msg, ...optional) => {
  let tempStr = msg;
  if (optional.length > 0) tempStr = `${msg} ${optional.join(" ")}`;
  log(chalk.magenta(tempStr));
};

const decideFunction = (interface, data) => {
  let result = []; // Empty array for verification

  // Decode the data
  try {
    result = interface.decodeFunctionData("swapAVAXForExactTokens", data);
  } catch (e) {
    try {
      result = interface.decodeFunctionData("swapExactAVAXForTokens", data);
    } catch (e) {
      try {
        result = interface.decodeFunctionData(
          "swapExactAVAXForTokensSupportingFeeOnTransferTokens",
          data
        );
      } catch (e) {}
    }
  }

  return result;
};

module.exports = { error, success, info, trace, decideFunction };
