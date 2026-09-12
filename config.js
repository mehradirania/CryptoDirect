/**
 * CryptoDirect Configuration
 * تنظیمات سایت
 */

const CONFIG = {
  // آدرس کیف پول دریافت کننده (آدرس Tron شما)
  RECIPIENT_ADDRESS: 'YOUR_TRON_ADDRESS', // ⬅️ جایگزین کنید
  
  // آدرس قرارداد USDT TRC20 (ثابت)
  USDT_CONTRACT_ADDRESS: 'TA5WHVuqmX36JsftU4q2mQxxmnYSmxQbyN',
  
  // Decimals برای USDT
  USDT_DECIMALS: 6,
  
  // تنظیمات شبکه Tron
  TRON_CHAIN_ID: '0x2b6653dc', // Mainnet
  TRON_RPC_URL: 'https://api.tronstack.io/jsonrpc',
  TRON_EXPLORER: 'https://tronscan.org',
  
  // تنظیمات timeout (میلی‌ثانیه)
  TX_CONFIRMATION_TIMEOUT: 120000, // 2 دقیقه
  TX_CHECK_INTERVAL: 3000, // 3 ثانیه
  
  // متن و پیام
  MESSAGES: {
    WALLET_CONNECTED: 'کیف پول متصل شد',
    WALLET_DISCONNECTED: 'کیف پول قطع شد',
    TX_SENDING: '⏳ در حال ارسال تراکنش...',
    TX_CONFIRMING: '⏳ در حال تأیید تراکنش (می‌تواند چند دقیقه طول بکشد)...',
    TX_SUCCESS: '✅ پرداخت تأیید شد! دسترسی به فایل فعال شد.',
    TX_FAILED: '❌ تراکنش ناموفق بود',
    TX_TIMEOUT: '⏱️ وقت‌گذاری پایان یافت. لطفاً بعداً بررسی کنید.',
    TX_CANCELLED: 'تراکنش توسط کاربر لغو شد',
    WALLET_NOT_CONNECTED: '❌ لطفاً کیف پول خود را وصل کنید',
    INVALID_ADDRESS: '❌ آدرس کیف پول دریافت کننده تنظیم نشده است',
    NO_PROVIDER: 'لطفاً TrustWallet یا MetaMask را نصب کنید',
  }
};

// فرض کنید app.js فایل را بعد از این بارگذاری می‌کند
// سپس می‌توانید از CONFIG استفاده کنید:
// app.recipientAddress = CONFIG.RECIPIENT_ADDRESS;
// app.usdtContractAddress = CONFIG.USDT_CONTRACT_ADDRESS;
