const { ethers } = require("ethers");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { ChainId } = require("@biconomy/core-types");
const SmartAccount = require("@biconomy/smart-account").default;

const privateKey = "pkey";
const rpcUrl = "https://rpc.ankr.com/polygon_mumbai/";

const initSmartAccount = async () => {
  let provider = new HDWalletProvider(privateKey, rpcUrl);
  const walletProvider = new ethers.providers.Web3Provider(provider);
  // get EOA address from wallet provider
  const eoa = await walletProvider.getSigner().getAddress();
  console.log(`EOA address: ${eoa}`);

  const wallet = new SmartAccount(walletProvider, {
    activeNetworkId: ChainId.POLYGON_MUMBAI,
    supportedNetworksIds: [
      // ChainId.GOERLI,
      // ChainId.POLYGON_MAINNET,
      ChainId.POLYGON_MUMBAI,
    ],
    networkConfig: [
      {
        chainId: ChainId.POLYGON_MUMBAI,
        dappAPIKey: "WOFDu_1es.48cd556e-5929-4c6c-814c-2477a10ab976",
      },
    ],
  });
  const smartAccount = await wallet.init();

  return { smartAccount, eoa };
};

const send = async () => {
  try {
    const { eoa, smartAccount } = await initSmartAccount();

    const address = await smartAccount.getSmartAccountAddress(eoa);
    console.log(address);

    const res = await smartAccount.sendTransaction({
      transaction: {
        to: "0xDbfA076EDBFD4b37a86D1d7Ec552e3926021fB97",
        value: ethers.utils.hexValue(ethers.utils.parseUnits("0.001", "ether")),
        gasLimit: ethers.utils.hexValue(91000),
      },
    });

    const txReciept = await res.wait();
    console.log("Tx hash", txReciept.transactionHash);
  } catch (error) {
    console.log(error);
  }
};

const sendWithErc20 = async () => {
  try {
    const { smartAccount } = await initSmartAccount();

    const res = await smartAccount.createUserPaidTransaction({
      transaction: {
        to: "0xDbfA076EDBFD4b37a86D1d7Ec552e3926021fB97",
        value: ethers.utils.hexValue(ethers.utils.parseUnits("0.001", "ether")),
        gasLimit: ethers.utils.hexValue(91000),
      },
      chainId: ChainId.POLYGON_MUMBAI,
      feeQuote: {
        address: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
        decimal: "18",
        symbol: "DERC20",
        tokenGasPrice: 10,
      },
    });

    const res1 = await smartAccount.sendUserPaidTransaction({
      tx: res,
      chainId: ChainId.POLYGON_MUMBAI,
    });
    console.log(res1);
  } catch (error) {
    console.log(error);
  }
};

sendWithErc20().catch(error => {
  console.error(error);
  process.exit(1);
});
