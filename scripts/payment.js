/**
 * CryptoDirect Payment
 * TRON / TRC20 / USDT
 */

class CryptoPayment {
  constructor() {
    this.connected = false;
    this.walletAddress = null;
    this.walletName = null;
    this.tronWeb = null;
    this.walletAdapter = null;

    this.init();
  }

  async init() {
    try {
      if (window.TronWeb) {
        this.tronWeb = new window.TronWeb({
          fullHost: "https://api.trongrid.io"
        });
      }

      await this.restoreConnection();
    } catch (error) {
      console.error("Payment initialization error:", error);
    }
  }

  getAdapters() {
    return window["@tronweb3/tronwallet-adapters"] || null;
  }

  async restoreConnection() {
    const adapters = this.getAdapters();

    if (!adapters) {
      console.warn("TRON wallet adapters not loaded.");
      return;
    }

    try {
      const { TronLinkAdapter } = adapters;

      if (TronLinkAdapter) {
        const adapter = new TronLinkAdapter();

        if (adapter.address) {
          this.walletAdapter = adapter;
          this.walletAddress = adapter.address;
          this.walletName = "TronLink";
          this.connected = true;
          this.updateWalletUI();
        }
      }
    } catch (error) {
      console.warn("No existing wallet connection:", error);
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
        background:rgba(0,0,0,.72);
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
      const adapters = this.getAdapters();

      if (!adapters?.TronLinkAdapter) {
        throw new Error("TronLinkAdapter is not loaded.");
      }

      this.showWalletStatus("Connecting to TronLink...");

      const adapter = new adapters.TronLinkAdapter({
        openUrlWhenWalletNotFound: true,
        openAppWithDeeplink: true
      });

      await adapter.connect();

      if (!adapter.address) {
        throw new Error("TronLink address unavailable.");
      }

      this.walletAdapter = adapter;
      this.walletAddress = adapter.address;
      this.walletName = "TronLink";
      this.connected = true;

      this.ensureTronWeb();
      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error("TronLink connection error:", error);

      this.showWalletStatus(
        "اتصال به TronLink انجام نشد."
      );

      return false;
    }
  }

  async connectTrustWallet() {
    try {
      const adapters = this.getAdapters();

      if (!adapters?.TrustAdapter) {
        throw new Error("TrustAdapter is not loaded.");
      }

      this.showWalletStatus(
        "در حال اتصال به Trust Wallet..."
      );

      const adapter = new adapters.TrustAdapter({
        openUrlWhenWalletNotFound: true,
        openAppWithDeeplink: true
      });

      await adapter.connect();

      if (!adapter.address) {
        throw new Error(
          "Trust Wallet address unavailable."
        );
      }

      this.walletAdapter = adapter;
      this.walletAddress = adapter.address;
      this.walletName = "Trust Wallet";
      this.connected = true;

      this.ensureTronWeb();
      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error("Trust Wallet connection error:", error);

      this.showWalletStatus(
        "اتصال به Trust Wallet انجام نشد."
      );

      return false;
    }
  }

  async connectWalletConnect() {
    try {
      const adapters = this.getAdapters();

      if (!adapters?.WalletConnectAdapter) {
        throw new Error(
          "WalletConnectAdapter is not loaded."
        );
      }

      this.showWalletStatus(
        "در حال باز کردن کیف پول‌ها..."
      );

      const adapter =
        new adapters.WalletConnectAdapter({
          network: "Mainnet",

          options: {
            relayUrl:
              "wss://relay.walletconnect.com",

            projectId:
              "db7319890f24e95d014692e0a729aac9",

            metadata: {
              name: "CryptoDirect",
              description:
                "CryptoDirect TRON Payment",
              url: window.location.origin,
              icons: []
            }
          }
        });

      await adapter.connect();

      if (!adapter.address) {
        throw new Error(
          "WalletConnect address unavailable."
        );
      }

      this.walletAdapter = adapter;
      this.walletAddress = adapter.address;
      this.walletName = "WalletConnect";
      this.connected = true;

      this.ensureTronWeb();
      this.updateWalletUI();

      return true;

    } catch (error) {
      console.error(
        "WalletConnect connection error:",
        error
      );

      this.showWalletStatus(
        "اتصال کیف پول انجام نشد."
      );

      return false;
    }
  }

  ensureTronWeb() {
    if (!this.tronWeb && window.TronWeb) {
      this.tronWeb = new window.TronWeb({
        fullHost: "https://api.trongrid.io"
      });
    }

    if (!this.tronWeb) {
      throw new Error(
        "TronWeb is not loaded."
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

  async sendUSDT(
    usdtContractAddress,
    toAddress,
    amount,
    decimals = 6
  ) {
    if (!this.connected) {
      throw new Error(
        "Wallet is not connected."
      );
    }

    if (!this.walletAdapter) {
      throw new Error(
        "Wallet adapter is unavailable."
      );
    }

    this.ensureTronWeb();

    if (!this.tronWeb.isAddress(toAddress)) {
      throw new Error(
        "Invalid recipient TRON address."
      );
    }

    if (
      !this.tronWeb.isAddress(
        usdtContractAddress
      )
    ) {
      throw new Error(
        "Invalid USDT contract address."
      );
    }

    const amountString =
      String(amount);

    if (!/^\d+(\.\d+)?$/.test(amountString)) {
      throw new Error(
        "Invalid payment amount."
      );
    }

    const [whole, fraction = ""] =
      amountString.split(".");

    if (fraction.length > decimals) {
      throw new Error(
        "Amount has too many decimals."
      );
    }

    const smallestUnit =
      BigInt(whole) *
        10n ** BigInt(decimals) +
      BigInt(
        (fraction + "0".repeat(decimals))
          .slice(0, decimals)
      );

    if (smallestUnit <= 0n) {
      throw new Error(
        "Payment amount must be greater than zero."
      );
    }

    const contract =
      await this.tronWeb.contract().at(
        usdtContractAddress
      );

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
              value: smallestUnit.toString()
            }
          ],
          this.walletAddress
        );

    if (!transaction?.result?.result) {
      throw new Error(
        "TRON could not create the transaction."
      );
    }

    if (!transaction.transaction) {
      throw new Error(
        "Unsigned transaction was not created."
      );
    }

    console.log(
      "Unsigned TRON transaction:",
      transaction.transaction
    );

    const signed =
      await this.walletAdapter.signTransaction(
        transaction.transaction
      );

    if (!signed) {
      throw new Error(
        "Wallet did not sign the transaction."
      );
    }

    const broadcast =
      await this.tronWeb.trx
        .sendRawTransaction(signed);

    console.log(
      "TRON broadcast result:",
      broadcast
    );

    if (!broadcast?.result) {
      throw new Error(
        broadcast?.message
          ? this.decodeHexMessage(
              broadcast.message
            )
          : "TRON transaction broadcast failed."
      );
    }

    const txid =
      broadcast.txid ||
      broadcast.transaction?.txID;

    if (!txid) {
      throw new Error(
        "Transaction ID was not returned."
      );
    }

    return txid;
  }

  async waitForTransaction(
    txHash,
    timeout = CONFIG.TX_CONFIRMATION_TIMEOUT
  ) {
    const startTime = Date.now();

    while (
      Date.now() - startTime <
      timeout
    ) {
      try {
        this.ensureTronWeb();

        const info =
          await this.tronWeb.trx
            .getTransactionInfo(txHash);

        if (
          info &&
          info.id === txHash &&
          info.receipt
        ) {
          if (
            info.receipt.result ===
            "SUCCESS"
          ) {
            return "success";
          }

          return "failed";
        }

      } catch (error) {
        console.warn(
          "Transaction check:",
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

    return "timeout";
  }

  async verifyUSDTTransfer(
    txHash,
    expectedSender,
    expectedRecipient,
    expectedAmount,
    usdtContractAddress,
    decimals = 6
  ) {
    this.ensureTronWeb();

    const tx =
      await this.tronWeb.trx
        .getTransaction(txHash);

    const info =
      await this.tronWeb.trx
        .getTransactionInfo(txHash);

    if (!tx || !tx.txID) {
      throw new Error(
        "Transaction not found."
      );
    }

    if (tx.txID !== txHash) {
      throw new Error(
        "Transaction ID mismatch."
      );
    }

    if (
      !info?.receipt ||
      info.receipt.result !== "SUCCESS"
    ) {
      throw new Error(
        "Transaction was not successful."
      );
    }

    const contract =
      tx.raw_data?.contract?.[0];

    if (
      contract?.type !==
      "TriggerSmartContract"
    ) {
      throw new Error(
        "Transaction is not a smart-contract call."
      );
    }

    const value =
      contract.parameter?.value;

    if (!value) {
      throw new Error(
        "Transaction contract data unavailable."
      );
    }

    const contractAddress =
      this.tronWeb.address.fromHex(
        value.contract_address
      );

    if (
      contractAddress !==
      usdtContractAddress
    ) {
      throw new Error(
        "Transaction did not call the configured USDT contract."
      );
    }

    const data =
      value.data || "";

    const selector =
      data.substring(0, 8).toLowerCase();

    if (selector !== "a9059cbb") {
      throw new Error(
        "Transaction is not a TRC20 transfer."
      );
    }

    const encodedRecipient =
      data.substring(8, 72);

    const encodedAmount =
      data.substring(72, 136);

    if (
      encodedRecipient.length !== 64 ||
      encodedAmount.length !== 64
    ) {
      throw new Error(
        "Invalid TRC20 transfer data."
      );
    }

    const recipientHex =
      "41" +
      encodedRecipient.substring(24);

    const actualRecipient =
      this.tronWeb.address.fromHex(
        recipientHex
      );

    if (
      actualRecipient !==
      expectedRecipient
    ) {
      throw new Error(
        "USDT recipient does not match."
      );
    }

    const actualAmount =
      BigInt(
        "0x" + encodedAmount
      );

    const expectedAmountSmallest =
      this.toSmallestUnit(
        expectedAmount,
        decimals
      );

    if (
      actualAmount !==
      expectedAmountSmallest
    ) {
      throw new Error(
        "USDT amount does not match."
      );
    }

    const actualSender =
      this.tronWeb.address.fromHex(
        value.owner_address
      );

    if (
      actualSender !==
      expectedSender
    ) {
      throw new Error(
        "Transaction sender does not match connected wallet."
      );
    }

    const timestamp =
      tx.raw_data?.timestamp;

    const expiration =
      tx.raw_data?.expiration;

    if (!timestamp || !expiration) {
      throw new Error(
        "Transaction timing data unavailable."
      );
    }

    return {
      verified: true,
      txHash,
      sender: actualSender,
      recipient: actualRecipient,
      amount: expectedAmount,
      contract: contractAddress,
      network: "TRON Mainnet"
    };
  }

  toSmallestUnit(
    amount,
    decimals
  ) {
    const value = String(amount);

    const [
      whole,
      fraction = ""
    ] = value.split(".");

    if (!/^\d+$/.test(whole)) {
      throw new Error(
        "Invalid amount."
      );
    }

    if (
      fraction &&
      !/^\d+$/.test(fraction)
    ) {
      throw new Error(
        "Invalid amount."
      );
    }

    if (fraction.length > decimals) {
      throw new Error(
        "Too many decimal places."
      );
    }

    return (
      BigInt(whole) *
        10n ** BigInt(decimals) +
      BigInt(
        (fraction + "0".repeat(decimals))
          .slice(0, decimals)
      )
    );
  }

  decodeHexMessage(message) {
    try {
      return decodeURIComponent(
        message
          .match(/.{1,2}/g)
          .map(byte =>
            "%" + byte
          )
          .join("")
      );
    } catch {
      return message;
    }
  }

  async disconnectWallet() {
    try {
      if (
        this.walletAdapter?.disconnect
      ) {
        await this.walletAdapter.disconnect();
      }
    } catch (error) {
      console.error(
        "Disconnect error:",
        error
      );
    }

    this.connected = false;
    this.walletAddress = null;
    this.walletName = null;
    this.walletAdapter = null;

    this.updateWalletUI();
  }

  updateWalletUI() {
    const dot =
      document.getElementById("walletDot");

    const text =
      document.getElementById("walletText");

    const button =
      document.getElementById(
        "connectWalletBtn"
      );

    if (!text || !button) {
      return;
    }

    if (
      this.connected &&
      this.walletAddress
    ) {
      dot?.classList.remove(
        "disconnected"
      );

      const short =
        this.walletAddress.substring(
          0,
          6
        ) +
        "..." +
        this.walletAddress.substring(
          this.walletAddress.length - 4
        );

      text.textContent =
        `${this.walletName}: ${short}`;

      button.textContent =
        "Disconnect";

    } else {
      dot?.classList.add(
        "disconnected"
      );

      text.textContent =
        "Wallet not connected";

      button.textContent =
        "Connect Wallet";
    }
  }

  getWalletAddress() {
    return this.walletAddress;
  }

  isConnected() {
    return (
      this.connected &&
      !!this.walletAddress
    );
  }
}

const cryptoPayment =
  new CryptoPayment();
