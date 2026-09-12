/**
 * CryptoDirect App
 * Main store logic
 */

class CryptoDirectApp {
  constructor() {
    this.products = [];
    this.selectedProduct = null;
    
    // Use CONFIG
    this.recipientAddress = CONFIG.RECIPIENT_ADDRESS;
    this.usdtContractAddress = CONFIG.USDT_CONTRACT_ADDRESS;
    
    // Check configuration
    this.checkConfiguration();
    this.init();
  }

  /**
   * Check configuration
   */
  checkConfiguration() {
    if (this.recipientAddress === 'YOUR_TRON_ADDRESS') {
      const warningContainer = document.getElementById('warningContainer');
      warningContainer.innerHTML = `
        <div class="warning-message">
          ⚠️ <strong>Warning:</strong> Recipient wallet address not configured!<br/>
          Please enter your Tron address in the <code>config.js</code> file.
        </div>
      `;
    }
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  }

  /**
   * Load products from JSON
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
      console.error('Error loading products:', error);
      document.getElementById('productsContainer').innerHTML = 
        '<div class="no-products">❌ Error loading products</div>';
    }
  }

  /**
   * Render products
   */
  renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (this.products.length === 0) {
      container.innerHTML = '<div class="no-products">📭 No products found</div>';
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
          <div class="product-desc">${product.description || 'No description'}</div>
          <div class="product-price">💰 ${product.price} USDT</div>
          <button class="product-btn">🛒 Buy Now</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Open payment modal
   */
  openPaymentModal(productId) {
    if (this.recipientAddress === 'YOUR_TRON_ADDRESS') {
      alert('❌ Recipient wallet address not configured!\nPlease complete the settings in config.js.');
      return;
    }

    this.selectedProduct = this.products.find(p => p.id === productId);
    
    if (!this.selectedProduct) {
      alert('Product not found');
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
        <strong>📍 Recipient Address:</strong><br/>
        <code>${app.recipientAddress}</code>
        <strong>🌐 Network:</strong> Tron (TRC20)<br/>
        <strong>💱 Currency:</strong> USDT<br/>
        <strong>📊 Amount:</strong> ${this.selectedProduct.price} USDT
      </div>

      <button class="pay-button" id="payNowBtn" onclick="app.initiatePayment()">
        🔒 Pay Securely with Wallet
      </button>

      <div id="paymentStatus"></div>
    `;

    modal.classList.add('active');
  }

  /**
   * Initiate payment
   */
  async initiatePayment() {
    if (!this.selectedProduct) {
      alert('No product selected');
      return;
    }

    // Check wallet connection
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
      // Send USDT transaction
      const txHash = await cryptoPayment.sendUSDT(
        this.usdtContractAddress,
        this.recipientAddress,
        this.selectedProduct.price,
        CONFIG.USDT_DECIMALS
      );

      if (!txHash) {
        throw new Error('Transaction not created');
      }

      console.log('Transaction Hash:', txHash);
      this.showPaymentStatus(`
        ✅ Transaction sent<br/>
        <small style="direction: ltr; font-family: monospace; font-size: 11px;">Hash: ${txHash.substring(0, 20)}...</small><br/>
        <a href="${CONFIG.TRON_EXPLORER}/transaction/${txHash}" target="_blank" style="color: #0284c7; font-size: 12px;">
          🔍 View on Tronscan →
        </a>
      `, 'pending');

      // Check transaction confirmation
      this.showPaymentStatus(CONFIG.MESSAGES.TX_CONFIRMING, 'pending');
      
      const result = await cryptoPayment.waitForTransaction(txHash);

      if (result === 'success') {
        // Transaction confirmed
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
      console.error('Payment error:', error);
      
      let errorMessage = 'Error sending transaction';
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
   * Show download link
   */
  showDownloadLink() {
    const statusDiv = document.getElementById('paymentStatus');
    
    if (this.selectedProduct.file) {
      statusDiv.innerHTML += `
        <div class="download-box">
          <strong>📥 Download File</strong><br/>
          <a href="${this.selectedProduct.file}" target="_blank" style="font-size: 14px; margin-top: 8px; display: inline-block;">
            ⬇️ Click to Download
          </a>
        </div>
      `;
    }
  }

  /**
   * Show payment status message
   */
  showPaymentStatus(message, type) {
    const statusDiv = document.getElementById('paymentStatus');
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
  }

  /**
   * Disable pay button
   */
  disablePayButton(disabled) {
    const btn = document.getElementById('payNowBtn');
    if (btn) {
      btn.disabled = disabled;
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    document.getElementById('paymentModal').classList.remove('active');
    this.selectedProduct = null;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close modal
    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeModal();
    });

    // Close modal on outside click
    document.getElementById('paymentModal').addEventListener('click', (e) => {
      if (e.target.id === 'paymentModal') {
        this.closeModal();
      }
    });

    // Connect wallet button
    document.getElementById('connectWalletBtn').addEventListener('click', () => {
      if (!cryptoPayment.isConnected()) {
        cryptoPayment.connectWallet();
      } else {
        cryptoPayment.disconnectWallet();
      }
    });
  }
}

// Create app instance
const app = new CryptoDirectApp();
