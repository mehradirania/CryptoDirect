class CryptoPayment {
  constructor() {
    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;
    this.walletName = null;
    this.adapter = null;
    this.init();
  }

  async init() {
    await this.checkWalletConnection();
  }

  async checkWalletConnection() {
    try {
      if (window.tronWeb?.ready) {
        this.tronWeb = window.tronWeb;
        this.walletAddress = this.tronWeb.defaultAddress?.base58;

        if (this.walletAddress) {
          this.connected = true;
          this.walletName = "TronLink";
          this.updateWalletUI();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async connectWallet() {
    return new Promise((resolve) => {
      this.showWalletSelector(resolve);
    });
  }

  showWalletSelector(resolve) {
    const old = document.getElementById("walletSelector");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "walletSelector";

    overlay.innerHTML = `
      <div style="
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.7);
        z-index:999999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      ">
        <div style="
          width:100%;
          max-width:390px;
          background:#fff;
          border-radius:20px;
          padding:22px;
          box-sizing:border-box;
          font-family:Arial,sans-serif;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:20px;
          ">
            <strong style="font-size:21px;">
              Connect Wallet
            </strong>

            <button id="walletClose" style="
              border:0;
              background:none;
              font-size:28px;
              cursor:pointer;
            ">×</button>
          </div>

          <button id="walletTronLink" class="wallet-option">
            🔴 <span>TronLink</span>
          </button>

          <button id="walletTrust" class="wallet-option">
            🔵 <span>Trust Wallet</span>
          </button>

          <button id="walletMore" class="wallet-option">
            ➕ <span>More Wallets</span>
          </button>

          <div id="walletStatus" style="
            margin-top:14px;
            text-align:center;
            color:#666;
            font-size:13px;
          "></div>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const style = document.createElement("style");

    style.textContent = `
      .wallet-option {
        width:100%;
        display:flex;
        align-items:center;
        gap:12px;
        padding:16px;
        margin-bottom:10px;
        border:1px solid #ddd;
        border-radius:13px;
        background:#fff;
        cursor:pointer;
        font-size:16px;
        text-align:left;
      }

      .wallet-option:hover {
        background:#f5f5f5;
      }
    `;

    document.head.appendChild(style);

    const close = () => {
      overlay.remove();
      resolve(false);
    };

    document.getElementById("walletClose").onclick = close;

    document.getElementById("walletTronLink").onclick =
      async () => {
        const result = await this.connectTronLink();

        if (result) {
          overlay.remove();
          resolve(true);
        }
      };

    document.getElementById("walletTrust").onclick =
      async () => {
        await this.connectTrustWallet();
      };

    document.getElementById("walletMore").onclick =
      async () => {
        await this.connectMoreWallets();
      };
  }

  async connectTronLink() {
    try {
      if (!window.tronLink && !window.tron) {
        this.openTronLink();
        return false;
      }

      if (window.tron) {
        try {
          await window.tron.request({
            method: "eth_requestAccounts"
          });
        } catch (e) {
          await window.tronLink?.request({
            method: "tron_requestAccounts"
          });
        }
      } else {
        await window.tronLink.request({
          method: "tron_requestAccounts"
        });
      }

      await new Promise(r => setTimeout(r, 700));

      const tronWeb =
        window.tron?.tronWeb ||
        window.tronWeb;

      if (!tronWeb?.ready) {
        throw new Error("TronLink is not ready");
      }

      const address =
        tronWeb.defaultAddress?.base58;

      if (!address) {
        throw new Error("Wallet address unavailable");
      }

      this.tronWeb = tronWeb;
      this.walletAddress = address;
      this.walletName = "TronLink";
      this.connected = true;

      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error("TronLink error:", error);

      this.showWalletStatus(
        "اتصال به TronLink انجام نشد."
      );

      return false;
    }
  }

  async connectTrustWallet() {
    try {
      const status =
        document.getElementById("walletStatus");

      if (status) {
        status.textContent =
          "در حال باز کردن Trust Wallet...";
      }

      const currentUrl =
        window.location.href;

      const trustUrl =
        "https://link.trustwallet.com/open_url?url=" +
        encodeURIComponent(currentUrl);

      window.location.href = trustUrl;

    } catch (error) {
      console.error(
        "Trust Wallet error:",
        error
      );

      this.showWalletStatus(
        "اتصال به Trust Wallet انجام نشد."
      );
    }
  }

  async connectMoreWallets() {
    this.showWalletStatus(
      "در حال بررسی کیف پول‌های سازگار..."
    );

    try {
      if (
        window.TronWalletAdapter &&
        typeof window.TronWalletAdapter === "object"
      ) {
        this.showWalletStatus(
          "کیف پول‌های بیشتر در حال آماده‌سازی هستند."
        );
        return;
      }

      this.showWalletStatus(
        "برای کیف پول‌های بیشتر باید WalletConnect فعال شود."
      );

    } catch (error) {
      console.error(error);

      this.showWalletStatus(
        "امکان اتصال کیف پول بیشتر وجود ندارد."
      );
    }
  }

  showWalletStatus(message) {
    const status =
      document.getElementById("walletStatus");

    if (status) {
      status.textContent = message;
    }
  }

  openTronLink() {
    const url = window.location.href;

    const deepLink =
      "tronlinkoutside://call?url=" +
      encodeURIComponent(url);

    window.location.href = deepLink;
  }

  disconnectWallet() {
    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;
    this.walletName = null;

    this.updateWalletUI();
  }

  updateWalletUI() {
    const dot =
      document.getElementById("walletDot");

    const text =
      document.getElementById("walletText");

    const button =
      document.getElementById("connectWalletBtn");

    if (!text || !button) return;

    if (this.connected && this.walletAddress) {
      dot?.classList.remove("disconnected");

      const short =
        this.walletAddress.substring(0, 6) +
        "..." +
        this.walletAddress.substring(
          this.walletAddress.length - 4
        );

      text.textContent =
        `${this.walletName || "Wallet"}: ${short}`;

      button.textContent = "Disconnect";
    } else {
      dot?.classList.add("disconnected");

      text.textContent =
        "Wallet not connected";

      button.textContent =
        "Connect Wallet";
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
      throw new Error(
        "Wallet is not connected"
      );
    }

    if (!this.tronWeb.isAddress(toAddress)) {
      throw new Error(
        "Invalid recipient address"
      );
    }

    if (
      !this.tronWeb.isAddress(
        usdtContractAddress
      )
    ) {
      throw new Error(
        "Invalid USDT contract address"
      );
    }

    const amountInSmallestUnit =
      BigInt(
        Math.round(
          Number(amount) *
          10 ** decimals
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
        const info =
          await this.tronWeb
            .trx
            .getTransactionInfo(txHash);

        if (
          info &&
          info.id === txHash &&
          info.receipt
        ) {
          return info.receipt.result ===
            "SUCCESS"
            ? "success"
            : "failed";
        }
      } catch (error) {
        console.error(error);
      }

      await new Promise(resolve =>
        setTimeout(
          resolve,
          CONFIG.TX_CHECK_INTERVAL
        )
      );
    }

    return "timeout";
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
