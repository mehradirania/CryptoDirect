/**
 * CryptoDirect Payment System
 * Real USDT TRC20 payment gateway with TrustWallet
 */

class CryptoPayment {
  constructor(config = {}) {
    // Network and wallet settings
    this.config = {
      chainId: 0x2b6653dc, // Tron mainnet (728126780 in decimal)
      chainHex: '0x2b6653dc',
      rpcUrl: 'https://api.tronstack.io/jsonrpc',
      explorerUrl: 'https://tronscan.org',
      ...config
    };

    // State variables
    this.connected = false;
    this.walletAddress = null;
    this.provider = null;
    this.currentChainId = null;
    
    this.init();
  }

  /**
   * Initialize system
   */
  async init() {
    this.setupWalletListener();
    this.checkWalletConnection();
  }

  /**
   * Check wallet connection
   */
  async checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = window.ethereum;
      try {
        // Get wallet addresses
        const accounts = await this.provider.request({
          method: 'eth_accounts'
        });
        
        // Get current chain ID
        const chainId = await this.provider.request({
          method: 'eth_chainId'
        });
        this.currentChainId = chainId;

        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          this.connected = true;
          this.updateWalletUI();
        }
      } catch (error) {
        console.log('Wallet not connected');
      }
    }
  }

  /**
   * Switch network to Tron
   */
  async switchToTronNetwork() {
    if (!this.provider) {
      alert('Please install TrustWallet or MetaMask');
      return false;
    }

    try {
      // Try to switch network
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.config.chainHex }],
      });
      return true;
    } catch (switchError) {
      // If network not added yet
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: this.config.chainHex,
                chainName: 'Tron Mainnet',
                nativeCurrency: {
                  name: 'TRX',
                  symbol: 'TRX',
                  decimals: 18,
                },
                rpcUrls: [this.config.rpcUrl],
                blockExplorerUrls: [this.config.explorerUrl],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  }

  /**
   * Check current network
   */
  async isOnTronNetwork() {
    if (!this.provider) return false;
    
    try {
      const chainId = await this.provider.request({
        method: 'eth_chainId'
      });
      // Check for Tron mainnet or testnet
      return chainId === this.config.chainHex || chainId === '0xcd8690dc';
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    if (!window.ethereum) {
      alert('Please install TrustWallet or MetaMask');
      return false;
    }

    try {
      this.provider = window.ethereum;
      
      // First switch to Tron network
      const switchedToTron = await this.switchToTronNetwork();
      if (!switchedToTron) {
        alert('❌ Could not connect to Tron network.\nPlease select Tron network in TrustWallet.');
        return false;
      }

      // Now request wallet
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
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('❌ Wallet connection cancelled');
      } else {
        alert('❌ Error connecting wallet: ' + error.message);
      }
      return false;
    }
  }

  /**
   * Update wallet UI
   */
  updateWalletUI() {
    const walletDot = document.getElementById('walletDot');
    const walletText = document.getElementById('walletText');
    const connectBtn = document.getElementById('connectWalletBtn');

    if (this.connected && this.walletAddress) {
      walletDot?.classList.remove('disconnected');
      const shortAddress = this.walletAddress.substring(0, 6) + '...' + this.walletAddress.substring(-4);
      walletText.textContent = `Connected: ${shortAddress}`;
      connectBtn.textContent = 'Disconnect';
      connectBtn.onclick = () => this.disconnectWallet();
    } else {
      walletDot?.classList.add('disconnected');
      walletText.textContent = 'Wallet not connected';
      connectBtn.textContent = 'Connect Wallet';
      connectBtn.onclick = () => this.connectWallet();
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet() {
    this.connected = false;
    this.walletAddress = null;
    this.updateWalletUI();
  }

  /**
   * Setup listener for wallet changes
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

      window.ethereum.on('chainChanged', (chainId) => {
        this.currentChainId = chainId;
        // Check if network is Tron
        if (chainId !== this.config.chainHex && chainId !== '0xcd8690dc') {
          alert('⚠️ Please select Tron network');
        }
      });
    }
  }

  /**
   * Send USDT TRC20 transaction
   * @param {string} usdtContractAddress - USDT TRC20 contract address
   * @param {string} toAddress - Recipient address
   * @param {number} amount - USDT amount (without decimals)
   * @param {number} decimals - USDT decimals (usually 6)
   */
  async sendUSDT(usdtContractAddress, toAddress, amount, decimals = 6) {
    if (!this.connected || !this.walletAddress) {
      alert('❌ Please connect your wallet');
      return null;
    }

    // Check network
    const onTron = await this.isOnTronNetwork();
    if (!onTron) {
      const switched = await this.switchToTronNetwork();
      if (!switched) {
        alert('❌ Please connect to Tron network');
        return null;
      }
    }

    try {
      // Convert amount to smallest unit (with decimals)
      const amountInSmallest = BigInt(amount) * BigInt(10 ** decimals);

      // ABI for USDT transfer
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

      // Encode transaction data
      const interface = this.encodeFunctionCall(usdtABI[0], [toAddress, amountInSmallest.toString()]);

      // Send transaction request
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
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Encode function call
   */
  encodeFunctionCall(functionABI, parameters) {
    // Function selector (first 4 bytes of keccak256 hash)
    const selector = '0xa9059cbb'; // selector for transfer()

    // Encode parameters
    let encodedParams = '';
    
    // Recipient address (pad to 32 bytes)
    encodedParams += parameters[0].slice(2).padStart(64, '0');
    
    // Amount (pad to 32 bytes)
    let amount = BigInt(parameters[1]).toString(16);
    encodedParams += amount.padStart(64, '0');

    return selector + encodedParams;
  }

  /**
   * Wait for transaction confirmation
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
        console.error('Error checking transaction:', error);
      }

      // Wait 3 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return 'timeout';
  }

  /**
   * Get current wallet address
   */
  getWalletAddress() {
    return this.walletAddress;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }
}

// Create global instance
const cryptoPayment = new CryptoPayment({
  // You can set your USDT address here
  // USDT TRC20 Mainnet: TR7NHqjeKQxGTCi8q282JHJC8kyziMETPy
});
