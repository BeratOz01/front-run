const chalk = require("chalk");

const log = console.log;

// Constant array of stable coins addresses
const stableCoins = [
  "0xc7198437980c041c805a1edcba50c1ce5db95118", // TetherUSD
  "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", // TetherToken,
  "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", // USDC.e
  "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", // USDC
  "0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98", // BUSD
  "0xd586e7f844cea2f87f50152665bcbc2c279d8d70", // DAI
  "0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64", // FRAX Token
  "0x1c20e891bab6b1727d14da358fae2984ed9b59eb", // True USD
];

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

const calculateGas = (operation, amount) => {};

const isStableCoin = (address) => {
  return stableCoins.includes(String(address).toLowerCase());
};

module.exports = { error, success, info, trace, decideFunction, isStableCoin };
