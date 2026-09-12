/**
 * CryptoDirect Payment System
 * درگاه پرداخت واقعی USDT TRC20 با TrustWallet
 */

class CryptoPayment {
  constructor(config = {}) {
    // تنظیمات شبکه و کیف پول
    this.config = {
      chainId: 0x2b6653dc, // Tron mainnet (728126780 in decimal)
      chainHex: '0x2b6653dc',
      rpcUrl: 'https://api.tronstack.io/jsonrpc',
      explorerUrl: 'https://tronscan.org',
      ...config
    };

    // متغیرهای وضعیت
    this.connected = false;
    this.walletAddress = null;
    this.provider = null;
    
    this.init();
  }

  /**
   * شروع سیستم
   */
  async init() {
    this.setupWalletListener();
    this.checkWalletConnection();
  }

  /**
   * بررسی اتصال کیف پول
   */
  async checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = window.ethereum;
      try {
        const accounts = await this.provider.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          this.connected = true;
          this.updateWalletUI();
        }
      } catch (error) {
        console.log('کیف پول متصل نیست');
      }
    }
  }

  /**
   * اتصال کیف پول
   */
  async connectWallet() {
    if (!window.ethereum) {
      alert('لطفاً TrustWallet یا MetaMask را نصب کنید');
      return false;
    }

    try {
      this.provider = window.ethereum;
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.connected = true;
        this.updateWalletUI();
        return true;
      }
    } catch (error) {
      console.error('خطا در اتصال کیف پول:', error);
      return false;
    }
  }

  /**
   * بروزرسانی UI کیف پول
   */
  updateWalletUI() {
    const walletDot = document.getElementById('walletDot');
    const walletText = document.getElementById('walletText');
    const connectBtn = document.getElementById('connectWalletBtn');

    if (this.connected && this.walletAddress) {
      walletDot?.classList.remove('disconnected');
      const shortAddress = this.walletAddress.substring(0, 6) + '...' + this.walletAddress.substring(-4);
      walletText.textContent = `متصل شده: ${shortAddress}`;
      connectBtn.textContent = 'قطع اتصال';
      connectBtn.onclick = () => this.disconnectWallet();
    } else {
      walletDot?.classList.add('disconnected');
      walletText.textContent = 'کیف پول متصل نیست';
      connectBtn.textContent = 'اتصال کیف پول';
      connectBtn.onclick = () => this.connectWallet();
    }
  }

  /**
   * قطع اتصال کیف پول
   */
  disconnectWallet() {
    this.connected = false;
    this.walletAddress = null;
    this.updateWalletUI();
  }

  /**
   * تنظیم listener برای تغییرات کیف پول
   */
  setupWalletListener() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          this.walletAddress = accounts[0];
          this.connected = true;
          this.updateWalletUI();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }

  /**
   * ارسال تراکنش USDT TRC20
   * @param {string} usdtContractAddress - آدرس قرارداد USDT TRC20
   * @param {string} toAddress - آدرس دریافت کننده
   * @param {number} amount - مقدار USDT (بدون decimal)
   * @param {number} decimals - تعداد decimal های USDT (معمولاً 6)
   */
  async sendUSDT(usdtContractAddress, toAddress, amount, decimals = 6) {
    if (!this.connected || !this.walletAddress) {
      alert('لطفاً کیف پول خود را وصل کنید');
      return null;
    }

    try {
      // تبدیل مقدار به smallest unit (با decimals)
      const amountInSmallest = BigInt(amount) * BigInt(10 ** decimals);

      // ABI برای انتقال USDT
      const usdtABI = [
        {
          constant: false,
          inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          type: 'function'
        }
      ];

      // کدگذاری داده تراکنش
      const interface = this.encodeFunctionCall(usdtABI[0], [toAddress, amountInSmallest.toString()]);

      // ارسال درخواست تراکنش
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: this.walletAddress,
            to: usdtContractAddress,
            data: interface,
            gas: '0x5b8d80', // 6M gas
          }
        ]
      });

      return txHash;
    } catch (error) {
      console.error('خطا در ارسال تراکنش:', error);
      throw error;
    }
  }

  /**
   * کدگذاری فراخوانی تابع (Function Call Encoding)
   */
  encodeFunctionCall(functionABI, parameters) {
    // Function selector (اولین 4 bytes از keccak256 hash)
    const selector = '0xa9059cbb'; // selector برای transfer()

    // کدگذاری parameters
    let encodedParams = '';
    
    // آدرس دریافت کننده (pad به 32 bytes)
    encodedParams += parameters[0].slice(2).padStart(64, '0');
    
    // مقدار (pad به 32 bytes)
    let amount = BigInt(parameters[1]).toString(16);
    encodedParams += amount.padStart(64, '0');

    return selector + encodedParams;
  }

  /**
   * بررسی وضعیت تراکنش
   */
  async waitForTransaction(txHash, timeout = 120000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });

        if (receipt) {
          return receipt.status === '0x1' ? 'success' : 'failed';
        }
      } catch (error) {
        console.error('خطا در بررسی تراکنش:', error);
      }

      // صبر 3 ثانیه قبل از بررسی دوباره
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return 'timeout';
  }

  /**
   * دریافت آدرس کیف پول فعلی
   */
  getWalletAddress() {
    return this.walletAddress;
  }

  /**
   * بررسی اتصال
   */
  isConnected() {
    return this.connected;
  }
}

// ایجاد نمونه global
const cryptoPayment = new CryptoPayment({
  // شما می‌توانید آدرس USDT خود را اینجا تنظیم کنید
  // USDT TRC20 Mainnet: TR7NHqjeKQxGTCi8q282JHJC8kyziMETPy
});
