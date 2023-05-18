const { ethers } = require("ethers");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { ChainId } = require("@biconomy/core-types");
const SmartAccount = require("@biconomy/smart-account").default;

const privateKey = "pkey";
const rpcUrl = "https://eth-goerli.biconomy.io";

async function main() {
  let provider = new HDWalletProvider(privateKey, rpcUrl);
  const walletProvider = new ethers.providers.Web3Provider(provider);
  // get EOA address from wallet provider
  const eoa = await walletProvider.getSigner().getAddress();
  console.log(`EOA address: ${eoa}`);

  // get SmartAccount address from wallet provider
  const wallet = new SmartAccount(walletProvider, {
    activeNetworkId: ChainId.POLYGON_MUMBAI,
    supportedNetworksIds: [
      ChainId.GOERLI,
      ChainId.POLYGON_MAINNET,
      ChainId.POLYGON_MUMBAI,
    ],
  });
  const smartAccount = await wallet.init();
  const address = await smartAccount.getSmartAccountAddress(eoa);
  const isDeployed = await smartAccount.isDeployed();

  const res = await smartAccount.sendTransaction({
    transaction: {
      to: "0xDbfA076EDBFD4b37a86D1d7Ec552e3926021fB97",
      value: ethers.utils.hexValue(ethers.utils.parseUnits("0.001", "ether")),
      gasLimit: ethers.utils.hexValue(91000),
    },
  });

  console.log(res);

  console.log(address);
  console.log(isDeployed);

  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
