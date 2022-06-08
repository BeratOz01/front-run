const ethers = require("ethers");

// Helpers
const { error, success, decideFunction, info, trace } = require("./helpers");

// .env Configuration
require("dotenv").config();

// Constant
const TraderJOERouterAddress = "0x60ae616a2155ee3d9a68541ba4544862310933d4";

// Environment Variables
const { PROVIDER_URL, PRIVATE_KEY } = process.env;

// Import ABI for router contract of TraderJOE
const { abi } = require("./abi/router.json");

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
  const interface = new ethers.utils.Interface(abi);

  provider.on("pending", (tx) => {
    provider.getTransaction(tx).then(async (transaction) => {
      // Checking if the transaction is valid and TraderJOERouter transaction
      if (
        transaction &&
        String(transaction.to).toLowerCase() == TraderJOERouterAddress
      ) {
        const value = ethers.utils.formatEther(transaction.value.toString());

        if (parseFloat(value) > 0.1) {
          // Information about the transaction
          const { value, gasLimit, gasPrice, from } = transaction;
          info("Value     =>", ethers.utils.formatEther(value));
          info("Gas Limit =>", gasLimit, "gas");
          info("Gas Price =>", gasPrice, "wei");
          info("From      =>", from);

          // Decode the data with helper function - decideFunction
          const data = transaction.data;
          const result = decideFunction(interface, data);

          trace("Transaction hash =>", transaction.hash);
          // Checking if the result is empty
          if (result.length > 0) {
            const tokenAddress = result[1][1];
          } else {
            console.log("Another transaction");
          }
        }
      }
    });
  });
};

init();
