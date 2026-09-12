/**
 * CryptoDirect App
 * منطق اصلی فروشگاه
 */

class CryptoDirectApp {
  constructor() {
    this.products = [];
    this.selectedProduct = null;
    
    // استفاده از CONFIG
    this.recipientAddress = CONFIG.RECIPIENT_ADDRESS;
    this.usdtContractAddress = CONFIG.USDT_CONTRACT_ADDRESS;
    
    // بررسی تنظیمات
    this.checkConfiguration();
    this.init();
  }

  /**
   * بررسی تنظیمات
   */
  checkConfiguration() {
    if (this.recipientAddress === 'YOUR_TRON_ADDRESS') {
      const warningContainer = document.getElementById('warningContainer');
      warningContainer.innerHTML = `
        <div class="warning-message">
          ⚠️ <strong>اخطار:</strong> آدرس کیف پول دریافت کننده تنظیم نشده است!<br/>
          لطفاً در فایل <code>config.js</code> آدرس Tron خود را وارد کنید.
        </div>
      `;
    }
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  }

  /**
   * بارگذاری محصولات از JSON
   */
  async loadProducts() {
    try {
      const response = await fetch('products.json');
      const productsData = await response.json();
      
      this.products = Object.entries(productsData).map(([id, product]) => ({
        id,
        ...product
      }));

      this.renderProducts();
    } catch (error) {
      console.error('خطا در بارگذاری محصولات:', error);
      document.getElementById('productsContainer').innerHTML = 
        '<div class="no-products">❌ خطا در بارگذاری محصولات</div>';
    }
  }

  /**
   * نمایش محصولات
   */
  renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (this.products.length === 0) {
      container.innerHTML = '<div class="no-products">📭 محصولی یافت نشد</div>';
      return;
    }

    container.innerHTML = this.products.map(product => `
      <div class="product-card" onclick="app.openPaymentModal('${product.id}')">
        <div class="product-image">
          ${product.image 
            ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">` 
            : '<span>📦</span>'}
        </div>
        <div class="product-body">
          <div class="product-name">${product.name}</div>
          <div class="product-desc">${product.description || 'بدون توضیح'}</div>
          <div class="product-price">💰 ${product.price} USDT</div>
          <button class="product-btn">🛒 خرید کنید</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * باز کردن modal درگاه پرداخت
   */
  openPaymentModal(productId) {
    if (this.recipientAddress === 'YOUR_TRON_ADDRESS') {
      alert('❌ آدرس کیف پول دریافت کننده تنظیم نشده است!\nلطفاً در config.js تنظیمات را کامل کنید.');
      return;
    }

    this.selectedProduct = this.products.find(p => p.id === productId);
    
    if (!this.selectedProduct) {
      alert('محصول یافت نشد');
      return;
    }

    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('paymentModal');

    modalBody.innerHTML = `
      <div class="product-detail-image">
        ${this.selectedProduct.image 
          ? `<img src="${this.selectedProduct.image}" alt="${this.selectedProduct.name}" onerror="this.style.display='none'">` 
          : '<span>📦</span>'}
      </div>
      <div class="product-detail-name">${this.selectedProduct.name}</div>
      <div class="product-detail-desc">${this.selectedProduct.description || ''}</div>
      <div class="product-detail-price">💰 ${this.selectedProduct.price} USDT (TRC20)</div>

      <div class="payment-info">
        <strong>📍 آدرس دریافت کننده:</strong><br/>
        <code>${app.recipientAddress}</code>
        <strong>🌐 شبکه:</strong> Tron (TRC20)<br/>
        <strong>💱 ارز:</strong> USDT<br/>
        <strong>📊 مقدار:</strong> ${this.selectedProduct.price} USDT
      </div>

      <button class="pay-button" id="payNowBtn" onclick="app.initiatePayment()">
        🔒 پرداخت امن با کیف پول
      </button>

      <div id="paymentStatus"></div>
    `;

    modal.classList.add('active');
  }

  /**
   * شروع پرداخت
   */
  async initiatePayment() {
    if (!this.selectedProduct) {
      alert('محصول انتخاب نشده است');
      return;
    }

    // بررسی اتصال کیف پول
    if (!cryptoPayment.isConnected()) {
      const connected = await cryptoPayment.connectWallet();
      if (!connected) {
        this.showPaymentStatus(CONFIG.MESSAGES.WALLET_NOT_CONNECTED, 'error');
        return;
      }
    }

    this.disablePayButton(true);
    this.showPaymentStatus(CONFIG.MESSAGES.TX_SENDING, 'pending');

    try {
      // ارسال تراکنش USDT
      const txHash = await cryptoPayment.sendUSDT(
        this.usdtContractAddress,
        this.recipientAddress,
        this.selectedProduct.price,
        CONFIG.USDT_DECIMALS
      );

      if (!txHash) {
        throw new Error('تراکنش ایجاد نشد');
      }

      console.log('Transaction Hash:', txHash);
      this.showPaymentStatus(`
        ✅ تراکنش ارسال شد<br/>
        <small style="direction: ltr; font-family: monospace; font-size: 11px;">Hash: ${txHash.substring(0, 20)}...</small><br/>
        <a href="${CONFIG.TRON_EXPLORER}/transaction/${txHash}" target="_blank" style="color: #0284c7; font-size: 12px;">
          🔍 مشاهده در Tronscan →
        </a>
      `, 'pending');

      // بررسی تأیید تراکنش
      this.showPaymentStatus(CONFIG.MESSAGES.TX_CONFIRMING, 'pending');
      
      const result = await cryptoPayment.waitForTransaction(txHash);

      if (result === 'success') {
        // تراکنش تأیید شد
        this.showPaymentStatus(CONFIG.MESSAGES.TX_SUCCESS, 'success');
        this.showDownloadLink();
        this.disablePayButton(false);
      } else if (result === 'failed') {
        this.showPaymentStatus(CONFIG.MESSAGES.TX_FAILED, 'error');
        this.disablePayButton(false);
      } else {
        this.showPaymentStatus(CONFIG.MESSAGES.TX_TIMEOUT, 'error');
        this.disablePayButton(false);
      }
    } catch (error) {
      console.error('خطا در پرداخت:', error);
      
      let errorMessage = 'خطا در ارسال تراکنش';
      if (error.code === 4001) {
        errorMessage = CONFIG.MESSAGES.TX_CANCELLED;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.showPaymentStatus(`❌ ${errorMessage}`, 'error');
      this.disablePayButton(false);
    }
  }

  /**
   * نمایش لینک دانلود
   */
  showDownloadLink() {
    const statusDiv = document.getElementById('paymentStatus');
    
    if (this.selectedProduct.file) {
      statusDiv.innerHTML += `
        <div class="download-box">
          <strong>📥 دانلود فایل</strong><br/>
          <a href="${this.selectedProduct.file}" target="_blank" style="font-size: 14px; margin-top: 8px; display: inline-block;">
            ⬇️ کلیک برای دانلود
          </a>
        </div>
      `;
    }
  }

  /**
   * نمایش پیام وضعیت
   */
  showPaymentStatus(message, type) {
    const statusDiv = document.getElementById('paymentStatus');
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
  }

  /**
   * غیرفعال کردن دکمه پرداخت
   */
  disablePayButton(disabled) {
    const btn = document.getElementById('payNowBtn');
    if (btn) {
      btn.disabled = disabled;
    }
  }

  /**
   * بستن modal
   */
  closeModal() {
    document.getElementById('paymentModal').classList.remove('active');
    this.selectedProduct = null;
  }

  /**
   * تنظیم event listeners
   */
  setupEventListeners() {
    // بستن modal
    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeModal();
    });

    // بستن modal با کلیک بیرون
    document.getElementById('paymentModal').addEventListener('click', (e) => {
      if (e.target.id === 'paymentModal') {
        this.closeModal();
      }
    });

    // اتصال دکمه کیف پول
    document.getElementById('connectWalletBtn').addEventListener('click', () => {
      if (!cryptoPayment.isConnected()) {
        cryptoPayment.connectWallet();
      } else {
        cryptoPayment.disconnectWallet();
      }
    });
  }
}

// ایجاد نمونه app
const app = new CryptoDirectApp();
