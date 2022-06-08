const ethers = require("ethers");

// Helpers
const {
  error,
  success,
  decideFunction,
  info,
  trace,
  isStableCoin,
  calculateGasPrice,
  ROUTER,
  ERC20,
} = require("./helpers");

// .env Configuration
require("dotenv").config();

// Constant
const TraderJOERouterAddress = process.env.TraderJOERouterAddress;
const TraderJOEFactoryAddress = process.env.TraderJOEFactoryAddress;
const WAVAX = process.env.WAVAX;

const ONE_GWEI = 1e9;

// Environment Variables
const { PROVIDER_URL, PRIVATE_KEY } = process.env;

// Import INTERFACE for router contract of TraderJOE
const { INTERFACE } = require("./abi/router.json");

// Function for buying tokens
const buyTokens = async (account, tokenAddress, gasLimit, gasPrice) => {
  // How much are we going to buy ?
  const buyAmount = 0.05;

  // Slippage
  const slippage = 0;

  let amountOut = 0;

  // Calculate the amount of tokens we are going to buy
  const amountIn = ethers.utils.parseUnits(buyAmount.toString(), "ether");

  // Calculate the amount of tokens we are going to buy
  const amounts = await ROUTER(account).getAmountsOut(amountIn, [
    WAVAX,
    tokenAddress,
  ]);

  // Print the information about the transaction we are going to buy
  info("Expected amount out =>", amounts[1].toString());
  info("From token address  =>", tokenAddress);
  info("-------------------------------------");

  // Second element of amount array will be the amount out of the token
  const amountOutMin = amounts[1].toString();

  const tx = await ROUTER(
    account
  ).swapExactAVAXForTokensSupportingFeeOnTransferTokens(
    amountOutMin,
    [WAVAX.toString(), tokenAddress.toString()],
    account.address,
    Date.now() + 2000 * 60 * 10,
    {
      value: amountIn.toString(),
      gasPrice: ethers.BigNumber.from(gasPrice).toHexString(),
      gasLimit: ethers.BigNumber.from(gasLimit).toHexString(),
    }
  );

  const receipt = await tx.wait();
  console.log(receipt);

  return amountOut;
};

// Function for selling tokens
const sellTokens = async (
  amount,
  account,
  tokenAddress,
  gasLimit = 0,
  gasPrice = 0
) => {
  // We are going to sell all of our tokens
  // const amountIn = await ERC20(tokenAddress).balanceOf(account.address);
  const amountIn = amount.toString();

  const amounts = await ROUTER(account).getAmountsOut(amountIn, [
    tokenAddress,
    WAVAX,
  ]);

  const approve = await ERC20(tokenAddress, account).approve(
    TraderJOERouterAddress,
    amountIn
  );

  const approveReceipt = await approve.wait();
  console.log(approveReceipt);

  const tx = await ROUTER(
    account
  ).swapExactTokensForAVAXSupportingFeeOnTransferTokens(amountIn, amounts[0], [
    [tokenAddress, WAVAX],
    account.address,
    Date.now() + 1000 * 60 * 10,
    {
      gasPrice: ethers.BigNumber.from(gasPrice).toHexString(),
      gasLimit: ethers.BigNumber.from(gasLimit).toHexString(),
    },
  ]);

  trace("Expected amount out =>", amounts);
};

const init = async () => {
  // Create a new provider
  const provider = new ethers.providers.WebSocketProvider(PROVIDER_URL);

  // Create a new wallet
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Get the address of the wallet
  const address = await wallet.getAddress();

  success("Wallet Address =>", address);

  // Connect wallet to provider (for signing transactions)
  const account = wallet.connect(provider);

  // Get chain ID
  const chainId = await account.getChainId();

  success("Account connected successfully to provider =>", chainId);

  // Create new interface for decode function data
  const interface = new ethers.utils.Interface(INTERFACE);

  let isSandwiching = false;
  provider.on("pending", (tx) => {
    provider.getTransaction(tx).then(async (transaction) => {
      // Checking if the transaction is valid and TraderJOERouter transaction
      if (
        transaction &&
        String(transaction.to).toLowerCase() == TraderJOERouterAddress
      ) {
        const value = ethers.utils.formatEther(transaction.value.toString());

        if (parseFloat(value) > 1 && !isSandwiching) {
          // Information about the transaction
          const { value, gasLimit, gasPrice, from } = transaction;
          info("Value     =>", ethers.utils.formatEther(value));
          info("Gas Limit =>", gasLimit.toString(), "gas");
          info("Gas Price =>", gasPrice, "wei");
          info("From      =>", from);

          // Decode the data with helper function - decideFunction
          const data = transaction.data;
          const result = decideFunction(interface, data);

          trace("Transaction hash =>", transaction.hash);
          // Checking if the result is empty
          if (result.length > 0) {
            const tokenAddress = result[1][1];

            // Checking if the token address is stable coin
            if (isStableCoin(tokenAddress)) {
              error("Token Address", tokenAddress, "is stable coin!");
              return;
            }

            // Checking if the token address is valid
            if (tokenAddress.length != 42) {
              error("Token Address", tokenAddress, "is invalid!");
              return;
            }

            // Calculate gas for buying and selling transactions
            //    - For buying transactions, the gas must be greater than the gas of the victim transaction
            //    - For selling transactions, the gas must be less than the value of the victim transaction

            // Calculate gas for buying transaction
            isSandwiching = true;
            const gasPriceBuy = calculateGasPrice("+", gasPrice.toString(), 10);
            const gasPriceSell = calculateGasPrice(
              "-",
              gasPrice.toString(),
              10
            );

            const amountOut = await buyTokens(
              account,
              tokenAddress,
              gasLimit,
              gasPriceBuy
            );

            sellTokens(
              amountOut,
              account,
              tokenAddress,
              gasLimit,
              gasPriceSell
            );
          } else {
            info("Another transaction");
          }
        } else {
          error("Transaction value is too low", value);
        }
      }
    });
  });
};

init();
