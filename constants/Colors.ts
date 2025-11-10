// Crypto Theme Colors
// Bitcoin Orange: #F7931A
// Ethereum Purple: #627EEA
// Ripple Blue: #23292F
// Cardano Blue: #0033AD

const bitcoinOrange = '#F7931A';
const ethereumPurple = '#627EEA';
const cryptoGray = '#1A1A1A';
const cryptoLightGray = '#F5F5F5';

export default {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: ethereumPurple,
    tabIconDefault: '#999',
    tabIconSelected: bitcoinOrange,
    // Crypto specific
    bitcoin: bitcoinOrange,
    ethereum: ethereumPurple,
    success: '#00D084',
    warning: '#FFA500',
    danger: '#FF4444',
    card: '#F9F9F9',
    border: '#E0E0E0',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D0D0D',
    tint: ethereumPurple,
    tabIconDefault: '#666',
    tabIconSelected: bitcoinOrange,
    // Crypto specific
    bitcoin: '#FFB533',
    ethereum: '#7B93FF',
    success: '#00D084',
    warning: '#FFA500',
    danger: '#FF6B6B',
    card: '#1A1A1A',
    border: '#2A2A2A',
  },
};
