const chalk = require("chalk");
const ethers = require("ethers");

const log = console.log;

// .env Configuration
require("dotenv").config();

// Constant
const TraderJOERouterAddress = process.env.TraderJOERouterAddress;
const TraderJOEFactoryAddress = process.env.TraderJOEFactoryAddress;
const WAVAX = process.env.WAVAX;

// Import INTERFACE for router contract of TraderJOE
const { ABI } = require("../abi/router.json");

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

const calculateGasPrice = (operation, gas, amount) => {
  if (operation == "+") {
    return Math.floor(parseInt(gas) + parseInt(amount));
  } else {
    return Math.floor(parseInt(gas) + parseInt(amount));
  }
};

const isStableCoin = (address) => {
  return stableCoins.includes(String(address).toLowerCase());
};

const ROUTER = (account) => {
  return new ethers.Contract(TraderJOERouterAddress, ABI, account);
};

const ERC20 = (address, account) => {
  return new ethers.Contract(
    address,
    [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        payable: false,
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    account
  );
};

module.exports = {
  error,
  success,
  info,
  trace,
  decideFunction,
  isStableCoin,
  calculateGasPrice,
  ROUTER,
  ERC20,
};
