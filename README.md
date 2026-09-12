# CryptoDirect

یک فروشگاه کریپتو ساده و امن برای فروش محصولات دیجیتالی با پرداخت **USDT TRC20**.

## 🎯 ویژگی‌ها

- ✅ درگاه پرداخت واقعی USDT TRC20
- ✅ اتصال مستقیم به TrustWallet یا MetaMask
- ✅ تأیید خودکار تراکنش
- ✅ دانلود خودکار فایل بعد از پرداخت
- ✅ طراحی ریسپانسیو و مدرن
- ✅ رابط فارسی

## 🚀 شروع سریع

### 1️⃣ تنظیم آدرس کیف پول

باز کنید: `config.js`

```javascript
RECIPIENT_ADDRESS: 'YOUR_TRON_ADDRESS', // آدرس Tron خود را وارد کنید
```

**نحوه پیدا کردن آدرس Tron:**
1. TrustWallet را باز کنید
2. روی Tron Network کلیک کنید
3. آدرس را کپی کنید (شروع می‌شود با `T`)

### 2️⃣ اضافه کردن محصولات

باز کنید: `products.json`

```json
{
  "PRODUCT_ID": {
    "name": "نام محصول",
    "description": "توضیح محصول",
    "price": 299,
    "image": "assets/product.jpg",
    "file": "https://link-to-download",
    "createdAt": 1726200000
  }
}
```

### 3️⃣ راه‌اندازی سایت

سایت به صورت خودکار از GitHub Pages کار می‌کند. فقط push کنید:

```bash
git add .
git commit -m "Update products"
git push origin main
```

سایت شما در دسترس است: `https://mehradirania.github.io/CryptoDirect/`

---

## 📁 ساختار پروژه

```
CryptoDirect/
├── index.html           # صفحه اصلی
├── config.js           # تنظیمات
├── products.json       # لیست محصولات
├── scripts/
│   ├── app.js         # منطق اصلی فروشگاه
│   └── payment.js     # درگاه پرداخت USDT
├── assets/
│   └── images/        # تصاویر محصولات
└── README.md          # این فایل
```

---

## 💳 نحوه کار

1. **مشاهده محصولات**: کاربر محصولات را در صفحه اصلی می‌بیند
2. **انتخاب محصول**: روی محصول کلیک می‌کند
3. **اتصال کیف پول**: TrustWallet یا MetaMask را متصل می‌کند
4. **پرداخت**: روی دکمه "پرداخت" کلیک می‌کند
5. **تأیید تراکنش**: سیستم منتظر تأیید تراکنش در شبکه است
6. **دانلود**: بعد از تأیید، لینک دانلود فعال می‌شود

---

## 🔐 امنیت

- ❌ **بدون سرور مرکزی** - همه چیز در مرورگر کاربر انجام می‌شود
- ❌ **بدون ذخیره کلید پرایوت** - کیف پول کاملاً کنترل کاربر است
- ✅ **تراکنش بر روی بلاک‌چین** - همه تراکنش‌ها قابل تأیید هستند

---

## 📝 مثال محصول

```json
{
  "A7kD9sBfP2LmQxT4V": {
    "name": "PST Trend Indicator",
    "description": "بهترین اندیکاتور تشخیص روند جهان",
    "price": 299,
    "image": "assets/IMG_20260621_174250_857.jpg",
    "file": "https://www.dropbox.com/scl/fo/lccpf7saii8ynchui9r8x/...",
    "createdAt": 1726200000
  }
}
```

---

## 🔗 لینک‌های مفید

- [Tronscan - بررسی تراکنش‌ها](https://tronscan.org)
- [TrustWallet - دانلود](https://trustwallet.com)
- [USDT TRC20 Contract](https://tronscan.org/address/TR7NHqjeKQxGTCi8q282JHJC8kyziMETPy)

---

## ⚙️ تنظیمات پیشرفته

اگر می‌خواهید شبکه Testnet استفاده کنید، `config.js` را ویرایش کنید:

```javascript
TRON_CHAIN_ID: '0xcd8690dc', // Testnet
TRON_RPC_URL: 'https://api.shasta.trongrid.io/jsonrpc',
```

---

## 📞 پشتیبانی

برای سوالات و مشکلات:
- 🌐 وب‌سایت: [mehradirania.github.io](https://github.com/mehradirania)
- 📧 ایمیل: mehradirania@gmail.com

---

**ساخته شده توسط Mehrad Irani** 🪙
