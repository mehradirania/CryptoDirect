/**
 * CryptoDirect Payment - BEP20 (Trust Wallet)
 * USDT on Binance Smart Chain
 */

class CryptoPaymentBEP20 {
  constructor() {
    this.connected = false;
    this.address = null;
    this.provider = null;
    this.web3 = null;

    this.chainId = 56; // BSC Mainnet
    this.usdtContract = CONFIG_BEP20.USDT_CONTRACT_ADDRESS;

    this.init();
  }

  async init() {
    // WalletConnect Provider
    this.provider = new WalletConnectProvider({
      projectId: CONFIG_BEP20.WC_PROJECT_ID,
      chains: [this.chainId],
      optionalChains: [this.chainId],
      rpcMap: {
        56: "https://bsc-dataseed.binance.org/"
      },
      metadata: {
        name: "CryptoDirect",
        description: "CryptoDirect BEP20 Payment",
        url: window.location.origin,
        icons: []
      }
    });
  }

  async connect() {
    try {
      await this.provider.connect();

      this.web3 = new Web3(this.provider);
      const accounts = await this.web3.eth.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet address returned");
      }

      this.address = accounts[0];
      this.connected = true;

      return this.address;

    } catch (err) {
      console.error("Trust Wallet connection error:", err);
      return null;
    }
  }

  async disconnect() {
    try {
      await this.provider.disconnect();
    } catch (e) {}

    this.connected = false;
    this.address = null;
    this.web3 = null;
  }

  isConnected() {
    return this.connected && this.address;
  }

  async sendUSDT(to, amount) {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    const decimals = CONFIG_BEP20.USDT_DECIMALS;
    const smallestUnit = BigInt(Math.floor(amount * 10 ** decimals));

    const contract = new this.web3.eth.Contract(CONFIG_BEP20.USDT_ABI, this.usdtContract);

    const tx = contract.methods.transfer(to, smallestUnit.toString());

    const gas = await tx.estimateGas({ from: this.address });

    const txData = {
      from: this.address,
      to: this.usdtContract,
      data: tx.encodeABI(),
      gas
    };

    const receipt = await this.web3.eth.sendTransaction(txData);

    if (!receipt || !receipt.transactionHash) {
      throw new Error("Transaction failed");
    }

    return receipt.transactionHash;
  }
}

const cryptoPaymentBEP20 = new CryptoPaymentBEP20();
