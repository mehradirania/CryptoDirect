openPaymentModal(productId) {
  this.selectedProduct = this.products.find(p => p.id === productId);

  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
    <div class="product-detail-image">
      <img src="${this.selectedProduct.image}">
    </div>

    <div class="product-detail-name">${this.selectedProduct.name}</div>
    <div class="product-detail-price">Choose payment network:</div>

    <button class="pay-button" onclick="app.payTRC20()">
      🟣 Pay with USDT TRC20 (TronLink)
    </button>

    <button class="pay-button" onclick="app.payBEP20()">
      🔵 Pay with USDT BEP20 (Trust Wallet)
    </button>

    <div id="paymentStatus"></div>
  `;

  document.getElementById("paymentModal").classList.add("active");
}

async payTRC20() {
  // همان نسخه قبلی با cryptoPayment (TRON)
  this.initiatePaymentTRC20();
}

async payBEP20() {
  if (!cryptoPaymentBEP20.isConnected()) {
    const addr = await cryptoPaymentBEP20.connect();
    if (!addr) {
      this.showPaymentStatus("❌ Trust Wallet connection failed", "error");
      return;
    }
  }

  try {
    const tx = await cryptoPaymentBEP20.sendUSDT(
      CONFIG_BEP20.RECIPIENT_ADDRESS,
      this.selectedProduct.price
    );

    this.showPaymentStatus(`✅ Transaction sent<br>${tx}`, "success");

  } catch (err) {
    this.showPaymentStatus(`❌ ${err.message}`, "error");
  }
}
