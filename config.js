/**
 * CryptoDirect Configuration
 */

const CONFIG = {
  RECIPIENT_ADDRESS: 'TA5WHVuqmX36JsftU4q2mQxxmnYSmxQbyN',

  // Official USDT TRC20 contract
  USDT_CONTRACT_ADDRESS: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',

  USDT_DECIMALS: 6,

  TRON_EXPLORER: 'https://tronscan.org',

  TX_CONFIRMATION_TIMEOUT: 120000,
  TX_CHECK_INTERVAL: 3000,

  MESSAGES: {
    WALLET_CONNECTED: 'Wallet connected',
    WALLET_DISCONNECTED: 'Wallet disconnected',
    TX_SENDING: '⏳ Sending transaction...',
    TX_CONFIRMING: '⏳ Confirming transaction...',
    TX_SUCCESS: '✅ Payment confirmed!',
    TX_FAILED: '❌ Transaction failed',
    TX_TIMEOUT: '⏱️ Transaction confirmation timed out.',
    TX_CANCELLED: 'Transaction cancelled by user',
    WALLET_NOT_CONNECTED: '❌ Please connect your wallet',
    INVALID_ADDRESS: '❌ Recipient wallet address not configured',
    NO_PROVIDER: 'Please install a compatible TRON wallet'
  }
};
