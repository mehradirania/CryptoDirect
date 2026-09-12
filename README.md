# CryptoDirect

A simple and secure crypto store for selling digital products with **USDT TRC20** payments.

## 🎯 Features

- ✅ Real USDT TRC20 payment gateway
- ✅ Direct connection to TrustWallet or MetaMask
- ✅ Automatic transaction verification
- ✅ Automatic file download after payment
- ✅ Responsive and modern design
- ✅ English language interface

## 🚀 Quick Start

### 1️⃣ Configure Wallet Address

Open: `config.js`

```javascript
RECIPIENT_ADDRESS: 'YOUR_TRON_ADDRESS', // Enter your Tron address
```

**How to find your Tron address:**
1. Open TrustWallet
2. Click on Tron Network
3. Copy your address (starts with `T`)

### 2️⃣ Add Products

Open: `products.json`

```json
{
  "PRODUCT_ID": {
    "name": "Product Name",
    "description": "Product description",
    "price": 299,
    "image": "assets/product.jpg",
    "file": "https://link-to-download",
    "createdAt": 1726200000
  }
}
```

### 3️⃣ Deploy Website

The website automatically works via GitHub Pages. Just push your changes:

```bash
git add .
git commit -m "Update products"
git push origin main
```

Your site is available at: `https://mehradirania.github.io/CryptoDirect/`

---

## 📁 Project Structure

```
CryptoDirect/
├── index.html           # Main page
├── config.js           # Settings
├── products.json       # Product list
├── scripts/
│   ├── app.js         # Main store logic
│   └── payment.js     # USDT payment gateway
├── assets/
│   └── images/        # Product images
└── README.md          # This file
```

---

## 💳 How It Works

1. **View Products**: User sees products on the main page
2. **Select Product**: User clicks on a product
3. **Connect Wallet**: User connects TrustWallet or MetaMask
4. **Pay**: User clicks the "Pay" button
5. **Verify Transaction**: System waits for transaction confirmation
6. **Download**: After confirmation, download link becomes available

---

## 🔐 Security

- ❌ **No central server** - Everything runs in user's browser
- ❌ **No private key storage** - Wallet is fully user controlled
- ✅ **Transactions on blockchain** - All transactions are verifiable

---

## 📝 Product Example

```json
{
  "A7kD9sBfP2LmQxT4V": {
    "name": "PST Trend Indicator",
    "description": "The best trend-detection indicator in the world",
    "price": 299,
    "image": "assets/IMG_20260621_174250_857.jpg",
    "file": "https://www.dropbox.com/scl/fo/lccpf7saii8ynchui9r8x/...",
    "createdAt": 1726200000
  }
}
```

---

## 🔗 Useful Links

- [Tronscan - Check Transactions](https://tronscan.org)
- [TrustWallet - Download](https://trustwallet.com)
- [USDT TRC20 Contract](https://tronscan.org/address/TR7NHqjeKQxGTCi8q282JHJC8kyziMETPy)

---

## ⚙️ Advanced Settings

If you want to use Testnet, edit `config.js`:

```javascript
TRON_CHAIN_ID: '0xcd8690dc', // Testnet
TRON_RPC_URL: 'https://api.shasta.trongrid.io/jsonrpc',
```

---

## 📞 Support

For questions and issues:
- 🌐 Website: [mehradirania.github.io](https://github.com/mehradirania)
- 📧 Email: mehradirania@gmail.com

---

**Built by Mehrad Irani** 🪙
