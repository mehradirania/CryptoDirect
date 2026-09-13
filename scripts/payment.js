class CryptoPayment {
  constructor() {
    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;
    this.walletName = null;
    this.walletAdapter = null;
    this.walletConnect = null;
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
      console.error("Wallet check error:", error);
    }
  }

  async connectWallet() {
    return new Promise(resolve => {
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
            <strong style="font-size:21px">
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
            🔴 TronLink
          </button>

          <button id="walletTrust" class="wallet-option">
            🔵 Trust Wallet
          </button>

          <button id="walletMore" class="wallet-option">
            ➕ More Wallets
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

    if (!document.getElementById("walletSelectorStyle")) {
      const style = document.createElement("style");
      style.id = "walletSelectorStyle";
      style.textContent = `
        .wallet-option {
          width:100%;
          display:block;
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
    }

    const close = () => {
      overlay.remove();
      resolve(false);
    };

    document.getElementById("walletClose").onclick = close;

    document.getElementById("walletTronLink").onclick = async () => {
      const result = await this.connectTronLink();

      if (result) {
        overlay.remove();
        resolve(true);
      }
    };

    document.getElementById("walletTrust").onclick = async () => {
      const result = await this.connectTrustWallet();

      if (result) {
        overlay.remove();
        resolve(true);
      }
    };

    document.getElementById("walletMore").onclick = async () => {
      const result = await this.connectWalletConnect();

      if (result) {
        overlay.remove();
        resolve(true);
      }
    };
  }

  async connectTronLink() {
    try {
      if (!window.tronLink) {
        this.openTronLink();
        return false;
      }

      const result = await window.tronLink.request({
        method: "tron_requestAccounts"
      });

      if (result && result.code !== 200) {
        throw new Error("Connection rejected");
      }

      await new Promise(resolve => setTimeout(resolve, 700));

      if (!window.tronWeb?.ready) {
        throw new Error("TronLink is not ready");
      }

      this.tronWeb = window.tronWeb;
      this.walletAddress =
        this.tronWeb.defaultAddress?.base58;

      if (!this.walletAddress) {
        throw new Error("Wallet address unavailable");
      }

      this.walletName = "TronLink";
      this.connected = true;
      this.walletAdapter = null;
      this.walletConnect = null;

      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error("TronLink error:", error);
      this.showWalletStatus("اتصال به TronLink انجام نشد.");
      return false;
    }
  }

  async connectTrustWallet() {
    try {
      const adapters =
        window["@tronweb3/tronwallet-adapters"];

      if (!adapters?.TrustAdapter) {
        throw new Error("TrustAdapter is not loaded");
      }

      const adapter = new adapters.TrustAdapter({
        openUrlWhenWalletNotFound: true,
        openAppWithDeeplink: true
      });

      this.showWalletStatus("در حال اتصال به Trust Wallet...");

      await adapter.connect();

      const address = adapter.address;

      if (!address) {
        throw new Error("Trust Wallet address unavailable");
      }

      this.walletAdapter = adapter;
      this.walletConnect = null;
      this.walletAddress = address;
      this.walletName = "Trust Wallet";
      this.connected = true;

      if (window.trustwallet?.tronLink?.tronWeb) {
        this.tronWeb =
          window.trustwallet.tronLink.tronWeb;
      } else if (window.tronWeb) {
        this.tronWeb = window.tronWeb;
      }

      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error("Trust Wallet error:", error);
      this.showWalletStatus(
        "اتصال به Trust Wallet انجام نشد."
      );
      return false;
    }
  }

  async connectWalletConnect() {
    try {
      const adapters =
        window["@tronweb3/tronwallet-adapters"];

      const WalletConnectAdapter =
        adapters?.WalletConnectAdapter;

      if (!WalletConnectAdapter) {
        throw new Error(
          "WalletConnectAdapter is not loaded"
        );
      }

      const adapter = new WalletConnectAdapter({
        network: "Mainnet",

        options: {
          relayUrl: "wss://relay.walletconnect.com",

          projectId:
            "db7319890f24e95d014692e0a729aac9",

          metadata: {
            name: "CryptoDirect",
            description: "CryptoDirect TRON Payment",
            url: window.location.origin,
            icons: []
          }
        }
      });

      this.showWalletStatus(
        "در حال باز کردن لیست کیف پول‌ها..."
      );

      await adapter.connect();

      const address = adapter.address;

      if (!address) {
        throw new Error(
          "WalletConnect address unavailable"
        );
      }

      this.walletConnect = adapter;
      this.walletAdapter = adapter;
      this.walletAddress = address;
      this.walletName = "WalletConnect";
      this.connected = true;

      if (window.tronWeb) {
        this.tronWeb = window.tronWeb;
      } else if (window.TronWeb) {
        this.tronWeb = new window.TronWeb({
          fullHost: "https://api.trongrid.io"
        });
      }

      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error(
        "WalletConnect error:",
        error
      );

      this.showWalletStatus(
        "اتصال کیف پول انجام نشد. دوباره تلاش کنید."
      );

      return false;
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

    window.location.href =
      "tronlinkoutside://call?url=" +
      encodeURIComponent(url);
  }

  async disconnectWallet() {
    try {
      if (this.walletAdapter?.disconnect) {
        await this.walletAdapter.disconnect();
      }
    } catch (e) {
      console.error(e);
    }

    this.connected = false;
    this.walletAddress = null;
    this.tronWeb = null;
    this.walletConnect = null;
    this.walletAdapter = null;
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
        `${this.walletName}: ${short}`;

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
    if (!this.connected || !this.walletAddress) {
      throw new Error(
        "Wallet is not connected"
      );
    }

    const amountInSmallestUnit =
      BigInt(
        Math.round(
          Number(amount) *
          10 ** decimals
        )
      ).toString();

    if (this.walletAdapter?.signTransaction) {
      if (!this.tronWeb) {
        if (window.tronWeb) {
          this.tronWeb = window.tronWeb;
        } else if (window.TronWeb) {
          this.tronWeb = new window.TronWeb({
            fullHost:
              "https://api.trongrid.io"
          });
        }
      }

      if (!this.tronWeb) {
        throw new Error(
          "TronWeb unavailable"
        );
      }

      const transaction =
        await this.tronWeb.transactionBuilder
          .triggerSmartContract(
            usdtContractAddress,
            "transfer(address,uint256)",
            {
              feeLimit: 100_000_000,
              callValue: 0
            },
            [
              {
                type: "address",
                value: toAddress
              },
              {
                type: "uint256",
                value: amountInSmallestUnit
              }
            ],
            this.walletAddress
          );

      const signed =
        await this.walletAdapter.signTransaction(
          transaction.transaction
        );

      return await this.tronWeb.trx
        .sendRawTransaction(signed);
    }

    if (!this.tronWeb) {
      throw new Error(
        "TRON provider unavailable"
      );
    }

    const contract =
      await this.tronWeb
        .contract()
        .at(usdtContractAddress);

    return await contract
      .transfer(
        toAddress,
        amountInSmallestUnit
      )
      .send({
        feeLimit: 100_000_000
      });
  }

  async waitForTransaction(
    txHash,
    timeout = 120000
  ) {
    const startTime = Date.now();

    while (
      Date.now() - startTime <
      timeout
    ) {
      try {
        if (!this.tronWeb) {
          throw new Error(
            "TronWeb unavailable"
          );
        }

        const info =
          await this.tronWeb.trx
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
