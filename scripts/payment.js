/**
 * CryptoDirect Payment System
 * TRON / USDT TRC20
 */

class CryptoPayment {
  constructor() {
    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;

    this.init();
  }

  async init() {
    this.setupWalletListener();
    await this.checkWalletConnection();
  }

  async checkWalletConnection() {
    if (!window.tronWeb) return;

    try {
      if (window.tronWeb.ready) {
        this.tronWeb = window.tronWeb;
        this.walletAddress = this.tronWeb.defaultAddress.base58;

        if (this.walletAddress) {
          this.connected = true;
          this.updateWalletUI();
        }
      }
    } catch (error) {
      console.error('Wallet check error:', error);
    }
  }

  async connectWallet() {
    if (!window.tronLink) {
      alert('Please install TronLink wallet.');
      return false;
    }

    try {
      const result = await window.tronLink.request({
        method: 'tron_requestAccounts'
      });

      if (result && result.code !== 200) {
        throw new Error('Wallet connection rejected');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      if (!window.tronWeb || !window.tronWeb.ready) {
        throw new Error('TRON wallet is not ready');
      }

      this.tronWeb = window.tronWeb;
      this.walletAddress = this.tronWeb.defaultAddress.base58;
      this.connected = !!this.walletAddress;

      this.updateWalletUI();

      return this.connected;
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('❌ Could not connect to TronLink.');
      return false;
    }
  }

  disconnectWallet() {
    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;
    this.updateWalletUI();
  }

  setupWalletListener() {
    window.addEventListener('message', event => {
      if (
        event.data &&
        event.data.message &&
        event.data.message.action === 'accountsChanged'
      ) {
        this.checkWalletConnection();
      }
    });
  }

  updateWalletUI() {
    const walletDot = document.getElementById('walletDot');
    const walletText = document.getElementById('walletText');
    const connectBtn = document.getElementById('connectWalletBtn');

    if (!walletText || !connectBtn) return;

    if (this.connected && this.walletAddress) {
      walletDot?.classList.remove('disconnected');

      const shortAddress =
        this.walletAddress.substring(0, 6) +
        '...' +
        this.walletAddress.substring(this.walletAddress.length - 4);

      walletText.textContent = `Connected: ${shortAddress}`;
      connectBtn.textContent = 'Disconnect';
    } else {
      walletDot?.classList.add('disconnected');
      walletText.textContent = 'Wallet not connected';
      connectBtn.textContent = 'Connect Wallet';
    }
  }

  async sendUSDT(
    usdtContractAddress,
    toAddress,
    amount,
    decimals = 6
  ) {
    if (!this.connected || !this.tronWeb || !this.walletAddress) {
      throw new Error('Wallet is not connected');
    }

    if (!this.tronWeb.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    if (!this.tronWeb.isAddress(usdtContractAddress)) {
      throw new Error('Invalid USDT contract address');
    }

    const amountInSmallestUnit =
      BigInt(Math.round(Number(amount) * 10 ** decimals));

    const contract = await this.tronWeb.contract().at(
      usdtContractAddress
    );

    const tx = await contract
      .transfer(
        toAddress,
        amountInSmallestUnit.toString()
      )
      .send({
        feeLimit: 100_000_000
      });

    return tx;
  }

  async waitForTransaction(txHash, timeout = 120000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const transactionInfo =
          await this.tronWeb.trx.getTransactionInfo(txHash);

        if (
          transactionInfo &&
          transactionInfo.id === txHash &&
          transactionInfo.receipt
        ) {
          return transactionInfo.receipt.result === 'SUCCESS'
            ? 'success'
            : 'failed';
        }
      } catch (error) {
        console.error('Transaction check error:', error);
      }

      await new Promise(resolve =>
        setTimeout(resolve, CONFIG.TX_CHECK_INTERVAL)
      );
    }

    return 'timeout';
  }

  getWalletAddress() {
    return this.walletAddress;
  }

  isConnected() {
    return this.connected;
  }
}

const cryptoPayment = new CryptoPayment();
