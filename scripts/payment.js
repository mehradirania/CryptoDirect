/**
 * CryptoDirect Payment System
 * TRON / USDT TRC20
 */

class CryptoPayment {
  constructor() {
    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;
    this.adapter = null;

    this.init();
  }

  async init() {
    await this.checkWalletConnection();
  }

  async checkWalletConnection() {
    try {
      if (window.tronLink && window.tronWeb?.ready) {
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
    return new Promise((resolve) => {
      this.showWalletSelector(resolve);
    });
  }

  showWalletSelector(resolve) {
    const existing = document.getElementById('walletSelector');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'walletSelector';

    overlay.innerHTML = `
      <div style="
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.65);
        z-index:99999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      ">
        <div style="
          width:100%;
          max-width:380px;
          background:#fff;
          border-radius:18px;
          padding:22px;
          box-shadow:0 20px 60px rgba(0,0,0,.35);
          font-family:Arial,sans-serif;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:20px;
          ">
            <strong style="font-size:20px;">Connect Wallet</strong>
            <button id="closeWalletSelector" style="
              border:0;
              background:none;
              font-size:25px;
              cursor:pointer;
            ">×</button>
          </div>

          <button id="tronLinkWallet" style="
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            background:#fff;
            cursor:pointer;
            font-size:16px;
            text-align:left;
          ">🔴 TronLink</button>

          <button id="trustWallet" style="
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            background:#fff;
            cursor:pointer;
            font-size:16px;
            text-align:left;
          ">🔵 Trust Wallet</button>

          <button id="metaMaskWallet" style="
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            background:#fff;
            cursor:pointer;
            font-size:16px;
            text-align:left;
          ">🦊 MetaMask</button>

          <button id="moreWallets" style="
            width:100%;
            padding:15px;
            border:1px solid #ddd;
            border-radius:12px;
            background:#f5f5f5;
            cursor:pointer;
            font-size:16px;
            text-align:left;
          ">➕ More Wallets</button>

          <div id="walletSelectorStatus" style="
            margin-top:15px;
            text-align:center;
            font-size:13px;
            color:#666;
          "></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.remove();
      resolve(false);
    };

    document.getElementById('closeWalletSelector').onclick = close;

    document.getElementById('tronLinkWallet').onclick = async () => {
      const result = await this.connectTronLink();

      if (result) {
        overlay.remove();
        resolve(true);
      }
    };

    document.getElementById('trustWallet').onclick = () => {
      this.openTrustWallet();
    };

    document.getElementById('metaMaskWallet').onclick = () => {
      this.showStatus(
        'MetaMask اتصال مستقیم به TRON را پشتیبانی نمی‌کند.'
      );
    };

    document.getElementById('moreWallets').onclick = () => {
      this.showStatus(
        'پشتیبانی کیف پول‌های بیشتر به‌زودی اضافه می‌شود.'
      );
    };
  }

  showStatus(message) {
    const status = document.getElementById('walletSelectorStatus');

    if (status) {
      status.textContent = message;
    }
  }

  async connectTronLink() {
    try {
      if (!window.tronLink) {
        this.openTronLink();
        return false;
      }

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
      this.walletAddress =
        this.tronWeb.defaultAddress.base58;

      this.connected = !!this.walletAddress;

      this.updateWalletUI();

      return this.connected;

    } catch (error) {
      console.error('TronLink connection error:', error);

      this.showStatus(
        'اتصال به TronLink انجام نشد.'
      );

      return false;
    }
  }

  openTronLink() {
    const url = window.location.href;

    const deepLink =
      `tronlinkoutside://call?url=${encodeURIComponent(url)}`;

    window.location.href = deepLink;
  }

  openTrustWallet() {
    const url = window.location.href;

    const trustLink =
      `https://link.trustwallet.com/open_url?coin=195&url=${encodeURIComponent(url)}`;

    window.location.href = trustLink;
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
    const walletDot =
      document.getElementById('walletDot');

    const walletText =
      document.getElementById('walletText');

    const connectBtn =
      document.getElementById('connectWalletBtn');

    if (!walletText || !connectBtn) return;

    if (this.connected && this.walletAddress) {
      walletDot?.classList.remove('disconnected');

      const shortAddress =
        this.walletAddress.substring(0, 6) +
        '...' +
        this.walletAddress.substring(
          this.walletAddress.length - 4
        );

      walletText.textContent =
        `Connected: ${shortAddress}`;

      connectBtn.textContent = 'Disconnect';

    } else {
      walletDot?.classList.add('disconnected');

      walletText.textContent =
        'Wallet not connected';

      connectBtn.textContent =
        'Connect Wallet';
    }
  }

  async sendUSDT(
    usdtContractAddress,
    toAddress,
    amount,
    decimals = 6
  ) {
    if (
      !this.connected ||
      !this.tronWeb ||
      !this.walletAddress
    ) {
      throw new Error('Wallet is not connected');
    }

    if (!this.tronWeb.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    if (!this.tronWeb.isAddress(usdtContractAddress)) {
      throw new Error('Invalid USDT contract address');
    }

    const amountInSmallestUnit =
      BigInt(
        Math.round(
          Number(amount) * 10 ** decimals
        )
      );

    const contract =
      await this.tronWeb
        .contract()
        .at(usdtContractAddress);

    const tx =
      await contract
        .transfer(
          toAddress,
          amountInSmallestUnit.toString()
        )
        .send({
          feeLimit: 100_000_000
        });

    return tx;
  }

  async waitForTransaction(
    txHash,
    timeout = 120000
  ) {
    const startTime = Date.now();

    while (
      Date.now() - startTime < timeout
    ) {
      try {
        const transactionInfo =
          await this.tronWeb
            .trx
            .getTransactionInfo(txHash);

        if (
          transactionInfo &&
          transactionInfo.id === txHash &&
          transactionInfo.receipt
        ) {
          return transactionInfo.receipt.result ===
            'SUCCESS'
            ? 'success'
            : 'failed';
        }

      } catch (error) {
        console.error(
          'Transaction check error:',
          error
        );
      }

      await new Promise(resolve =>
        setTimeout(
          resolve,
          CONFIG.TX_CHECK_INTERVAL
        )
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

const cryptoPayment =
  new CryptoPayment();
