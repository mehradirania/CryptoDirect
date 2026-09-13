/**
 * CryptoDirect Configuration
 */

»const CONFIG = {
  // Recipient wallet address (Your Tron address)
  RECIPIENT_ADDRESS: 'TA5WHVuqmX36JsftU4q2mQxxmnYSmxQbyN', // ✅ Your address
  
  // USDT TRC20 contract address (fixed)
  USDT_CONTRACT_ADDRESS: 'TR7NHqjeKQxGTCi8q282JHJC8kyWyU9g7K', // ✅ Official USDT contract address
  
  // Decimals for USDT
  USDT_DECIMALS: 6,
  
  // Tron network settings
  TRON_CHAIN_ID: '0x2b6653dc', // Mainnet
  TRON_RPC_URL: 'https://api.tronstack.io/jsonrpc',
  TRON_EXPLORER: 'https://tronscan.org',
  
  // Timeout settings (milliseconds)
  TX_CONFIRMATION_TIMEOUT: 120000, // 2 minutes
  TX_CHECK_INTERVAL: 3000, // 3 seconds
  
  // Messages and text
  MESSAGES: {
    WALLET_CONNECTED: 'Wallet connected',
    WALLET_DISCONNECTED: 'Wallet disconnected',
    TX_SENDING: '⏳ Sending transaction...',
    TX_CONFIRMING: '⏳ Confirming transaction (may take a few minutes)...',
    TX_SUCCESS: '✅ Payment confirmed! File access enabled.',
    TX_FAILED: '❌ Transaction failed',
    TX_TIMEOUT: '⏱️ Timeout. Please check back later.',
    TX_CANCELLED: 'Transaction cancelled by user',
    WALLET_NOT_CONNECTED: '❌ Please connect your wallet',
    INVALID_ADDRESS: '❌ Recipient wallet address not configured',
    NO_PROVIDER: 'Please install TrustWallet or MetaMask',
  }
// Assume app.js loads this file after
// Then you can use CONFIG:
// app.recipientAddress = CONFIG.RECIPIENT_ADDRESS;
// app.usdtContractAddress = CONFIG.USDT_CONTRACT_ADDRESS;
):
»const wallet = product.wallet;
»const amount = product.price;

// نمایش مقدار
document.getElementById("amountBox").textContent = amount;

// نمایش آدرس کیف پول
document.getElementById("walletAddress").textContent = wallet;

// ساخت QR Code
document.getElementById("qrImage").src =
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=tron:${wallet}?amount=${amount}`;

// دکمه کپی
document.getElementById("copyWallet").onclick = () => {
  navigator.clipboard.writeText(wallet);
  alert("Wallet address copied!");
};

// دکمه باز کردن کیف پول (TronLink / TokenPocket / OKX / TrustWallet)
document.getElementById("openWallet").onclick = () => {
  window.location.href = `tronlink://send?to=${wallet}&amount=${amount}&token=USDT`;
};
